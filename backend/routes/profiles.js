const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// Get all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Error fetching profiles' });
  }
});

// Create a new profile
router.post('/', async (req, res) => {
  try {
    const { name, imageUrl, details } = req.body;
    
    // Create the profile
    const profile = new Profile({
      name,
      imageUrl: imageUrl || null,
      details: details || ''
    });
    
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Error creating profile', error: error.message });
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
    const result = await Profile.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json({ message: 'Profile deleted' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Error deleting profile' });
  }
});

module.exports = router;