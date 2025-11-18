import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { 
      email, password, first_name, college_id,
      date_of_birth, gender, bio, height, seeking, relationship_goal, occupation,
      lifestyle_drinking, lifestyle_smoking, lifestyle_exercise,
      interest_ids, personality_traits, looking_for,
      profile_picture_url, profile_picture_2_url, profile_picture_3_url
    } = req.body;

    // Validation
    if (!email || !password || !first_name || !college_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if email is valid DU email
    if (!/@.*\.du\.ac\.in$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email must be a valid DU email (*.du.ac.in)'
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT user_id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if college exists
    const collegeExists = await query(
      'SELECT college_id FROM colleges WHERE college_id = $1',
      [college_id]
    );

    if (collegeExists.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid college ID'
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const insertUserResult = await query(
      `INSERT INTO users (email, password_hash, first_name, college_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING user_id, email, first_name, college_id, created_at`,
      [email.toLowerCase(), password_hash, first_name, college_id]
    );

    const newUser = insertUserResult.rows[0];

    // Create detailed profile for the user
    await query(
      `INSERT INTO profiles (
        user_id, bio, profile_picture_url, profile_picture_2_url, profile_picture_3_url,
        gender, seeking, date_of_birth, height, relationship_goal, occupation,
        lifestyle_drinking, lifestyle_smoking, lifestyle_exercise,
        personality_traits, looking_for
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        newUser.user_id, bio, profile_picture_url, profile_picture_2_url, profile_picture_3_url,
        gender, seeking, date_of_birth, height, relationship_goal, occupation,
        lifestyle_drinking, lifestyle_smoking, lifestyle_exercise,
        personality_traits || [], looking_for
      ]
    );

    // Insert user interests
    if (interest_ids && Array.isArray(interest_ids) && interest_ids.length > 0) {
      const values = interest_ids.map((interestId, index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      await query(
        `INSERT INTO user_interests (user_id, interest_id) VALUES ${values}`,
        [newUser.user_id, ...interest_ids]
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: newUser.user_id,
        email: newUser.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        user_id: newUser.user_id,
        email: newUser.email,
        first_name: newUser.first_name,
        college_id: newUser.college_id
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get user from database
    const result = await query(
      `SELECT u.user_id, u.email, u.password_hash, u.first_name, u.college_id, c.college_name
       FROM users u
       JOIN colleges c ON u.college_id = c.college_id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.user_id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        college_id: user.college_id,
        college_name: user.college_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
});

// GET /api/auth/colleges - Public endpoint to get list of colleges
router.get('/colleges', async (req, res) => {
  try {
    const result = await query(
      'SELECT college_id, college_name FROM colleges ORDER BY college_name'
    );

    res.json({
      success: true,
      colleges: result.rows
    });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching colleges'
    });
  }
});

// GET /api/interests - Public endpoint to get list of interests
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
