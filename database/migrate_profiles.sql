-- Migration script to add new fields to profiles table
-- Run this to update existing database

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

-- Add default values for existing records if needed
UPDATE profiles 
SET personality_traits = ARRAY[]::TEXT[]
WHERE personality_traits IS NULL;

UPDATE profiles 
SET hobbies = ARRAY[]::TEXT[]
WHERE hobbies IS NULL;

COMMENT ON COLUMN profiles.profile_picture_2_url IS 'Second profile picture URL';
COMMENT ON COLUMN profiles.profile_picture_3_url IS 'Third profile picture URL';
COMMENT ON COLUMN profiles.height IS 'Height in centimeters';
COMMENT ON COLUMN profiles.relationship_goal IS 'What the user is looking for (Serious Relationship, Casual Dating, etc.)';
COMMENT ON COLUMN profiles.occupation IS 'Current occupation or course';
COMMENT ON COLUMN profiles.lifestyle_drinking IS 'Drinking habits';
COMMENT ON COLUMN profiles.lifestyle_smoking IS 'Smoking habits';
COMMENT ON COLUMN profiles.lifestyle_exercise IS 'Exercise frequency';
COMMENT ON COLUMN profiles.personality_traits IS 'Array of personality traits';
COMMENT ON COLUMN profiles.looking_for IS 'Description of ideal match';
