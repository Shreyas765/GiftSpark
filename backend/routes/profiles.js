const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');

// Get all profiles for a user
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profiles = await Profile.find({ userId: user._id });
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Error fetching profiles' });
  }
});

// Create a new profile
router.post('/', async (req, res) => {
  try {
    const { userId, name, imageUrl } = req.body;

    const user = await User.findOne({ email: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = new Profile({
      userId: user._id,
      name,
      imageUrl,
    });

    await profile.save();

    // Add profile to user's profiles array
    user.giftProfiles.push(profile._id);
    await user.save();

    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Error creating profile' });
  }
});

// Update a profile
router.patch('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    Object.assign(profile, req.body);
    profile.updatedAt = Date.now();
    
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Delete a profile
router.delete('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Remove profile from user's profiles array
    await User.findByIdAndUpdate(profile.userId, {
      $pull: { giftProfiles: profile._id }
    });

    await profile.remove();
    res.json({ message: 'Profile deleted' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Error deleting profile' });
  }
});

module.exports = router; 