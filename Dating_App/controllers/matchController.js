const { Op } = require('sequelize');
const User = require('../models/User');
const Swipe = require('../models/Swipe');
const Match = require('../models/Match');
const Message = require('../models/Message');
const UserPreference = require('../models/UserPreference');
const Subscription = require('../models/Subscription');
const ProfileVisit   = require('../models/ProfileVisit'); 

// Helper function to check if user is subscribed
const isUserSubscribed = async (userId) => {
  const subscription = await Subscription.findOne({
    where: {
      userId,
      status: 'active',
      expiresAt: { [Op.gte]: new Date() }
    }
  });
  return !!subscription;
};

// Helper function to check daily swipe limit
const checkSwipeLimit = async (userId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const swipeCount = await Swipe.count({
    where: {
      userId,
      createdAt: { [Op.gte]: startOfDay }
    }
  });

  return swipeCount < 10;
};

// Helper function to check daily message limit
const checkMessageLimit = async (userId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const messageCount = await Message.count({
    where: {
      senderId: userId,
      createdAt: { [Op.gte]: startOfDay }
    }
  });

  return messageCount < 25;
};

exports.getMatchSuggestions = async (req, res, next) => {
  const userId = req.user.id;
  const mode = req.user.mode || "date";

  try {
    const userPreferences = await UserPreference.findOne({ where: { userId, mode } });

    const swipedUsers = await Swipe.findAll({
      where: { userId },
      attributes: ['targetUserId'],
    });
    const swipedUserIds = swipedUsers.map(s => s.targetUserId);
    swipedUserIds.push(userId);

    const preferenceFilters = {
      id: { [Op.notIn]: swipedUserIds },
      mode
    };

    // ... preference filters (same as before)

    const suggestions = await User.findAll({
      where: preferenceFilters,
      attributes: ['id', 'username', 'firstName', 'gender', 'photoUrl'],
      limit: 20,
    });

    res.json({ message: 'Match suggestions', suggestions });
  } catch (err) {
    next(err);
  }
};

exports.swipe = async (req, res, next) => {
  const targetUserId = req.params.userId;
  const { liked } = req.body;
  const userId = req.user.id;
  const mode = req.user.mode || "date";

  if (userId === parseInt(targetUserId)) {
    return res.status(400).json({ error: 'Cannot swipe yourself' });
  }

  try {
    const isSubscribed = await isUserSubscribed(userId);
    if (!isSubscribed && !await checkSwipeLimit(userId)) {
      return res.status(403).json({ error: 'Daily swipe limit reached' });
    }

    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

    const swipe = await Swipe.create({ userId, targetUserId, liked, isSuperSwipe: false, mode });

    if (liked) {
      const theirSwipe = await Swipe.findOne({
        where: { userId: targetUserId, targetUserId: userId, liked: true, mode, isSuperSwipe: false }
      });

      if (theirSwipe) {
        const existingMatch = await Match.findOne({
          where: {
            [Op.or]: [
              { userId, targetUserId },
              { userId: targetUserId, targetUserId: userId },
            ],
            status: 'matched',
            mode
          },
        });

        if (!existingMatch) {
          await Match.create({ userId, targetUserId, status: 'matched', mode });
        }
      }
    }

    res.json({ message: 'Swipe recorded', swipe });
  } catch (err) {
    next(err);
  }
};

exports.superSwipe = async (req, res, next) => {
  const { targetUserId } = req.body;
  const userId = req.user.id;
  const mode = req.user.mode || "date";

  try {
    const isSubscribed = await isUserSubscribed(userId);
    if (!isSubscribed) {
      return res.status(403).json({ error: 'SuperSwipe is only available for subscribed users' });
    }

    if (userId === parseInt(targetUserId)) {
      return res.status(400).json({ error: 'Cannot SuperSwipe yourself' });
    }

    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

    const swipe = await Swipe.create({
      userId,
      targetUserId,
      liked: true,
      isSuperSwipe: true,
      mode
    });

    const existingMatch = await Match.findOne({
      where: {
        [Op.or]: [
          { userId, targetUserId },
          { userId: targetUserId, targetUserId: userId },
        ],
        status: 'matched',
        mode
      },
    });

    if (!existingMatch) {
      await Match.create({ userId, targetUserId, status: 'matched', mode });
    }

    res.json({ message: 'SuperSwipe recorded and match created', swipe });
  } catch (err) {
    next(err);
  }
};

exports.checkMatch = async (req, res, next) => {
  const { targetUserId } = req.body;
  const userId = req.user.id;
  const mode = req.user.mode || "date";

  try {
    const mySwipe = await Swipe.findOne({ where: { userId, targetUserId, liked: true, mode } });
    if (!mySwipe) return res.json({ message: 'No like found for this user' });

    const theirSwipe = await Swipe.findOne({ where: { userId: targetUserId, targetUserId: userId, liked: true, mode } });

    const existingMatch = await Match.findOne({
      where: {
        [Op.or]: [
          { userId, targetUserId },
          { userId: targetUserId, targetUserId: userId },
        ],
        status: 'matched',
        mode
      },
    });

    if (theirSwipe && !existingMatch) {
      const match = await Match.create({ userId, targetUserId, status: 'matched', mode });
      return res.json({ message: 'Match created!', match });
    }

    return res.json({ message: existingMatch ? 'Match already exists' : 'No match found' });
  } catch (err) {
    console.error('❌ Sequelize Error in checkMatch:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.sendFirstMessage = async (req, res, next) => {
  const { matchId, message } = req.body;
  const senderId = req.user.id;
  const mode = req.user.mode || "date";

  try {
    const isSubscribed = await isUserSubscribed(senderId);
    if (!isSubscribed && !await checkMessageLimit(senderId)) {
      return res.status(403).json({ error: 'Daily message limit reached' });
    }

    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    if (match.mode !== mode) {
      return res.status(403).json({ error: 'Unauthorized: mode mismatch' });
    }

    if (match.expiresAt && new Date() > match.expiresAt) {
      await match.destroy();
      return res.status(400).json({ error: 'Match expired' });
    }

    const [user, targetUser] = await Promise.all([
      User.findByPk(match.userId),
      User.findByPk(match.targetUserId),
    ]);

    if (
      user.gender !== targetUser.gender &&
      user.gender === 'male' &&
      senderId === user.id &&
      !match.firstMessageSent &&
      mode === 'date'
    ) {
      return res.status(403).json({ error: 'Women must send the first message' });
    }

    await Message.create({
      senderId,
      receiverId: match.userId === senderId ? match.targetUserId : match.userId,
      content: message,
      matchId,
      type: 'text'
    });

    match.firstMessageSent = true;
    match.expiresAt = null;
    await match.save();

    res.json({ message: 'First message sent, match confirmed!' });
  } catch (err) {
    next(err);
  }
};

exports.setOpeningMove = async (req, res, next) => {
  const { matchId, openingMove } = req.body;
  const userId = req.user.id;
  const mode = req.user.mode || "date";

  try {
    const match = await Match.findByPk(matchId);
    if (!match || (match.userId !== userId && match.targetUserId !== userId)) {
      return res.status(404).json({ error: 'Match not found or unauthorized' });
    }

    if (match.mode !== mode) {
      return res.status(403).json({ error: 'Unauthorized: mode mismatch' });
    }

    match.openingMove = openingMove;
    await match.save();

    res.json({ message: 'Opening Move set successfully', match });
  } catch (err) {
    next(err);
  }
};

exports.respondOpeningMove = async (req, res, next) => {
  const { matchId, response } = req.body;
  const userId = req.user.id;
  const mode = req.user.mode || "date";

  try {
    const isSubscribed = await isUserSubscribed(userId);
    if (!isSubscribed && !await checkMessageLimit(userId)) {
      return res.status(403).json({ error: 'Daily message limit reached' });
    }

    const match = await Match.findByPk(matchId);
    if (!match || (match.userId !== userId && match.targetUserId !== userId)) {
      return res.status(404).json({ error: 'Match not found or unauthorized' });
    }

    if (match.mode !== mode) {
      return res.status(403).json({ error: 'Unauthorized: mode mismatch' });
    }

    if (!match.openingMove) {
      return res.status(400).json({ error: 'No Opening Move set' });
    }

    await Message.create({
      senderId: userId,
      receiverId: match.userId === userId ? match.targetUserId : match.userId,
      content: response,
      matchId,
      type: 'text'
    });

    match.openingMoveResponse = response;
    match.firstMessageSent = true;
    match.expiresAt = null;
    await match.save();

    res.json({ message: 'Opening Move responded', match });
  } catch (err) {
    next(err);
  }
};


exports.getBeeline = async (req, res, next) => {
  const userId = req.user.id;
  const mode = req.user.mode || "date";

  try {
    const likes = await Swipe.findAll({
      where: {
        targetUserId: userId,
        liked: true,
        mode
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'photoUrl'],
        },
      ],
    });

    res.json({ message: 'Users who liked you', likes });
  } catch (err) {
    next(err);
  }
};

exports.updateLocation = async (req, res) => {
  const { location } = req.body;
  if (!location) {
    return res.status(400).json({ success: false, error: 'location is required' });
  }

  try {
    const [updatedRows] = await User.update(
      { location },
      { where: { id: req.user.id } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, location });
  } catch (err) {
    console.error('updateLocation error:', err);
    return res.status(500).json({ success: false, error: 'Could not update location' });
  }
};


exports.discoverUsers = async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.user.id);
    if (!currentUser || !currentUser.location) {
      return res.status(400).json({ success: false, error: 'Your location is not set' });
    }

    const users = await User.findAll({
      where: {
        location: currentUser.location,
        id: { [Op.ne]: req.user.id }
      },
      limit: 20
    });

    return res.json({ success: true, users });
  } catch (err) {
    console.error('discoverUsers error:', err);
    return res.status(500).json({ success: false, error: 'Could not discover users' });
  }
};

exports.getFilters = async (req, res) => {
  res.json({ filters: ['distance', 'age', 'gender', 'verified'] });
};

exports.applyFilters = async (req, res) => {
  const filters = req.body;
  const where = {};

  if (filters.age) where.age = { [Op.between]: filters.age };
  if (filters.gender) where.gender = filters.gender;
  if (filters.verified) where.isVerified = filters.verified;

  const users = await User.findAll({ where });
  res.json({ success: true, users });
};


exports.likesSent = async (req, res) => {
  const swipes = await Swipe.findAll({ where: { userId: req.user.id, liked: true } });
  res.json({ success: true, swipes });
};

exports.likesReceived = async (req, res) => {
  const swipes = await Swipe.findAll({ where: { targetUserId: req.user.id, liked: true } });
  res.json({ success: true, swipes });
};

exports.getMatches = async (req, res) => {
  const matches = await Match.findAll({
    where: {
      [Op.or]: [
        { userId: req.user.id },
        { targetUserId: req.user.id }
      ],
      status: 'matched'
    }
  });
  res.json({ success: true, matches });
};

exports.unmatchUser = async (req, res) => {
  const { matchId } = req.params;
  await Match.destroy({ where: { id: matchId } });
  res.json({ success: true, message: 'Unmatched' });
};


exports.searchUsers = async (req, res) => {
  const { q } = req.query;
  const users = await User.findAll({
    where: {
      [Op.or]: [
        { username: { [Op.like]: `%${q}%` } },
        { firstName: { [Op.like]: `%${q}%` } }
      ]
    },
    limit: 10
  });
  res.json({ success: true, users });
};

exports.getSwipeHistory = async (req, res) => {
  const history = await Swipe.findAll({ where: { userId: req.user.id } });
  res.json({ success: true, history });
};

exports.getProfileVisits = async (req, res) => {
  try {
    const visits = await ProfileVisit.findAll({
      where: { visitedId: req.user.id }
    });
    res.json({ success: true, visits });
  } catch (err) {
    console.error('getProfileVisits error:', err);
    res.status(500).json({ success: false, error: 'Could not fetch profile visits' });
  }
};



