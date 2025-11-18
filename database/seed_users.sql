-- Insert 25 Dummy User Profiles for DU Dating App
-- Run this after schema.sql has been executed

-- Insert 25 users with various colleges
INSERT INTO users (email, password_hash, first_name, college_id) VALUES
('aarav.sharma@srcc.du.ac.in', '$2b$10$example1hash1234567890abcdefghij', 'Aarav', 1),
('diya.patel@stephens.du.ac.in', '$2b$10$example2hash1234567890abcdefghij', 'Diya', 2),
('vihaan.kumar@hindu.du.ac.in', '$2b$10$example3hash1234567890abcdefghij', 'Vihaan', 3),
('ananya.singh@miranda.du.ac.in', '$2b$10$example4hash1234567890abcdefghij', 'Ananya', 4),
('arjun.reddy@lsr.du.ac.in', '$2b$10$example5hash1234567890abcdefghij', 'Arjun', 5),
('isha.verma@ramjas.du.ac.in', '$2b$10$example6hash1234567890abcdefghij', 'Isha', 6),
('rohan.gupta@hansraj.du.ac.in', '$2b$10$example7hash1234567890abcdefghij', 'Rohan', 7),
('priya.jain@kmc.du.ac.in', '$2b$10$example8hash1234567890abcdefghij', 'Priya', 8),
('kabir.malhotra@dcac.du.ac.in', '$2b$10$example9hash1234567890abcdefghij', 'Kabir', 9),
('sara.chopra@jmc.du.ac.in', '$2b$10$example10hash1234567890abcdefghi', 'Sara', 10),
('aditya.mehta@gargi.du.ac.in', '$2b$10$example11hash1234567890abcdefghi', 'Aditya', 11),
('kavya.nair@daulatram.du.ac.in', '$2b$10$example12hash1234567890abcdefghi', 'Kavya', 12),
('ryan.das@kamala.du.ac.in', '$2b$10$example13hash1234567890abcdefghi', 'Ryan', 13),
('meera.shah@sbsc.du.ac.in', '$2b$10$example14hash1234567890abcdefghi', 'Meera', 14),
('aryan.kapoor@srcc.du.ac.in', '$2b$10$example15hash1234567890abcdefghi', 'Aryan', 1),
('tara.bose@stephens.du.ac.in', '$2b$10$example16hash1234567890abcdefghi', 'Tara', 2),
('karan.saxena@hindu.du.ac.in', '$2b$10$example17hash1234567890abcdefghi', 'Karan', 3),
('riya.menon@miranda.du.ac.in', '$2b$10$example18hash1234567890abcdefghi', 'Riya', 4),
('dhruv.iyer@lsr.du.ac.in', '$2b$10$example19hash1234567890abcdefghi', 'Dhruv', 5),
('alisha.rao@ramjas.du.ac.in', '$2b$10$example20hash1234567890abcdefghi', 'Alisha', 6),
('arnav.pillai@hansraj.du.ac.in', '$2b$10$example21hash1234567890abcdefghi', 'Arnav', 7),
('kiara.desai@kmc.du.ac.in', '$2b$10$example22hash1234567890abcdefghi', 'Kiara', 8),
('shaurya.pandey@dcac.du.ac.in', '$2b$10$example23hash1234567890abcdefghi', 'Shaurya', 9),
('zara.ahuja@jmc.du.ac.in', '$2b$10$example24hash1234567890abcdefghi', 'Zara', 10),
('vedant.sinha@gargi.du.ac.in', '$2b$10$example25hash1234567890abcdefghi', 'Vedant', 11);

-- Insert profile details for all 25 users
INSERT INTO profiles (user_id, bio, gender, seeking, date_of_birth, profile_picture_url) VALUES
(1, 'Commerce student who loves hiking and photography. Looking to connect with someone who enjoys adventure! 📸🏔️', 'Male', 'Female', '2003-05-15', 'https://i.pravatar.cc/400?img=12'),
(2, 'English literature enthusiast. Coffee addict ☕ and bookworm 📚. Let''s discuss our favorite novels!', 'Female', 'Male', '2003-08-22', 'https://i.pravatar.cc/400?img=5'),
(3, 'Physics major with a passion for music. Guitar player 🎸 and aspiring rockstar!', 'Male', 'Female', '2002-11-30', 'https://i.pravatar.cc/400?img=33'),
(4, 'Psychology student interested in human behavior. Love painting and art 🎨. Swipe right if you''re creative!', 'Female', 'Male', '2003-03-18', 'https://i.pravatar.cc/400?img=9'),
(5, 'Economics geek by day, dance enthusiast by night 💃. Life''s too short not to dance!', 'Male', 'Female', '2003-07-25', 'https://i.pravatar.cc/400?img=15'),
(6, 'Political science major. Debate champion 🏆. Looking for someone who can match my wit!', 'Female', 'Male', '2002-12-10', 'https://i.pravatar.cc/400?img=20'),
(7, 'Chemistry nerd who loves cooking 🧪👨‍🍳. The way to my heart is through good food and better conversation.', 'Male', 'Female', '2003-04-07', 'https://i.pravatar.cc/400?img=52'),
(8, 'History buff and travel junkie ✈️. 15 countries visited, countless more to go! Join my journey?', 'Female', 'Male', '2003-09-14', 'https://i.pravatar.cc/400?img=23'),
(9, 'Tech enthusiast and app developer. Building the future one line of code at a time 💻', 'Male', 'Female', '2002-10-28', 'https://i.pravatar.cc/400?img=68'),
(10, 'Fashion design student with an eye for style 👗. Let''s create beautiful memories together!', 'Female', 'Male', '2003-06-05', 'https://i.pravatar.cc/400?img=27'),
(11, 'Mathematics wizard and chess player ♟️. Looking for my queen!', 'Male', 'Female', '2003-01-20', 'https://i.pravatar.cc/400?img=56'),
(12, 'Sociology major who loves social work. Making the world better, one smile at a time 😊', 'Female', 'Male', '2002-08-16', 'https://i.pravatar.cc/400?img=32'),
(13, 'Sports management student. Fitness freak 💪 and cricket fanatic 🏏. Let''s hit the gym together!', 'Male', 'Female', '2003-02-11', 'https://i.pravatar.cc/400?img=14'),
(14, 'Journalism student. Storyteller at heart 📝. Looking for someone to write my next chapter with!', 'Female', 'Male', '2003-10-03', 'https://i.pravatar.cc/400?img=45'),
(15, 'Finance bro with a soft side. Love sunset walks and deep conversations 🌅', 'Male', 'Female', '2002-09-27', 'https://i.pravatar.cc/400?img=57'),
(16, 'Philosophy student pondering life''s big questions. Let''s find answers together! 🤔', 'Female', 'Male', '2003-05-09', 'https://i.pravatar.cc/400?img=38'),
(17, 'Biology major and nature lover 🌿. Weekend hikes are my therapy!', 'Male', 'Female', '2003-11-23', 'https://i.pravatar.cc/400?img=60'),
(18, 'Performing arts student. Theater is my passion 🎭. Drama-free zone, except on stage!', 'Female', 'Male', '2002-07-18', 'https://i.pravatar.cc/400?img=16'),
(19, 'Business administration student. Entrepreneurial mindset with a romantic heart 💼❤️', 'Male', 'Female', '2003-04-30', 'https://i.pravatar.cc/400?img=51'),
(20, 'Film studies student and movie buff 🎬. Let''s Netflix and actually chill?', 'Female', 'Male', '2003-12-01', 'https://i.pravatar.cc/400?img=26'),
(21, 'Computer science major. Gamer 🎮 and anime lover. Looking for my player 2!', 'Male', 'Female', '2002-06-14', 'https://i.pravatar.cc/400?img=70'),
(22, 'Architecture student who designs dreams 🏗️. Let''s build something beautiful!', 'Female', 'Male', '2003-03-26', 'https://i.pravatar.cc/400?img=44'),
(23, 'Environmental science major. Saving the planet one date at a time 🌍💚', 'Male', 'Female', '2003-08-08', 'https://i.pravatar.cc/400?img=13'),
(24, 'Marketing student with creative ideas. Dog lover 🐕 seeking adventure partner!', 'Female', 'Male', '2002-10-19', 'https://i.pravatar.cc/400?img=29'),
(25, 'Law student and aspiring lawyer ⚖️. Looking for my perfect case... I mean date!', 'Male', 'Female', '2003-01-05', 'https://i.pravatar.cc/400?img=59');

-- Assign random interests to users (3-5 interests per user)
-- User 1 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(1, 4), (1, 8), (1, 11), (1, 13);

-- User 2 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(2, 7), (2, 14), (2, 1), (2, 15);

-- User 3 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(3, 1), (3, 13), (3, 10), (3, 2);

-- User 4 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(4, 12), (4, 4), (4, 7), (4, 8);

-- User 5 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(5, 5), (5, 1), (5, 15), (5, 14);

-- User 6 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(6, 3), (6, 7), (6, 13), (6, 8);

-- User 7 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(7, 9), (7, 13), (7, 1), (7, 11);

-- User 8 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(8, 8), (8, 4), (8, 7), (8, 15), (8, 12);

-- User 9 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(9, 13), (9, 10), (9, 1), (9, 15);

-- User 10 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(10, 14), (10, 12), (10, 4), (10, 5);

-- User 11 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(11, 13), (11, 10), (11, 7), (11, 2);

-- User 12 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(12, 8), (12, 11), (12, 1), (12, 7);

-- User 13 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(13, 2), (13, 11), (13, 13), (13, 10);

-- User 14 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(14, 7), (14, 4), (14, 15), (14, 8);

-- User 15 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(15, 13), (15, 8), (15, 1), (15, 11);

-- User 16 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(16, 7), (16, 12), (16, 3), (16, 8);

-- User 17 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(17, 8), (17, 11), (17, 4), (17, 2);

-- User 18 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(18, 6), (18, 1), (18, 5), (18, 15), (18, 12);

-- User 19 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(19, 13), (19, 8), (19, 11), (19, 7);

-- User 20 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(20, 15), (20, 1), (20, 7), (20, 10);

-- User 21 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(21, 10), (21, 13), (21, 15), (21, 1);

-- User 22 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(22, 12), (22, 4), (22, 8), (22, 14);

-- User 23 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(23, 8), (23, 11), (23, 2), (23, 4);

-- User 24 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(24, 14), (24, 13), (24, 8), (24, 5);

-- User 25 interests
INSERT INTO user_interests (user_id, interest_id) VALUES
(25, 7), (25, 3), (25, 13), (25, 15);

-- Add some sample swipes to make the app more realistic
-- These create mutual likes that will result in matches

-- Create some likes (not mutual)
INSERT INTO swipes (swiper_id, swiped_id, action) VALUES
(1, 2, 'like'),
(1, 4, 'like'),
(1, 6, 'dislike'),
(1, 8, 'like'),
(2, 3, 'like'),
(2, 5, 'like'),
(2, 7, 'dislike'),
(3, 2, 'like'),
(3, 4, 'like'),
(4, 1, 'like'),
(4, 3, 'like'),
(5, 2, 'like'),
(6, 5, 'like'),
(7, 6, 'like'),
(8, 1, 'like'),
(8, 7, 'like');

-- Create some mutual likes (will create matches)
INSERT INTO swipes (swiper_id, swiped_id, action) VALUES
(9, 10, 'like'),
(10, 9, 'like'),
(11, 12, 'like'),
(12, 11, 'like'),
(13, 14, 'like'),
(14, 13, 'like');

-- Create the matches based on mutual likes
INSERT INTO matches (user1_id, user2_id) VALUES
(9, 10),
(11, 12),
(13, 14);

-- Add some sample messages
INSERT INTO messages (match_id, sender_id, message_text) VALUES
(1, 9, 'Hey! Great to match with you! 😊'),
(1, 10, 'Hi! Thanks! Your profile is amazing!'),
(1, 9, 'Thanks! So, what are you studying?'),
(2, 11, 'Hi Kavya! Love your interests!'),
(2, 12, 'Hey Aditya! Chess player? That''s cool!'),
(3, 13, 'Hey Meera! Want to grab coffee sometime?'),
(3, 14, 'Hi Ryan! I''d love to! When are you free?');
