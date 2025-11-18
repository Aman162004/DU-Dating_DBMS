#!/usr/bin/env node

/**
 * Database Seeder Script
 * Seeds the database with 25 dummy user profiles
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Read the seed SQL file
    const seedFilePath = join(__dirname, 'database', 'seed_users.sql');
    const seedSQL = await fs.readFile(seedFilePath, 'utf-8');

    console.log('📄 Executing seed SQL file...');

    // Execute the seed SQL
    await pool.query(seedSQL);

    console.log('✅ Successfully seeded 25 dummy user profiles!');
    console.log('📊 Database now contains:');
    console.log('   • 25 users across various DU colleges');
    console.log('   • Profile details with bios and interests');
    console.log('   • Sample swipes and matches');
    console.log('   • Sample chat messages');
    console.log('\n🎉 Database seeding complete!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run seeder
seedDatabase();
