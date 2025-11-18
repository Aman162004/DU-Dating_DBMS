import express from 'express';
import { query, getClient } from '../db.js';

const router = express.Router();

// GET /api/profile - Get logged-in user's profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT 
        u.user_id, u.email, u.first_name, u.created_at,
        c.college_id, c.college_name,
        p.bio, p.profile_picture_url, p.gender, p.seeking, p.date_of_birth
       FROM users u
       JOIN colleges c ON u.college_id = c.college_id
       LEFT JOIN profiles p ON u.user_id = p.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get user interests
    const interestsResult = await query(
      `SELECT i.interest_id, i.interest_name
       FROM user_interests ui
       JOIN interests i ON ui.interest_id = i.interest_id
       WHERE ui.user_id = $1`,
      [userId]
    );

    const profile = {
      ...result.rows[0],
      interests: interestsResult.rows
    };

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// PUT /api/profile - Update logged-in user's profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bio, gender, seeking, date_of_birth, profile_picture_url, interest_ids } = req.body;

    // Update profile
    const result = await query(
      `UPDATE profiles 
       SET bio = $1, gender = $2, seeking = $3, date_of_birth = $4, profile_picture_url = $5
       WHERE user_id = $6
       RETURNING *`,
      [bio, gender, seeking, date_of_birth, profile_picture_url, userId]
    );

    // Update interests if provided
    if (interest_ids && Array.isArray(interest_ids)) {
      // Delete existing interests
      await query('DELETE FROM user_interests WHERE user_id = $1', [userId]);

      // Insert new interests
      if (interest_ids.length > 0) {
        const values = interest_ids.map((interestId, index) => 
          `($1, $${index + 2})`
        ).join(', ');
        
        await query(
          `INSERT INTO user_interests (user_id, interest_id) VALUES ${values}`,
          [userId, ...interest_ids]
        );
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// GET /api/users/potential - Get potential matches (users to swipe on)
router.get('/users/potential', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get current user's profile data for matching
    const currentUserResult = await query(
      `SELECT 
        p.gender, p.seeking, p.relationship_goal, p.lifestyle_drinking, 
        p.lifestyle_smoking, p.lifestyle_exercise, p.personality_traits
       FROM profiles p
       WHERE p.user_id = $1`,
      [userId]
    );

    const currentUser = currentUserResult.rows[0] || {};

    // Get current user's interests
    const currentUserInterests = await query(
      `SELECT interest_id FROM user_interests WHERE user_id = $1`,
      [userId]
    );
    const currentUserInterestIds = currentUserInterests.rows.map(r => r.interest_id);

    // Complex SQL query to get users who:
    // 1. Are not the current user
    // 2. Have not been swiped on by the current user yet
    // 3. Have a complete profile
    // 4. Match the seeking preference (case-insensitive)
    const result = await query(
      `SELECT 
        u.user_id, u.first_name, 
        c.college_name,
        p.bio, p.profile_picture_url, p.profile_picture_2_url, p.profile_picture_3_url,
        p.gender, p.seeking, p.relationship_goal, p.height, p.occupation,
        p.lifestyle_drinking, p.lifestyle_smoking, p.lifestyle_exercise,
        p.personality_traits, p.looking_for,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth)) AS age
       FROM users u
       JOIN colleges c ON u.college_id = c.college_id
       JOIN profiles p ON u.user_id = p.user_id
       WHERE u.user_id != $1
         AND u.user_id NOT IN (
           SELECT swiped_id FROM swipes WHERE swiper_id = $1
         )
         AND p.bio IS NOT NULL
         AND p.gender IS NOT NULL
         AND p.profile_picture_url IS NOT NULL
         AND (
           $2::VARCHAR IS NULL 
           OR LOWER($2) = 'everyone' 
           OR LOWER(p.gender) = LOWER($2)
         )
       ORDER BY RANDOM()
       LIMIT 20`,
      [userId, currentUser.seeking || null]
    );

    // Calculate match percentage and get matched qualities for each user
    for (let user of result.rows) {
      // Get interests for this user
      const interestsResult = await query(
        `SELECT i.interest_id, i.interest_name
         FROM user_interests ui
         JOIN interests i ON ui.interest_id = i.interest_id
         WHERE ui.user_id = $1`,
        [user.user_id]
      );
      user.interests = interestsResult.rows;

      // Calculate matched qualities
      const matchedQualities = [];
      let matchScore = 0;

      // Check common interests
      const userInterestIds = user.interests.map(i => i.interest_id);
      const commonInterests = user.interests.filter(i => 
        currentUserInterestIds.includes(i.interest_id)
      );
      
      if (commonInterests.length > 0) {
        matchedQualities.push({
          type: 'interests',
          label: `${commonInterests.length} Shared Interest${commonInterests.length > 1 ? 's' : ''}`,
          items: commonInterests.map(i => i.interest_name)
        });
        matchScore += (commonInterests.length / Math.max(currentUserInterestIds.length, userInterestIds.length)) * 40;
      }

      // Check personality traits
      if (currentUser.personality_traits && user.personality_traits) {
        const commonTraits = currentUser.personality_traits.filter(trait => 
          user.personality_traits.includes(trait)
        );
        if (commonTraits.length > 0) {
          matchedQualities.push({
            type: 'traits',
            label: `${commonTraits.length} Common Trait${commonTraits.length > 1 ? 's' : ''}`,
            items: commonTraits
          });
          matchScore += (commonTraits.length / Math.max(currentUser.personality_traits.length, user.personality_traits.length)) * 30;
        }
      }

      // Check relationship goal
      if (currentUser.relationship_goal && user.relationship_goal && 
          currentUser.relationship_goal === user.relationship_goal) {
        matchedQualities.push({
          type: 'goal',
          label: 'Same Relationship Goal',
          items: [user.relationship_goal]
        });
        matchScore += 15;
      }

      // Check lifestyle compatibility
      const lifestyleMatches = [];
      if (currentUser.lifestyle_drinking && user.lifestyle_drinking && 
          currentUser.lifestyle_drinking === user.lifestyle_drinking) {
        lifestyleMatches.push(`Both ${user.lifestyle_drinking.toLowerCase()} drink`);
      }
      if (currentUser.lifestyle_smoking && user.lifestyle_smoking && 
          currentUser.lifestyle_smoking === user.lifestyle_smoking) {
        lifestyleMatches.push(`Both ${user.lifestyle_smoking.toLowerCase()} smoke`);
      }
      if (currentUser.lifestyle_exercise && user.lifestyle_exercise && 
          currentUser.lifestyle_exercise === user.lifestyle_exercise) {
        lifestyleMatches.push(`Both exercise ${user.lifestyle_exercise.toLowerCase()}`);
      }
      
      if (lifestyleMatches.length > 0) {
        matchedQualities.push({
          type: 'lifestyle',
          label: 'Lifestyle Compatibility',
          items: lifestyleMatches
        });
        matchScore += lifestyleMatches.length * 5;
      }

      user.matchedQualities = matchedQualities;
      user.matchScore = Math.min(Math.round(matchScore), 100);
    }

    // Sort by match score
    result.rows.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      users: result.rows
    });

  } catch (error) {
    console.error('Error fetching potential matches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching potential matches'
    });
  }
});

// POST /api/swipe - Swipe on a user
router.post('/swipe', async (req, res) => {
  try {
    const swiperId = req.user.userId;
    const { swiped_id, action } = req.body;

    // Validation
    if (!swiped_id || !action) {
      return res.status(400).json({
        success: false,
        message: 'Please provide swiped_id and action'
      });
    }

    if (!['like', 'dislike'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be "like" or "dislike"'
      });
    }

    if (swiperId === swiped_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot swipe on yourself'
      });
    }

    // Insert swipe
    await query(
      'INSERT INTO swipes (swiper_id, swiped_id, action) VALUES ($1, $2, $3)',
      [swiperId, swiped_id, action]
    );

    let isMatch = false;

    // If action is 'like', check for mutual match
    if (action === 'like') {
      const mutualLike = await query(
        `SELECT swiper_id FROM swipes 
         WHERE swiper_id = $1 AND swiped_id = $2 AND action = 'like'`,
        [swiped_id, swiperId]
      );

      if (mutualLike.rows.length > 0) {
        isMatch = true;

        // Create match (ensure user1_id < user2_id for uniqueness)
        const user1 = Math.min(swiperId, swiped_id);
        const user2 = Math.max(swiperId, swiped_id);

        await query(
          'INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [user1, user2]
        );
      }
    }

    res.json({
      success: true,
      match: isMatch,
      message: isMatch ? "It's a match!" : 'Swipe recorded'
    });

  } catch (error) {
    console.error('Error processing swipe:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing swipe'
    });
  }
});

// GET /api/matches - Get all matches for the logged-in user
router.get('/matches', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all matches where user is either user1 or user2
    const result = await query(
      `SELECT 
        m.match_id, m.match_time,
        CASE 
          WHEN m.user1_id = $1 THEN m.user2_id 
          ELSE m.user1_id 
        END AS matched_user_id,
        u.first_name,
        c.college_name,
        p.profile_picture_url, p.bio
       FROM matches m
       JOIN users u ON (
         CASE 
           WHEN m.user1_id = $1 THEN m.user2_id 
           ELSE m.user1_id 
         END = u.user_id
       )
       JOIN colleges c ON u.college_id = c.college_id
       LEFT JOIN profiles p ON u.user_id = p.user_id
       WHERE m.user1_id = $1 OR m.user2_id = $1
       ORDER BY m.match_time DESC`,
      [userId]
    );

    res.json({
      success: true,
      matches: result.rows
    });

  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching matches'
    });
  }
});

// GET /api/messages/:match_id - Get messages for a specific match
router.get('/messages/:match_id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const matchId = req.params.match_id;

    // Verify user is part of this match
    const matchCheck = await query(
      'SELECT * FROM matches WHERE match_id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [matchId, userId]
    );

    if (matchCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this match'
      });
    }

    // Get messages
    const result = await query(
      `SELECT 
        msg.message_id, msg.message_text, msg.sent_time,
        msg.sender_id,
        u.first_name AS sender_name,
        (msg.sender_id = $1) AS is_me
       FROM messages msg
       JOIN users u ON msg.sender_id = u.user_id
       WHERE msg.match_id = $2
       ORDER BY msg.sent_time ASC`,
      [userId, matchId]
    );

    res.json({
      success: true,
      messages: result.rows
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// POST /api/messages - Send a new message
router.post('/messages', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { match_id, message_text } = req.body;

    // Validation
    if (!match_id || !message_text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide match_id and message_text'
      });
    }

    // Verify user is part of this match
    const matchCheck = await query(
      'SELECT * FROM matches WHERE match_id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [match_id, userId]
    );

    if (matchCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this match'
      });
    }

    // Insert message
    const result = await query(
      `INSERT INTO messages (match_id, sender_id, message_text) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [match_id, userId, message_text]
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// GET /api/interests - Get all available interests
router.get('/interests', async (req, res) => {
  try {
    const result = await query(
      'SELECT interest_id, interest_name FROM interests ORDER BY interest_name'
    );

    res.json({
      success: true,
      interests: result.rows
    });
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interests'
    });
  }
});

export default router;
