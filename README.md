# Social Platform — Setup Guide

## Prerequisites

- Node.js, MongoDB running locally (or Atlas URI)

## Environment Variables

Create `server/.env`:

```
MONGO_URI=mongodb://localhost:27017/social-platform
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
PORT=5000
```

## Install & Run

From the project root:

```bash
npm run dev
```

Or manually:

```bash
# Terminal 1 — server
cd server && npm run dev

# Terminal 2 — client
cd client && npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000

## What's built

### Backend (`server/`)

- `POST /api/auth/register` — register
- `POST /api/auth/login` — login
- `GET /api/posts` — personalized feed
- `GET /api/posts/explore` — all posts
- `POST /api/posts` — create post (with optional image)
- `DELETE /api/posts/:id` — delete own post
- `PUT /api/posts/:id/like` — toggle like
- `POST /api/posts/:id/comments` — add comment
- `GET /api/users/:id` — public profile + posts
- `PUT /api/users/profile` — update bio/username/picture
- `PUT /api/users/:id/follow` — follow/unfollow
- `GET /api/users/search?q=` — search users

### Frontend (`client/`)

- Register / Login pages
- Home feed (posts from followed users)
- Explore feed (all posts)
- Create post with image upload
- Like / comment on posts
- Delete own posts
- User profile page
- Follow / unfollow users
- Edit bio
