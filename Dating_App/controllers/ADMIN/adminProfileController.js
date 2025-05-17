const User = require('../../models/User');
const { Op } = require('sequelize');
const csv = require('csv-parser');
const fs = require('fs');

const createProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const profileCount = await User.count({ where: { createdByAdminId: adminId } });

    if (profileCount >= 50) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Profile limit (50) reached for this admin",
      });
    }

    const { firstName, age, gender, location, bio, interests, prompts, isVerified, isFeatured, isPopular } = req.body;
    
    const user = await User.create({
      firstName,
      age,
      gender,
      location,
      bio,
      interests,
      prompts,
      isVerified: !!isVerified,
      isFeatured: !!isFeatured,
      isPopular: !!isPopular,
      createdByAdminId: adminId,
      isFake: true
    });

    res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Profile created successfully.",
      data: user,
    });

  } catch (err) {
    console.error("Error creating profile:", err);
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
};

const batchUploadProfiles = async (req, res) => {
  try {
    const adminId = req.user.id;
    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const existingProfileCount = await User.count({ where: { createdByAdminId: adminId } });

          if (existingProfileCount + results.length > 50) {
            return res.status(400).json({
              statusCode: 400,
              success: false,
              message: "Batch exceeds profile limit (50) for this admin"
            });
          }

          const users = await Promise.all(results.map(async (row) => {
            return await User.create({
              firstName: row.firstName,
              age: row.age,
              gender: row.gender,
              location: row.location,
              bio: row.bio,
              isVerified: row.isVerified === 'true',
              isFeatured: row.isFeatured === 'true',
              isPopular: row.isPopular === 'true',
              createdByAdminId: adminId,
              isFake: true
            });
          }));

          // âœ… Respond here after users are created
          return res.status(201).json({
            statusCode: 201,
            success: true,
            message: "Batch profiles created successfully.",
            count: users.length,
            data: users
          });

        } catch (err) {
          console.error("Error creating users from batch:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to create users",
            error: err.message
          });
        }
      });
  } catch (err) {
    console.error("Error processing file:", err);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};



// 1. Update Profile
const updateProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const adminId = req.user.id; // ðŸ”§ use consistent key

    const updated = await User.update(req.body, {
      where: { id: profileId, createdByAdminId: adminId },
    });

    if (updated[0] === 0) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Profile not found or not authorized.",
      });
    }

    res.json({
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
};


// 2. Delete Profile
const deleteProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const adminId = req.user.id;

    const deleted = await User.destroy({
      where: {
        id: profileId,
        createdByAdminId: adminId,
      },
    });

    if (!deleted) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Profile not found or not authorized.",
      });
    }

    res.json({ success: true, message: "Profile deleted successfully" });
  } catch (err) {
    console.error("Error deleting profile:", err);
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
};

// 3. Get All Profiles Created by This Admin
const getProfiles = async (req, res) => {
  try {
    const adminId = req.user.id;

    const profiles = await User.findAll({
      where: { createdByAdminId: adminId },
      attributes: [
        "id",
        "firstName",
        "age",
        "bio",
        "interests",
        "prompts",
        "gender",
        "location",
        "isVerified",
        "isFeatured",
        "isPopular",
        "isFake"
      ],
    });

    res.status(201).json({ 
        statusCode:201,
        success: true, profiles });
  } catch (err) {
    console.error("Error fetching profiles:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// 🎯 Get Fake Users
const getFakeUsers = async (req, res) => {
  try {
    const { limit, offset, order } = parsePagination(req);

    const { count, rows } = await User.findAndCountAll({
      where: { isFake: true },
      attributes: userAttributes,
      limit,
      offset,
      order
    });

    res.json({
      success: true,
      count,
      limit,
      offset,
      data: rows
    });
  } catch (err) {
    console.error('Error fetching fake users:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const parsePagination = (req) => ({
    limit: parseInt(req.query.limit) || 20,
    offset: parseInt(req.query.offset) || 0,
     order: [[req.query.sortBy || 'createdAt', req.query.order === 'asc' ? 'ASC' : 'DESC']],
})

const userAttributes = [
  'id', 'username', 'firstName', 'age', 'gender', 'location',
  'isVerified', 'isFeatured', 'isPopular', 'isFake', 'createdAt'
];


// 🎯 Get Real Users
const getRealUsers = async (req, res) => {
  try {
    const { limit, offset, order } = parsePagination(req);

    const { count, rows } = await User.findAndCountAll({
      where: { isFake: false },
      attributes: userAttributes,
      limit,
      offset,
      order
    });

    res.json({
      success: true,
      count,
      limit,
      offset,
      data: rows
    });
  } catch (err) {
    console.error('Error fetching real users:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// 🎯 Get Reported Users
const getReportedUsers = async (req, res) => {
  try {
    const { limit, offset, order } = parsePagination(req);

    const { count, rows } = await User.findAndCountAll({
      where: { status: 'reported' },
      attributes: userAttributes,
      limit,
      offset,
      order
    });

    res.json({
      success: true,
      count,
      limit,
      offset,
      data: rows
    });
  } catch (err) {
    console.error('Error fetching reported users:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

 module.exports = {
  createProfile,
  batchUploadProfiles,
  updateProfile,
  deleteProfile,
  getProfiles,
  getReportedUsers,
  getRealUsers,
  getFakeUsers
};
