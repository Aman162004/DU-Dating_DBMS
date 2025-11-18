#!/usr/bin/env node

/**
 * Migration script to update profiles table with new fields
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'du_dating',
  user: process.env.DB_USER || 'amanraj',
  password: process.env.DB_PASSWORD || '',
});

async function migrate() {
  try {
    console.log('🔄 Running database migration...\n');

    // Add new columns if they don't exist
    await pool.query(`
      ALTER TABLE profiles
      ADD COLUMN IF NOT EXISTS profile_picture_2_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS profile_picture_3_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS height INTEGER,
      ADD COLUMN IF NOT EXISTS relationship_goal VARCHAR(50),
      ADD COLUMN IF NOT EXISTS education_level VARCHAR(100),
      ADD COLUMN IF NOT EXISTS occupation VARCHAR(100),
      ADD COLUMN IF NOT EXISTS hobbies TEXT[],
      ADD COLUMN IF NOT EXISTS lifestyle_drinking VARCHAR(50),
      ADD COLUMN IF NOT EXISTS lifestyle_smoking VARCHAR(50),
      ADD COLUMN IF NOT EXISTS lifestyle_exercise VARCHAR(50),
      ADD COLUMN IF NOT EXISTS personality_traits TEXT[],
      ADD COLUMN IF NOT EXISTS looking_for TEXT;
    `);

    console.log('✅ Added new columns to profiles table\n');

    // Set default values for existing records
    await pool.query(`
      UPDATE profiles 
      SET personality_traits = ARRAY[]::TEXT[]
      WHERE personality_traits IS NULL;
    `);

    await pool.query(`
      UPDATE profiles 
      SET hobbies = ARRAY[]::TEXT[]
      WHERE hobbies IS NULL;
    `);

    console.log('✅ Updated existing records with default values\n');
    console.log('✅ Migration complete!\n');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
migrate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
