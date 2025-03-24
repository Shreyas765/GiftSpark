// routes/recommendations.js
// This part definetlety needs to be changed. 
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const axios = require('axios');

// Get gift recommendations for a specific profile
router.post('/:profileId', async (req, res) => {
  try {
    const { occasion, budget, additionalInfo } = req.body;
    
    // Get the profile
    const profile = await Profile.findById(req.params.profileId);
    
    // Check if profile exists
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    
    // Prepare data for AI recommendation
    const recommendationData = {
      profileData: {
        name: profile.name,
        details: profile.details,
        previousGifts: profile.previousGifts,
      },
      requestData: {
        occasion,
        budget,
        additionalInfo,
      },
    };
    
    // Call your AI recommendation service here
    // This is a placeholder - you'll need to replace this with your actual AI service
    try {
      const aiResponse = await axios.post(
        process.env.AI_RECOMMENDATION_ENDPOINT,
        recommendationData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.AI_API_KEY}`,
          },
        }
      );
      
      res.json(aiResponse.data);
    } catch (aiError) {
      console.error('AI recommendation error:', aiError);
      res.status(500).json({ msg: 'Error getting AI recommendations' });
    }
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;