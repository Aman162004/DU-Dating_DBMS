-- Delhi University Intra-Dating App Database Schema
-- PostgreSQL Database Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS swipes CASCADE;
DROP TABLE IF EXISTS user_interests CASCADE;
DROP TABLE IF EXISTS interests CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS colleges CASCADE;

-- Colleges Table
CREATE TABLE colleges (
    college_id SERIAL PRIMARY KEY,
    college_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email LIKE '%.du.ac.in'),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    college_id INTEGER NOT NULL REFERENCES colleges(college_id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles Table
CREATE TABLE profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    bio TEXT,
    profile_picture_url VARCHAR(500),
    profile_picture_2_url VARCHAR(500),
    profile_picture_3_url VARCHAR(500),
    gender VARCHAR(20),
    seeking VARCHAR(20),
    date_of_birth DATE,
    height INTEGER,
    relationship_goal VARCHAR(50),
    education_level VARCHAR(100),
    occupation VARCHAR(100),
    hobbies TEXT[],
    lifestyle_drinking VARCHAR(50),
    lifestyle_smoking VARCHAR(50),
    lifestyle_exercise VARCHAR(50),
    personality_traits TEXT[],
    looking_for TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interests Table
CREATE TABLE interests (
    interest_id SERIAL PRIMARY KEY,
    interest_name VARCHAR(100) UNIQUE NOT NULL
);

-- User Interests Junction Table (Many-to-Many)
CREATE TABLE user_interests (
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    interest_id INTEGER NOT NULL REFERENCES interests(interest_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, interest_id)
);

-- Swipes Table
CREATE TABLE swipes (
    swiper_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    swiped_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action VARCHAR(10) NOT NULL CHECK (action IN ('like', 'dislike')),
    swipe_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (swiper_id, swiped_id),
    CHECK (swiper_id != swiped_id)
);

-- Matches Table
CREATE TABLE matches (
    match_id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    match_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user1_id, user2_id),
    CHECK (user1_id < user2_id)
);

-- Messages Table
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    sent_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_college ON users(college_id);
CREATE INDEX idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Insert Sample DU Colleges
INSERT INTO colleges (college_name) VALUES
    ('Shri Ram College of Commerce (SRCC)'),
    ('St. Stephen''s College'),
    ('Hindu College'),
    ('Miranda House'),
    ('Lady Shri Ram College (LSR)'),
    ('Ramjas College'),
    ('Hansraj College'),
    ('Kirori Mal College'),
    ('Delhi College of Arts and Commerce'),
    ('Jesus and Mary College'),
    ('Gargi College'),
    ('Daulat Ram College'),
    ('Kamala Nehru College'),
    ('Shaheed Bhagat Singh College');

-- Insert Sample Interests
INSERT INTO interests (interest_name) VALUES
    ('Music'),
    ('Sports'),
    ('Debate'),
    ('Photography'),
    ('Dance'),
    ('Theater'),
    ('Reading'),
    ('Traveling'),
    ('Cooking'),
    ('Gaming'),
    ('Fitness'),
    ('Art'),
    ('Technology'),
    ('Fashion'),
    ('Movies');

-- Trigger to update 'updated_at' timestamp in profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
