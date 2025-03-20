// routes/recommendations.js
// This part definetlety needs to be changed. 
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GiftProfile = require('../models/GiftProfile');
const axios = require('axios');

// Get gift recommendations for a specific profile
router.post('/:profileId', auth, async (req, res) => {
  try {
    const { occasion, budget, additionalInfo } = req.body;
    
    // Get the gift profile
    const giftProfile = await GiftProfile.findById(req.params.profileId);
    
    // Check if gift profile exists
    if (!giftProfile) {
      return res.status(404).json({ msg: 'Gift profile not found' });
    }
    
    // Check if user owns the gift profile
    if (giftProfile.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Prepare data for AI recommendation
    const recommendationData = {
      profileData: {
        name: giftProfile.name,
        relationship: giftProfile.relationship,
        age: giftProfile.age,
        gender: giftProfile.gender,
        interests: giftProfile.interests,
        previousGifts: giftProfile.previousGifts,
      },
      requestData: {
        occasion,
        budget: budget || giftProfile.budget,
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
      return res.status(404).json({ msg: 'Gift profile not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;