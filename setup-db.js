#!/usr/bin/env node

/**
 * Quick Database Setup and Seed
 * This script checks if users exist and seeds if needed
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

async function checkAndSeed() {
  try {
    console.log('🔍 Checking database...\n');

    // Check if users exist
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const count = parseInt(userCount.rows[0].count);

    console.log(`📊 Current users in database: ${count}\n`);

    if (count >= 25) {
      console.log('✅ Database already has enough users!');
      console.log('   No need to seed.\n');
      await pool.end();
      return;
    }

    console.log('🌱 Seeding database with dummy users...\n');

    // Seed users
    await seedUsers();

    console.log('\n✅ Database seeding complete!\n');
    
    // Show final count
    const finalCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`📊 Total users now: ${finalCount.rows[0].count}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

async function seedUsers() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Insert users
    console.log('   Adding 25 users...');
    const usersData = [
      { email: 'aarav.sharma@srcc.du.ac.in', first_name: 'Aarav', college_id: 1 },
      { email: 'diya.patel@stephens.du.ac.in', first_name: 'Diya', college_id: 2 },
      { email: 'vihaan.kumar@hindu.du.ac.in', first_name: 'Vihaan', college_id: 3 },
      { email: 'ananya.singh@miranda.du.ac.in', first_name: 'Ananya', college_id: 4 },
      { email: 'arjun.reddy@lsr.du.ac.in', first_name: 'Arjun', college_id: 5 },
      { email: 'isha.verma@ramjas.du.ac.in', first_name: 'Isha', college_id: 6 },
      { email: 'rohan.gupta@hansraj.du.ac.in', first_name: 'Rohan', college_id: 7 },
      { email: 'priya.jain@kmc.du.ac.in', first_name: 'Priya', college_id: 8 },
      { email: 'kabir.malhotra@dcac.du.ac.in', first_name: 'Kabir', college_id: 9 },
      { email: 'sara.chopra@jmc.du.ac.in', first_name: 'Sara', college_id: 10 },
      { email: 'aditya.mehta@gargi.du.ac.in', first_name: 'Aditya', college_id: 11 },
      { email: 'kavya.nair@daulatram.du.ac.in', first_name: 'Kavya', college_id: 12 },
      { email: 'ryan.das@kamala.du.ac.in', first_name: 'Ryan', college_id: 13 },
      { email: 'meera.shah@sbsc.du.ac.in', first_name: 'Meera', college_id: 14 },
      { email: 'aryan.kapoor@srcc.du.ac.in', first_name: 'Aryan', college_id: 1 },
      { email: 'tara.bose@stephens.du.ac.in', first_name: 'Tara', college_id: 2 },
      { email: 'karan.saxena@hindu.du.ac.in', first_name: 'Karan', college_id: 3 },
      { email: 'riya.menon@miranda.du.ac.in', first_name: 'Riya', college_id: 4 },
      { email: 'dhruv.iyer@lsr.du.ac.in', first_name: 'Dhruv', college_id: 5 },
      { email: 'alisha.rao@ramjas.du.ac.in', first_name: 'Alisha', college_id: 6 },
      { email: 'arnav.pillai@hansraj.du.ac.in', first_name: 'Arnav', college_id: 7 },
      { email: 'kiara.desai@kmc.du.ac.in', first_name: 'Kiara', college_id: 8 },
      { email: 'shaurya.pandey@dcac.du.ac.in', first_name: 'Shaurya', college_id: 9 },
      { email: 'zara.ahuja@jmc.du.ac.in', first_name: 'Zara', college_id: 10 },
      { email: 'vedant.sinha@gargi.du.ac.in', first_name: 'Vedant', college_id: 11 },
    ];

    for (const user of usersData) {
      await client.query(
        'INSERT INTO users (email, password_hash, first_name, college_id) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
        [user.email, '$2b$10$examplehash1234567890abcdefghijklmnopqrstuv', user.first_name, user.college_id]
      );
    }

    console.log('   ✓ Users added');

    // Get user IDs
    const userIds = await client.query('SELECT user_id FROM users ORDER BY user_id LIMIT 25');
    const ids = userIds.rows.map(r => r.user_id);

    // Add profiles
    console.log('   Adding profiles...');
    const profiles = [
      { bio: 'Commerce student who loves hiking and photography 📸🏔️', gender: 'Male', dob: '2003-05-15', pic: 'https://i.pravatar.cc/400?img=12' },
      { bio: 'English literature enthusiast. Coffee addict ☕', gender: 'Female', dob: '2003-08-22', pic: 'https://i.pravatar.cc/400?img=5' },
      { bio: 'Physics major with a passion for music 🎸', gender: 'Male', dob: '2002-11-30', pic: 'https://i.pravatar.cc/400?img=33' },
      { bio: 'Psychology student. Love painting and art 🎨', gender: 'Female', dob: '2003-03-18', pic: 'https://i.pravatar.cc/400?img=9' },
      { bio: 'Economics geek by day, dancer by night 💃', gender: 'Male', dob: '2003-07-25', pic: 'https://i.pravatar.cc/400?img=15' },
      { bio: 'Political science major. Debate champion 🏆', gender: 'Female', dob: '2002-12-10', pic: 'https://i.pravatar.cc/400?img=20' },
      { bio: 'Chemistry nerd who loves cooking 🧪👨‍🍳', gender: 'Male', dob: '2003-04-07', pic: 'https://i.pravatar.cc/400?img=52' },
      { bio: 'History buff and travel junkie ✈️', gender: 'Female', dob: '2003-09-14', pic: 'https://i.pravatar.cc/400?img=23' },
      { bio: 'Tech enthusiast and app developer 💻', gender: 'Male', dob: '2002-10-28', pic: 'https://i.pravatar.cc/400?img=68' },
      { bio: 'Fashion design student 👗', gender: 'Female', dob: '2003-06-05', pic: 'https://i.pravatar.cc/400?img=27' },
      { bio: 'Mathematics wizard and chess player ♟️', gender: 'Male', dob: '2003-01-20', pic: 'https://i.pravatar.cc/400?img=56' },
      { bio: 'Sociology major who loves social work 😊', gender: 'Female', dob: '2002-08-16', pic: 'https://i.pravatar.cc/400?img=32' },
      { bio: 'Sports management. Fitness freak 💪🏏', gender: 'Male', dob: '2003-02-11', pic: 'https://i.pravatar.cc/400?img=14' },
      { bio: 'Journalism student. Storyteller at heart 📝', gender: 'Female', dob: '2003-10-03', pic: 'https://i.pravatar.cc/400?img=45' },
      { bio: 'Finance bro with a soft side 🌅', gender: 'Male', dob: '2002-09-27', pic: 'https://i.pravatar.cc/400?img=57' },
      { bio: 'Philosophy student 🤔', gender: 'Female', dob: '2003-05-09', pic: 'https://i.pravatar.cc/400?img=38' },
      { bio: 'Biology major and nature lover 🌿', gender: 'Male', dob: '2003-11-23', pic: 'https://i.pravatar.cc/400?img=60' },
      { bio: 'Performing arts. Theater is my passion 🎭', gender: 'Female', dob: '2002-07-18', pic: 'https://i.pravatar.cc/400?img=16' },
      { bio: 'Business student. Entrepreneurial mindset 💼', gender: 'Male', dob: '2003-04-30', pic: 'https://i.pravatar.cc/400?img=51' },
      { bio: 'Film studies student and movie buff 🎬', gender: 'Female', dob: '2003-12-01', pic: 'https://i.pravatar.cc/400?img=26' },
      { bio: 'CS major. Gamer 🎮 and anime lover', gender: 'Male', dob: '2002-06-14', pic: 'https://i.pravatar.cc/400?img=70' },
      { bio: 'Architecture student 🏗️', gender: 'Female', dob: '2003-03-26', pic: 'https://i.pravatar.cc/400?img=44' },
      { bio: 'Environmental science major 🌍💚', gender: 'Male', dob: '2003-08-08', pic: 'https://i.pravatar.cc/400?img=13' },
      { bio: 'Marketing student. Dog lover 🐕', gender: 'Female', dob: '2002-10-19', pic: 'https://i.pravatar.cc/400?img=29' },
      { bio: 'Law student and aspiring lawyer ⚖️', gender: 'Male', dob: '2003-01-05', pic: 'https://i.pravatar.cc/400?img=59' },
    ];

    for (let i = 0; i < Math.min(ids.length, profiles.length); i++) {
      await client.query(
        'INSERT INTO profiles (user_id, bio, gender, seeking, date_of_birth, profile_picture_url) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (user_id) DO UPDATE SET bio = $2, gender = $3, date_of_birth = $5, profile_picture_url = $6',
        [ids[i], profiles[i].bio, profiles[i].gender, profiles[i].gender === 'Male' ? 'Female' : 'Male', profiles[i].dob, profiles[i].pic]
      );
    }

    console.log('   ✓ Profiles added');

    // Add interests
    console.log('   Adding interests...');
    const interestSets = [
      [4, 8, 11], [7, 14, 1], [1, 13, 10], [12, 4, 7], [5, 1, 15],
      [3, 7, 13], [9, 13, 1], [8, 4, 7], [13, 10, 1], [14, 12, 4],
      [13, 10, 7], [8, 11, 1], [2, 11, 13], [7, 4, 15], [13, 8, 1],
      [7, 12, 3], [8, 11, 4], [6, 1, 5], [13, 8, 11], [15, 1, 7],
      [10, 13, 15], [12, 4, 8], [8, 11, 2], [14, 13, 8], [7, 3, 13]
    ];

    for (let i = 0; i < Math.min(ids.length, interestSets.length); i++) {
      for (const interestId of interestSets[i]) {
        await client.query(
          'INSERT INTO user_interests (user_id, interest_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [ids[i], interestId]
        );
      }
    }

    console.log('   ✓ Interests added');

    await client.query('COMMIT');
    console.log('   ✓ Transaction committed');

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

checkAndSeed();
