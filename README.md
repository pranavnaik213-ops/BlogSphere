# 🚀 BlogSphere - Full Stack Responsive Blog Application

> A modern, full-stack, responsive Blog Application built with **HTML5, CSS3, JavaScript (ES6+), Node.js, Express.js, and MongoDB (Mongoose)** featuring JWT user authentication, complete CRUD operations, category filtering, search, and a glassmorphism design system.

---

## 🌟 Key Features

- **Frontend Interface (Module 1)**:
  - Responsive multi-page layout (`Home`, `Login`, `Register`, `Dashboard`, `Create Blog`, `Blog Details`).
  - Sleek Cyberpunk & Glassmorphism dark/light theme switcher with local persistence.
  - Interactive Article Viewer Modal and dedicated standalone detail page (`blog-detail.html`).
- **Express.js REST APIs (Module 2)**:
  - RESTful API endpoints for User Registration, User Login, and Blog Management.
  - JSON body parsing, CORS support, error handling, and request logging.
- **MongoDB & Mongoose Integration (Module 3)**:
  - Schema modeling for `User` and `Blog` collections.
  - Secure bcrypt password hashing and persistent database querying.
- **Full CRUD & Filters (Module 4)**:
  - **Create**: Rich text editor with toolbar formatting, tags generator, cover image preview, and draft auto-saving.
  - **Read**: Live article grid with category pills (`Web Dev`, `Design`, `AI`, `Tech`, `Lifestyle`) and multi-field debounced search.
  - **Update**: Edit existing posts with pre-filled inputs.
  - **Delete**: Remove articles from dashboard table with deletion confirmation modal.
- **JWT Auth & Route Guards (Module 5)**:
  - Secure JWT authentication (`jsonwebtoken`) with `Authorization: Bearer <TOKEN>` header injection.
  - Private route guards on `Dashboard` and `Create Blog` pages.
  - User-isolated dashboard analytics (Total Posts, Views, Likes, Drafts).
  - Profile header dropdown and 1-click **Logout** handler.
- **Deployment Ready (Module 6)**:
  - Mobile-responsive design optimized for Desktop, Tablet, and Mobile viewports.
  - Deployment configurations for **Vercel** (`vercel.json`) and **Render** (`render.yaml`).

---

## 🛠️ Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

---

## 📁 Repository Structure

```
blog-app/
├── server/
│   ├── config/
│   │   └── db.js             # Mongoose MongoDB connection manager
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── User.js           # Mongoose User schema (bcrypt hashed passwords)
│   │   └── Blog.js           # Mongoose Blog schema
│   ├── routes/
│   │   ├── authRoutes.js     # Auth REST endpoints (Register, Login, Me)
│   │   └── blogRoutes.js     # Blog REST endpoints (CRUD, Likes, Comments, Stats)
│   ├── utils/
│   │   └── db.js             # Persistent JSON DB fallback helper
│   └── server.js             # Express application entry point (Port 5000)
├── css/
│   └── styles.css            # Complete CSS design system & utilities
├── js/
│   ├── api.js                # Centralized ApiClient fetch library
│   ├── app.js                # Core frontend engine & theme switcher
│   ├── auth.js               # Auth form controller & strength meter
│   ├── dashboard.js          # Dashboard controller & metric analytics
│   └── editor.js             # Rich text blog editor & preview engine
├── index.html                # Home page feed & hero section
├── login.html                # Login page with demo login shortcut
├── register.html             # Registration page with avatar picker
├── dashboard.html            # User dashboard & analytics
├── create-blog.html          # Create & Edit blog editor page
├── blog-detail.html          # Dedicated individual blog details page
├── package.json              # Project dependencies & start scripts
├── vercel.json               # Vercel serverless deployment config
└── render.yaml               # Render web service deployment config
```

---

## 📡 REST API Reference

### Auth Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (`Bearer <token>`) |

### Blog Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/blogs` | Get published blogs (supports `category` & `search`) | No |
| `GET` | `/api/blogs/:id` | Get individual blog details & increment views | No |
| `POST` | `/api/blogs` | Create new blog post | Yes (`Bearer <token>`) |
| `PUT` | `/api/blogs/:id` | Update existing blog post | Yes (`Bearer <token>`) |
| `DELETE` | `/api/blogs/:id` | Delete blog post | Yes (`Bearer <token>`) |
| `GET` | `/api/blogs/user/me` | Fetch user-isolated posts & stats | Yes (`Bearer <token>`) |
| `POST` | `/api/blogs/:id/comments` | Post comment on article | No |
| `POST` | `/api/blogs/:id/like` | Toggle like on article | No |

---

## ⚡ Quick Start & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Optional local instance; includes auto fallback)

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/pranavnaik213-ops/BlogSphere.git
   cd BlogSphere
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Start the Express API server**:
   ```bash
   npm start
   # Express API server starts at http://localhost:5000
   ```

4. **Serve the Frontend**:
   Open `index.html` in your browser or run:
   ```bash
   npx serve -p 8080 .
   # Frontend app accessible at http://localhost:8080
   ```

---

## 🚀 Deployment Guide

### Deploying to Vercel
1. Install [Vercel CLI](https://vercel.com/cli) or import repository on Vercel Dashboard.
2. The included `vercel.json` automatically maps static routes and Express API functions (`/api/*`).

### Deploying to Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Select `render.yaml` or set Build Command: `npm install` and Start Command: `npm start`.

---

## 👤 Author & License

- **Author**: Pranav Naik (`pranavnaik213-ops`)
- **Project**: CodSoft Web Development Capstone Application
- **License**: MIT
