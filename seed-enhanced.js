#!/usr/bin/env node

/**
 * Enhanced Database Seeder Script
 * Seeds the database with 30 complete user profiles with all new fields
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'du_dating_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// Sample data
const interests = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]; // All interest IDs

const relationshipGoals = ['Serious Relationship', 'Casual Dating', 'Friendship', 'Not Sure'];
const lifestyleDrinking = ['Never', 'Socially', 'Regularly', 'Prefer not to say'];
const lifestyleSmoking = ['Never', 'Socially', 'Regularly', 'Prefer not to say'];
const lifestyleExercise = ['Daily', 'Weekly', 'Occasionally', 'Never'];
const personalityTraitsOptions = [
  'Adventurous', 'Creative', 'Ambitious', 'Funny', 'Caring',
  'Intellectual', 'Outgoing', 'Calm', 'Spontaneous'
];

const users = [
  { name: 'Aarav', college: 1, gender: 'Male', seeking: 'Female', email: 'aarav.sharma@srcc.du.ac.in', bio: 'Commerce student who loves hiking and photography. Looking to connect with someone who enjoys adventure! 📸🏔️', occupation: 'B.Com (Hons)', height: 178, dob: '2003-05-15', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face' },
  { name: 'Diya', college: 2, gender: 'Female', seeking: 'Male', email: 'diya.patel@stephens.du.ac.in', bio: 'English literature enthusiast. Coffee addict ☕ and bookworm 📚. Let\'s discuss our favorite novels and share our thoughts!', occupation: 'English Hons', height: 165, dob: '2003-08-22', img: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face' },
  { name: 'Vihaan', college: 3, gender: 'Male', seeking: 'Female', email: 'vihaan.kumar@hindu.du.ac.in', bio: 'Physics major with a passion for music. Guitar player 🎸 and aspiring rockstar! Looking for someone to jam with.', occupation: 'B.Sc Physics', height: 182, dob: '2002-11-30', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face' },
  { name: 'Ananya', college: 4, gender: 'Female', seeking: 'Male', email: 'ananya.singh@miranda.du.ac.in', bio: 'Psychology student interested in human behavior. Love painting and art 🎨. Swipe right if you\'re creative and open-minded!', occupation: 'Psychology Hons', height: 162, dob: '2003-03-18', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face' },
  { name: 'Arjun', college: 5, gender: 'Male', seeking: 'Female', email: 'arjun.reddy@lsr.du.ac.in', bio: 'Economics geek by day, dance enthusiast by night 💃. Life\'s too short not to dance! Let\'s make every moment count.', occupation: 'Economics Hons', height: 175, dob: '2003-07-25', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face' },
  { name: 'Isha', college: 6, gender: 'Female', seeking: 'Male', email: 'isha.verma@ramjas.du.ac.in', bio: 'Political science major. Debate champion 🏆. Looking for someone who can match my wit and engage in meaningful conversations!', occupation: 'Political Science', height: 168, dob: '2002-12-10', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face' },
  { name: 'Rohan', college: 7, gender: 'Male', seeking: 'Female', email: 'rohan.gupta@hansraj.du.ac.in', bio: 'Chemistry nerd who loves cooking 🧪👨‍🍳. The way to my heart is through good food and better conversation.', occupation: 'B.Sc Chemistry', height: 180, dob: '2003-04-07', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&crop=face' },
  { name: 'Priya', college: 8, gender: 'Female', seeking: 'Male', email: 'priya.jain@kmc.du.ac.in', bio: 'History buff and travel junkie ✈️. 15 countries visited, countless more to go! Join my journey and let\'s explore the world together?', occupation: 'History Hons', height: 164, dob: '2003-09-14', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=400&h=400&fit=crop&crop=face' },
  { name: 'Kabir', college: 9, gender: 'Male', seeking: 'Female', email: 'kabir.malhotra@dcac.du.ac.in', bio: 'Tech enthusiast and app developer. Building the future one line of code at a time 💻. Looking for someone who appreciates innovation!', occupation: 'Computer Science', height: 177, dob: '2002-10-28', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1615109398623-88346a601842?w=400&h=400&fit=crop&crop=face' },
  { name: 'Sara', college: 10, gender: 'Female', seeking: 'Male', email: 'sara.chopra@jmc.du.ac.in', bio: 'Fashion design student with an eye for style 👗. Let\'s create beautiful memories together and make every day fashionable!', occupation: 'Fashion Design', height: 166, dob: '2003-06-05', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face' },
  { name: 'Aditya', college: 11, gender: 'Male', seeking: 'Female', email: 'aditya.mehta@gargi.du.ac.in', bio: 'Mathematics wizard and chess player ♟️. Looking for my queen! Someone who loves strategy and intellectual challenges.', occupation: 'Mathematics Hons', height: 176, dob: '2003-01-20', img: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=400&fit=crop&crop=face' },
  { name: 'Kavya', college: 12, gender: 'Female', seeking: 'Male', email: 'kavya.nair@daulatram.du.ac.in', bio: 'Sociology major who loves social work. Making the world better, one smile at a time 😊. Looking for a kind-hearted soul!', occupation: 'Sociology Hons', height: 163, dob: '2002-08-16', img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1594824804732-ca8db723f8fa?w=400&h=400&fit=crop&crop=face' },
  { name: 'Ryan', college: 13, gender: 'Male', seeking: 'Female', email: 'ryan.das@kamala.du.ac.in', bio: 'Sports management student. Fitness freak 💪 and cricket fanatic 🏏. Let\'s hit the gym together and stay healthy!', occupation: 'Sports Management', height: 183, dob: '2003-02-11', img: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face' },
  { name: 'Meera', college: 14, gender: 'Female', seeking: 'Male', email: 'meera.shah@sbsc.du.ac.in', bio: 'Journalism student. Storyteller at heart 📝. Looking for someone to write my next chapter with! Let\'s create our own story.', occupation: 'Journalism', height: 167, dob: '2003-10-03', img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400&h=400&fit=crop&crop=face' },
  { name: 'Aryan', college: 1, gender: 'Male', seeking: 'Female', email: 'aryan.kapoor@srcc.du.ac.in', bio: 'Finance bro with a soft side. Love sunset walks and deep conversations 🌅. Looking for genuine connections and meaningful relationships.', occupation: 'Finance', height: 179, dob: '2002-09-27', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face' },
  { name: 'Tara', college: 2, gender: 'Female', seeking: 'Male', email: 'tara.bose@stephens.du.ac.in', bio: 'Philosophy student pondering life\'s big questions. Let\'s find answers together! 🤔 Deep thinker seeking intellectual companion.', occupation: 'Philosophy Hons', height: 161, dob: '2003-05-09', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face' },
  { name: 'Karan', college: 3, gender: 'Male', seeking: 'Female', email: 'karan.saxena@hindu.du.ac.in', bio: 'Biology major and nature lover 🌿. Weekend hikes are my therapy! Looking for an adventure partner who loves the outdoors.', occupation: 'B.Sc Biology', height: 181, dob: '2003-11-23', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face' },
  { name: 'Riya', college: 4, gender: 'Female', seeking: 'Male', email: 'riya.menon@miranda.du.ac.in', bio: 'Performing arts student. Theater is my passion 🎭. Drama-free zone, except on stage! Looking for someone who appreciates the arts.', occupation: 'Performing Arts', height: 165, dob: '2002-07-18', img: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face' },
  { name: 'Dhruv', college: 5, gender: 'Male', seeking: 'Female', email: 'dhruv.iyer@lsr.du.ac.in', bio: 'Business administration student. Entrepreneurial mindset with a romantic heart 💼❤️. Looking for my business and life partner!', occupation: 'BBA', height: 178, dob: '2003-04-30', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1615109398623-88346a601842?w=400&h=400&fit=crop&crop=face' },
  { name: 'Alisha', college: 6, gender: 'Female', seeking: 'Male', email: 'alisha.rao@ramjas.du.ac.in', bio: 'Film studies student and movie buff 🎬. Let\'s Netflix and actually chill? Looking for someone to share popcorn and life with!', occupation: 'Film Studies', height: 169, dob: '2003-12-01', img: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face' },
  { name: 'Arnav', college: 7, gender: 'Male', seeking: 'Female', email: 'arnav.pillai@hansraj.du.ac.in', bio: 'Computer science major. Gamer 🎮 and anime lover. Looking for my player 2! Someone who can beat me at Mario Kart.', occupation: 'B.Tech CS', height: 174, dob: '2002-06-14', img: 'https://images.unsplash.com/photo-1615109398623-88346a601842?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' },
  { name: 'Kiara', college: 8, gender: 'Female', seeking: 'Male', email: 'kiara.desai@kmc.du.ac.in', bio: 'Architecture student who designs dreams 🏗️. Let\'s build something beautiful! Looking for someone with vision and creativity.', occupation: 'Architecture', height: 168, dob: '2003-03-26', img: 'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face' },
  { name: 'Shaurya', college: 9, gender: 'Male', seeking: 'Female', email: 'shaurya.pandey@dcac.du.ac.in', bio: 'Environmental science major. Saving the planet one date at a time 🌍💚. Looking for an eco-conscious partner!', occupation: 'Environmental Science', height: 180, dob: '2003-08-08', img: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face' },
  { name: 'Zara', college: 10, gender: 'Female', seeking: 'Male', email: 'zara.ahuja@jmc.du.ac.in', bio: 'Marketing student with creative ideas. Dog lover 🐕 seeking adventure partner! Must love animals and spontaneous trips!', occupation: 'Marketing', height: 164, dob: '2002-10-19', img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1594824804732-ca8db723f8fa?w=400&h=400&fit=crop&crop=face' },
  { name: 'Vedant', college: 11, gender: 'Male', seeking: 'Female', email: 'vedant.sinha@gargi.du.ac.in', bio: 'Law student and aspiring lawyer ⚖️. Looking for my perfect case... I mean date! Someone who appreciates justice and fairness.', occupation: 'Law', height: 177, dob: '2003-01-05', img: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face' },
  { name: 'Nisha', college: 12, gender: 'Female', seeking: 'Male', email: 'nisha.kumar@daulatram.du.ac.in', bio: 'Yoga instructor and wellness enthusiast 🧘‍♀️. Finding peace in every moment. Looking for someone who values health and mindfulness.', occupation: 'Yoga & Wellness', height: 162, dob: '2003-07-12', img: 'https://images.unsplash.com/photo-1594824804732-ca8db723f8fa?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face' },
  { name: 'Ayaan', college: 1, gender: 'Male', seeking: 'Female', email: 'ayaan.singh@srcc.du.ac.in', bio: 'Accounting wizard who loves stand-up comedy 😂. Making people laugh is my superpower! Looking for someone with a great sense of humor.', occupation: 'Accounting', height: 175, dob: '2003-09-20', img: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face' },
  { name: 'Myra', college: 3, gender: 'Female', seeking: 'Male', email: 'myra.patel@hindu.du.ac.in', bio: 'Astronomy student stargazing through life ⭐. Let\'s explore the universe together! Looking for someone curious about the cosmos.', occupation: 'Astronomy', height: 160, dob: '2003-04-14', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face' },
  { name: 'Vivaan', college: 7, gender: 'Male', seeking: 'Female', email: 'vivaan.reddy@hansraj.du.ac.in', bio: 'Photographer capturing life\'s beautiful moments 📷. Every picture tells a story. Want to be part of mine?', occupation: 'Photography', height: 179, dob: '2002-11-08', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face' },
  { name: 'Aisha', college: 8, gender: 'Female', seeking: 'Male', email: 'aisha.verma@kmc.du.ac.in', bio: 'Nutrition student and foodie blogger 🍲. Healthy eating can be delicious! Let\'s cook up something special together!', occupation: 'Nutrition Science', height: 166, dob: '2003-06-28', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', img2: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400&h=400&fit=crop&crop=face', img3: 'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=400&h=400&fit=crop&crop=face' }
];

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function seedUsers() {
  console.log('🌱 Starting enhanced database seeding...\n');

  try {
    // Check if users already exist
    const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
    const count = parseInt(existingUsers.rows[0].count);

    if (count > 0) {
      console.log(`⚠️  Database already has ${count} users. Clearing and reseeding...`);
      console.log('🗑️  Clearing existing data...\n');
      await pool.query('TRUNCATE users, profiles, user_interests, swipes, matches, messages CASCADE');
    }

    const saltRounds = 10;
    const password = 'Test@123'; // Default password for all test users
    const passwordHash = await bcrypt.hash(password, saltRounds);

    console.log('👥 Creating 30 diverse user profiles...\n');

    for (const user of users) {
      // Insert user
      const userResult = await pool.query(
        'INSERT INTO users (email, password_hash, first_name, college_id) VALUES ($1, $2, $3, $4) RETURNING user_id',
        [user.email, passwordHash, user.name, user.college]
      );

      const userId = userResult.rows[0].user_id;

      // Generate random profile data
      const relationshipGoal = getRandomItem(relationshipGoals);
      const drinking = getRandomItem(lifestyleDrinking);
      const smoking = getRandomItem(lifestyleSmoking);
      const exercise = getRandomItem(lifestyleExercise);
      const traits = getRandomItems(personalityTraitsOptions, Math.floor(Math.random() * 4) + 3);
      const userInterests = getRandomItems(interests, Math.floor(Math.random() * 5) + 3);

      const lookingFor = [
        'Someone kind, honest, and fun to be around',
        'Looking for genuine connections and meaningful conversations',
        'Want to find someone who shares my passions',
        'Seeking a partner in crime for life\'s adventures',
        'Looking for someone who makes me laugh',
        'Want someone who values family and relationships'
      ];

      // Insert profile with all new fields
      await pool.query(
        `INSERT INTO profiles (
          user_id, bio, gender, seeking, date_of_birth, 
          profile_picture_url, profile_picture_2_url, profile_picture_3_url,
          height, relationship_goal, occupation,
          lifestyle_drinking, lifestyle_smoking, lifestyle_exercise,
          personality_traits, looking_for
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          userId, user.bio, user.gender, user.seeking, user.dob,
          user.img,
          user.img2,
          user.img3,
          user.height, relationshipGoal, user.occupation,
          drinking, smoking, exercise,
          traits, getRandomItem(lookingFor)
        ]
      );

      // Insert user interests
      for (const interestId of userInterests) {
        await pool.query(
          'INSERT INTO user_interests (user_id, interest_id) VALUES ($1, $2)',
          [userId, interestId]
        );
      }

      console.log(`✅ Created: ${user.name} (${user.email})`);
    }

    console.log('\n✅ Successfully created 30 complete user profiles!\n');
    console.log('📊 Database now contains:');
    console.log(`   • 30 users across various DU colleges`);
    console.log(`   • Complete profiles with all new fields`);
    console.log(`   • Multiple photos per user`);
    console.log(`   • Interests, personality traits, lifestyle data`);
    console.log(`   • Ready for matching algorithm!\n`);
    console.log('🔑 Login credentials for any user:');
    console.log(`   Email: Any email from above`);
    console.log(`   Password: Test@123\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run seeder
seedUsers();
