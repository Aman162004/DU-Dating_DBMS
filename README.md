# 🔥 DU Dating - Tinder for Delhi University

A full-featured dating application built specifically for Delhi University students. Swipe, match, and connect with students across DU's top colleges!

## ✨ Features

### 🏠 Landing Page
- Beautiful Tinder-inspired home page
- Feature highlights and statistics
- College showcase
- Call-to-action sections

### 👤 User Features
- **Authentication**: Secure login/register with DU email validation
- **Profile Management**: Create and customize your profile with bio, interests, and photos
- **Smart Swiping**: Tinder-style card interface with smooth animations
  - Swipe right to Like ❤️
  - Swipe left to Nope ✕
  - Swipe up to Super Like ⭐
  - Undo last swipe
- **Matching System**: Get matched when both users like each other
- **Real-time Chat**: Message your matches instantly
- **Match Discovery**: See all your matches in one place

### 🎨 UI/UX
- Modern Tinder-inspired design
- Smooth animations and transitions
- Fully responsive (mobile, tablet, desktop)
- Beautiful gradient backgrounds
- Interactive buttons with ripple effects
- Match celebration modal with confetti

## 📁 Project Structure

```
du-dating-app/
├── server.js              # Express server
├── db.js                  # Database connection
├── seed.js                # Database seeding script
├── package.json           # Dependencies
├── .env                   # Environment variables
├── api/
│   ├── auth.js           # Authentication routes
│   └── core.js           # Core app routes (swipe, match, chat)
├── database/
│   ├── schema.sql        # Database schema
│   └── seed_users.sql    # 25 dummy user profiles
└── public/
    ├── HTML/
    │   ├── home.html     # Landing page ✨ NEW
    │   ├── login.html    # Login page
    │   ├── register.html # Registration page
    │   ├── swipe.html    # Main swiping interface
    │   ├── matches.html  # Matches list
    │   ├── chat.html     # Chat interface
    │   └── profile.html  # Profile management
    ├── CSS/
    │   ├── base.css      # Global styles
    │   ├── home.css      # Landing page styles ✨ NEW
    │   ├── auth.css      # Auth pages styles
    │   ├── swipe.css     # Swipe page styles (ENHANCED)
    │   ├── matches.css   # Matches page styles
    │   ├── chat.css      # Chat page styles
    │   └── profile.css   # Profile page styles
    └── JS/
        ├── api.js        # API utilities
        ├── auth.js       # Auth utilities
        ├── utils.js      # Helper functions
        ├── swipe.js      # Swipe functionality (ENHANCED)
        ├── matches.js    # Matches functionality
        ├── chat.js       # Chat functionality
        └── profile.js    # Profile functionality
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd du-dating-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/du_dating
   
   # Server
   PORT=3000
   NODE_ENV=development
   
   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   ```

4. **Create the database**
   ```bash
   # Login to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE du_dating;
   \q
   ```

5. **Set up database schema**
   ```bash
   npm run db:setup
   # OR manually:
   psql -U postgres -d du_dating -f database/schema.sql
   ```

6. **Seed the database with 25 dummy users**
   ```bash
   npm run seed
   ```

7. **Start the server**
   ```bash
   npm start
   # For development with auto-reload:
   npm run dev
   ```

8. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎯 Pages Overview

### 1. **Home Page** (`/` or `/HTML/home.html`)
Beautiful landing page with:
- Hero section with gradient background
- Feature showcase
- College badges
- Stats display
- Call-to-action buttons

### 2. **Authentication Pages**
- **Login** (`/HTML/login.html`)
- **Register** (`/HTML/register.html`)

### 3. **Main App Pages** (Require Authentication)
- **Swipe** (`/HTML/swipe.html`) - Main Tinder-like swiping interface
- **Matches** (`/HTML/matches.html`) - View all your matches
- **Chat** (`/HTML/chat.html`) - Message your matches
- **Profile** (`/HTML/profile.html`) - Edit your profile

## 🎨 New Tinder-like Features

### Enhanced Swipe Interface
- ✅ 5 action buttons (Undo, Dislike, Super Like, Like, Boost)
- ✅ Swipe gestures (left/right/up)
- ✅ Visual feedback labels (LIKE, NOPE, SUPER LIKE)
- ✅ 3D card stacking effect
- ✅ Smooth animations
- ✅ Undo functionality
- ✅ Beautiful gradient overlays

### Match Modal
- ✅ Celebration animation
- ✅ Confetti effects
- ✅ Pulsing heart
- ✅ Profile avatars
- ✅ Action buttons (Send Message, Keep Swiping)

## 📊 Database

### 25 Dummy Users Include:
- Diverse names across different DU colleges
- Realistic bios and interests
- Profile pictures (via pravatar.cc)
- Various ages (18-22)
- Different genders and preferences
- Sample swipes and matches
- Sample chat messages

### Colleges Represented:
1. SRCC
2. St. Stephen's College
3. Hindu College
4. Miranda House
5. Lady Shri Ram College
6. Ramjas College
7. Hansraj College
8. Kirori Mal College
9. Delhi College of Arts and Commerce
10. Jesus and Mary College
11. Gargi College
12. Daulat Ram College
13. Kamala Nehru College
14. Shaheed Bhagat Singh College

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Styling**: Custom CSS with Tinder-inspired design
- **Icons**: Unicode emojis + SVG

## 📱 Responsive Design

Fully optimized for:
- 📱 Mobile (320px - 768px)
- 💻 Tablet (768px - 1024px)
- 🖥️ Desktop (1024px+)

## 🎨 Color Palette

```css
--tinder-primary: #FE3C72;    /* Main pink */
--tinder-secondary: #FF6036;   /* Orange */
--tinder-gold: #FFC629;        /* Gold */
--tinder-green: #21D07A;       /* Like green */
--tinder-blue: #4FC3F7;        /* Super like blue */
--tinder-purple: #A960EE;      /* Boost purple */
```

## 🔐 Security Features

- JWT-based authentication
- Bcrypt password hashing
- DU email validation (*.du.ac.in)
- Protected API routes
- SQL injection prevention (parameterized queries)

## 🚀 NPM Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with dummy users
npm run db:setup   # Set up database schema
npm run db:seed    # Alternative seed command
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Swiping
- `GET /api/swipe/potential` - Get potential matches
- `POST /api/swipe` - Swipe on a user

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:matchId/messages` - Get messages

### Chat
- `POST /api/chat/send` - Send message
- `GET /api/chat/:matchId` - Get conversation

## 🎯 Features Comparison with Tinder

| Feature | Tinder | DU Dating |
|---------|--------|-----------|
| Swipe Interface | ✅ | ✅ |
| Match System | ✅ | ✅ |
| Chat | ✅ | ✅ |
| Super Like | ✅ | ✅ |
| Undo | ✅ | ✅ |
| Profile Customization | ✅ | ✅ |
| College Filter | ❌ | ✅ |
| DU Exclusive | ❌ | ✅ |

## 🤝 Contributing

This is an academic project. Feel free to fork and modify!

## 📄 License

MIT License

## 👥 Credits

Built with ❤️ for Delhi University students

---

**Ready to swipe?** Run `npm start` and open http://localhost:3000! 🔥
