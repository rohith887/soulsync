const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
require('dotenv').config();
const { createToken, generateRefreshToken } = require('../auth/jwt');
const passport = require('../src/passport');
const UserSettings = require('../models/UserSettings');
const UserPreference = require('../models/UserPreference');

//UPDATE PROFILE
const updateProfile = async (req, res) => {
  const userId = req.user.id; // Now, req.user.id should be available
  const allowedFields = ['firstName', 'lastName', 'bio', 'age', 'gender', 'location', 'occupation', 'education', 'company', 'photoUrl', 'instagram', 'spotifyArtists', 'prompt', 'promptResponse'];

  const updates = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update(updates);
    res.json({ success: true, message: "Profile updated", data: user });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

//GET PROFILE
const getProfile = async(req,res)=>{
    const user = await User.findByPk(req.user.id);
    res.json({ success:true,profile: user})
}


//DELETE PHOTO
const deletePhoto = async (req, res) => {
  await User.update({ photoUrl: null }, { where: { id: req.user.id } });
  res.json({ success: true, message: 'Photo removed' });
};

//UPLOAD PHOTO
const uploadPhoto = async (req, res) => {
  await User.update({ photoUrl: req.file.path }, { where: { id: req.user.id } });
  res.json({ success: true, message: 'Photo uploaded' });
};

//UPDATE PROMPT RESPONSE
const updatePromptResponse = async (req, res) => {
  const { prompt, response } = req.body;
  await User.update({ prompt, promptResponse: response }, { where: { id: req.user.id } });
  res.json({ success: true, message: 'Prompt response saved' });
};

//UPDATE LOCATION
const updateLocation = async (req, res) => {
  await User.update({ location: req.body.location }, { where: { id: req.user.id } });
  res.json({ success: true, message: 'Location updated' });
};


//DELETE ACCOUNT
const deleteAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.json({ success: true, message: "Account deleted permanently" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting account", error: error.message });
  }
};

module.exports={
    updateProfile,
    getProfile,
    uploadPhoto,
    deletePhoto,
    updatePromptResponse,
    updateLocation,
    deleteAccount
}
