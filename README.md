<div align="center">

# VibeVerse — Server

**REST API backend powering the VibeVerse social platform with AI image generation and sentiment analysis.**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

[Live API](https://your-post-backend.onrender.com) · [Client Repo](../Client) · [Report Bug](https://github.com/Praveshvermaa/Vibeverse/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Folder Structure](#folder-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

VibeVerse Server is the Express.js backend that drives the VibeVerse social media platform. It handles user authentication, image-based post management with Cloudinary CDN, real-time sentiment scoring of captions and comments, and AI-powered image generation via the Pollinations API. Built for the React client, it exposes a clean RESTful interface secured with JWT.

---

## Key Features

- **JWT Authentication** — Secure register/login flow with bcrypt password hashing and Bearer-token middleware
- **Cloudinary-backed Media Pipeline** — All post images and profile pictures upload directly to Cloudinary via Multer, with `public_id` tracked for reliable deletion
- **Sentiment Analysis Engine** — Every post caption and comment is scored in real-time using the `sentiment` NLP library; the feed is sorted by positivity
- **AI Image Generation** — Proxies text prompts to the Pollinations AI API and streams generated images back as binary buffers
- **Profile Viewer Tracking** — Records and exposes which users have visited a profile, enabling a "Who viewed my profile" feature
- **Post Analytics Dashboard API** — Serves aggregated post data (likes, comments, sentiment trends) for the client-side analytics dashboard
- **Like / Unlike Toggle** — Atomic like toggle stored as an array of user ObjectIds, preventing double-likes
- **Keep-Alive Ping** — Built-in 5-minute self-ping interval to prevent Render free-tier cold starts

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express 4 |
| **Database** | MongoDB Atlas (Mongoose 8 ODM) |
| **Authentication** | JSON Web Tokens · bcrypt |
| **File Upload** | Multer · multer-storage-cloudinary |
| **Media CDN** | Cloudinary v1 |
| **NLP** | sentiment (AFINN-based) |
| **AI Generation** | Pollinations AI API |
| **Dev Tooling** | Nodemon · dotenv |

---

## Architecture

```
Client (React)
     │
     │  REST / JSON  (Bearer token in Authorization header)
     ▼
┌──────────────────────────────────────────────┐
│              Express Server                  │
│                                              │
│  ┌─────────┐  ┌────────────┐  ┌──────────┐  │
│  │  Routes  │→│ Middleware  │→│Controllers│  │
│  │ (6 files)│  │ verifyToken│  │ (5 files)│  │
│  │          │  │ upload     │  │          │  │
│  └─────────┘  └────────────┘  └────┬─────┘  │
│                                    │         │
│                    ┌───────────────┼───────┐  │
│                    ▼               ▼       │  │
│              ┌──────────┐  ┌────────────┐  │  │
│              │  Models   │  │  Services  │  │  │
│              │ User/Post │  │ Cloudinary │  │  │
│              └─────┬─────┘  └────────────┘  │  │
│                    │                        │  │
└────────────────────┼────────────────────────┘  │
                     ▼                           │
              MongoDB Atlas                      │
                                                 │
              Pollinations AI  ◄─────────────────┘
              Cloudinary CDN   ◄─────────────────┘
```

- **Protocol**: RESTful JSON over HTTP
- **Auth flow**: Stateless JWT — client stores the token in `localStorage` and sends it via the `Authorization: Bearer <token>` header
- **File uploads**: Multipart `form-data` processed by Multer → piped directly to Cloudinary storage
- **Sentiment pipeline**: Captions are scored at post-creation time; comments update the post's cumulative sentiment score on submission

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **MongoDB Atlas** cluster (or local MongoDB instance)
- A **Cloudinary** account (free tier works)
- A **Pollinations AI** API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Praveshvermaa/Vibeverse.git

# Navigate to the server directory
cd Vibeverse/Server

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the `Server/` root:

```env
PORT=3000
DATABASE_URL="your_mongodb_connection_string"
SECRET_KEY="your_jwt_secret_key"
CLOUD_NAME="your_cloudinary_cloud_name"
API_KEY="your_cloudinary_api_key"
API_SECRET="your_cloudinary_api_secret"
POLLINATION_API_KEY="your_pollinations_api_key"
```

### Running Locally

```bash
# Start the dev server with hot-reload (Nodemon)
npm start
```

The server will be available at `http://localhost:3000`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default: `3000`) |
| `DATABASE_URL` | MongoDB Atlas connection string |
| `SECRET_KEY` | Secret used to sign and verify JWT tokens |
| `CLOUD_NAME` | Cloudinary cloud name |
| `API_KEY` | Cloudinary API key |
| `API_SECRET` | Cloudinary API secret |
| `POLLINATION_API_KEY` | Pollinations AI service API key |

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ✗ | Register a new user (username, name, email, password) |
| `POST` | `/api/auth/login` | ✗ | Login and receive a JWT token |

### User Details — `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/userdetails` | ✓ | Get the authenticated user's profile and posts |
| `POST` | `/api/profileownerdetails` | ✗ | Get any user's public profile by `profileOwnerId` |
| `GET` | `/api/profileviewer` | ✓ | Get list of users who viewed the authenticated user's profile |

### Posts — `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/upload` | ✓ | Create a new post (multipart: `postImage` + `postCaption`) |
| `POST` | `/api/editpicture` | ✓ | Update profile picture (multipart: `profileImage`) |
| `GET` | `/api/allposts` | ✗ | Fetch all posts, sorted by sentiment score (descending) |
| `POST` | `/api/post/like/:id` | ✓ | Toggle like/unlike on a post |
| `POST` | `/api/deletePost` | ✓ | Delete a post by `id` (also removes image from Cloudinary) |

### User Posts — `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/userposts` | ✓ | Fetch all posts by the authenticated user |
| `POST` | `/api/profileveiwer` | ✓ | Record that the current user viewed another user's profile |
| `GET` | `/api/dashboard/usersposts` | ✓ | Fetch authenticated user's posts for the analytics dashboard |

### Comments & Sentiment — `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/post/comment/:id` | ✓ | Add a comment to a post |
| `GET` | `/api/post/comment/:id` | ✗ | Get all comments for a post |
| `POST` | `/api/post/sentiment-analysis` | ✗ | Analyze comment text and update the post's cumulative sentiment score |

### AI Image Generation — `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/generate-image` | ✗ | Generate an AI image from a text `prompt` via Pollinations API |

---

## Folder Structure

```
Server/
├── app.js                    # Express entry point, route mounting, CORS, keep-alive
├── package.json
├── .env                      # Environment variables (git-ignored)
├── .gitignore
│
├── config/
│   └── DB.js                 # MongoDB connection via Mongoose
│
├── models/
│   ├── userSchema.js         # User model (username, email, posts[], profile_viewer[])
│   └── post.js               # Post model (image, caption, comments[], likes[], sentimentScore)
│
├── middlewares/
│   ├── verifyToken.js        # JWT verification middleware
│   └── upload.js             # Multer middleware configured with Cloudinary storage
│
├── controllers/
│   ├── authController.js     # Register & Login logic (bcrypt + JWT)
│   ├── userController.js     # User details, profile owner, profile viewer tracking
│   ├── postController.js     # CRUD posts, like toggle, profile picture, dashboard data
│   ├── commentController.js  # Add/get comments, sentiment analysis
│   └── aiController.js       # Pollinations AI image generation proxy
│
├── routes/
│   ├── auth.js               # /api/auth/*
│   ├── userDeatils.js        # /api/userdetails, /api/profileownerdetails, /api/profileviewer
│   ├── createPost.js         # /api/upload, /api/editpicture, /api/allposts, /api/post/like, /api/deletePost
│   ├── userPosts.js          # /api/userposts, /api/profileveiwer, /api/dashboard/usersposts
│   ├── comment.js            # /api/post/comment/*
│   └── AiImageGeneration.js  # /api/generate-image
│
├── services/
│   └── cloudinary.js         # Cloudinary SDK config + CloudinaryStorage for Multer
│
└── images/                   # Static image directory (served at /images)
```

---


## Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** your feature branch — `git checkout -b feature/your-feature`
3. **Commit** your changes — `git commit -m "feat: add your feature"`
4. **Push** to the branch — `git push origin feature/your-feature`
5. **Open** a Pull Request

Please keep commits atomic and follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## License

Distributed under the **ISC License**. See `LICENSE` for more information.

---

## Contact

**Pravesh Verma**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Praveshvermaa)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/praveshvermaa)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:praveshdhakad62@gmail.com)

---

<div align="center">
  <sub>Built with ❤️ by Pravesh Verma</sub>
</div>
