# Modern Social Media Platform

A full-stack, responsive social media platform built with the MERN stack (MongoDB, Express.js, React, Node.js). This platform provides users with a comprehensive ecosystem to connect, share content, engage with posts, and receive real-time notifications, wrapped in a sleek, customizable user interface.

## ✨ Key Features

### 🔐 Authentication & Security
- Secure user registration and login using JWT (JSON Web Tokens).
- Welcome emails automatically dispatched via Nodemailer upon signup.
- Passwords cryptographically hashed via bcrypt.

### 👥 User Ecosystem
- Fully customizable user profiles (upload profile pictures, edit bios, and change usernames).
- Follow/Unfollow relationships.
- Personalized "Home" feed featuring posts only from followed users, alongside an "Explore" feed to discover new content.

### 📝 Content & Interaction
- Create, edit, and delete posts.
- Support for image attachments with posts (handled via Multer).
- Interactive Like and Comment systems on posts.
- Pagination enabled for smooth feed scrolling.

### 🔍 Global Search
- Robust global search bar utilizing MongoDB Text Indexes to scan both Usernames and Post Content simultaneously.
- Dedicated Search Results page for categorized matches.

### 🔔 Notifications Engine
- Interactive Notification dropdown tracking engagement.
- Automated triggers dispatch notifications when users like your posts, comment on your posts, or start following you.
- Easily mark notifications as read or clear them all.

### 🎨 Theme & UI/UX
- Aesthetic, dynamic, and responsive UI.
- Native Dark Mode / Light Mode toggle with persistent memory via LocalStorage.
- Micro-animations, polished hover states, and premium glassmorphism elements powered by a custom design system alongside Bootstrap utilities.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 (bootstrapped with Vite)
- **State Management**: Redux Toolkit for complex global state, Context API for UI themes
- **Routing**: React Router DOM
- **Styling**: Vanilla CSS (Custom Variables/Themes) + React Bootstrap

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT)
- **File Uploads**: Multer
- **Email Service**: Nodemailer

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js installed locally.
- MongoDB running locally (or a MongoDB Atlas URI).

### 2. Environment Variables
Create a `.env` file in the `server/` directory:

```env
MONGO_URI=mongodb://localhost:27017/social-platform
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
PORT=5000

# Mailer Configuration (For Welcome Emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

### 3. Install Dependencies & Run

From the project root directory, you can run the entire stack simultaneously:

```bash
# Install dependencies for both server and client (if not already done)
cd server && npm install
cd ../client && npm install
cd ..

# Run both the frontend and backend servers concurrently
npm run dev
```

Alternatively, run them in separate terminals:

```bash
# Terminal 1 — Backend Server
cd server
npm run dev

# Terminal 2 — Frontend Client
cd client
npm run dev
```

### 4. Access the Application
- **Client App**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 📁 Core API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Login to an existing account

### Posts
- `GET /api/posts` — Get personalized feed (paginated)
- `GET /api/posts/explore` — Get global explore feed (paginated)
- `POST /api/posts` — Create post
- `PUT /api/posts/:id` — Edit an existing post
- `DELETE /api/posts/:id` — Delete own post
- `PUT /api/posts/:id/like` — Toggle like status
- `POST /api/posts/:id/comments` — Add a comment

### Users & Social
- `GET /api/users/:id` — Get public profile and posts
- `PUT /api/users/profile` — Update bio/username/picture
- `PUT /api/users/:id/follow` — Follow/Unfollow a user

### Search & Notifications
- `GET /api/search?q=` — Global search across users and post content
- `GET /api/notifications` — Fetch user notifications
- `PUT /api/notifications/:id/read` — Mark a notification as read
- `PUT /api/notifications/read-all` — Mark all notifications as read
