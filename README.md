<div align="center">
  <h1 align="center">Draft — AI-Powered Blogging Platform ✍️</h1>
  <p align="center">
    A modern, full-stack blogging platform where writers can seamlessly create, manage, and explore articles with built-in AI assistance and lightning-fast performance.
  </p>
</div>

<br />

## 🌟 Overview
**Draft** is designed to provide a premium reading and writing experience. Built with the MERN stack and Vite, it features role-based access, image optimizations, and Google's Gemini AI to help authors generate high-quality blog content on the fly. 

## 🚀 Features

### 👤 For Users
- **AI Writing Assistant:** Generate complete blog drafts or outlines using Google Gemini AI!
- **Rich Text Editor:** Fully featured editor to stylize posts, embed videos, and add images.
- **Save for Later:** Bookmark posts you love and view them in your personalized "Saved Posts" feed.
- **Engage:** Comment on posts, read what others are saying, and delete your own comments if you make a mistake.
- **Explore:** Filter posts by category (Web Design, SEO, Marketing, etc.), search by title, or view by author.
- **Seamless Reading:** Infinite scrolling powered by TanStack Query means you never have to click "Next Page."

### 🛡️ For Admins
- **Content Moderation:** Delete any post or comment to keep the platform clean.
- **Feature Posts:** Spotlight the best content by marking posts as "Featured" which pins them to the top of the homepage.

---

## 💻 Tech Stack

**Frontend**
- ⚛️ **React.js (Vite):** Blazing fast component rendering and hot module replacement.
- 🔄 **TanStack Query (React Query):** For state management, infinite scrolling, caching, and data mutations.
- 🎨 **TailwindCSS:** For beautiful, responsive, and customizable styling.

**Backend**
- 🟢 **Node.js & Express.js:** Robust and scalable REST API.
- 🍃 **MongoDB & Mongoose:** NoSQL database for flexible data modeling (Posts, Users, Comments).

**Services & Integrations**
- 🔐 **Clerk:** Highly secure, role-based user authentication and webhooks.
- 🖼️ **ImageKit:** Real-time image and video optimization, transformation, and CDN delivery.
- 🧠 **Google Gemini:** Advanced AI integration for content generation.

---

## 🛠️ Local Development Setup

To run this project on your local machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/Thakur0706/blog-website.git
cd blog-website
```

### 2. Setup the Backend
Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder and add your API keys:
```env
PORT=3000
MONGO=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
GOOGLE_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```
Run the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal and navigate to the client directory:
```bash
cd client
npm install
```

Create a `.env` file in the `client` folder:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000
VITE_IK_URL_ENDPOINT=your_imagekit_endpoint
VITE_IK_PUBLIC_KEY=your_imagekit_public_key
```
Run the frontend development server:
```bash
npm run dev
```

### 4. You're all set! 🎉
Open [http://localhost:5173](http://localhost:5173) in your browser to see the app running!
