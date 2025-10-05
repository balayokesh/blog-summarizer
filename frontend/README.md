# Blog Summarizer Frontend

A modern, responsive web app to summarize blog posts using AI. Built with React, Vite, and Material UI.

---

## 🚀 Features

- Paste blog content in a user-friendly text area
- Select summary length: short, medium, or long
- AI generates TL;DR and bullet points
- Toggle between summary and details
- Copy results with one click
- Dark mode and responsive design
- Animated loading indicator
- Input validation and live word/character count
- Reset to clear all fields


## 🛠️ Tech Stack

- **React 19**
- **Vite** (for fast development and builds)
- **Material UI (MUI)** for UI components and theming
- **Emotion** for CSS-in-JS styling and animations
- **Deployed to GitHub Pages**

---

## 📦 Installation & Running Locally

1. **Clone the repository:**
   ```sh
   git clone https://github.com/balayokesh/blog-summarizer.git
   cd blog-summarizer/frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173) (or as shown in your terminal).

---

## ⚙️ API Integration

- The frontend calls a backend summarization API at:
  `https://blog-summarizer-fetn.onrender.com/summarize`
- **Request:**
  ```json
  {
    "text": "Your article text here...",
    "length": "medium"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "bullets": ["• Key point 1", "• Key point 2"],
      "tldr": "Short summary...",
      "meta": { ... }
    }
  }
  ```

---

## 📋 Functionality Overview

- **Paste your blog post** and select the desired summary length.
- **Click Summarize** to send your content to the AI backend.
- **View the TL;DR** summary by default.
- **Click "Show more details"** to reveal bullet points (and hide TL;DR).
- **Copy** the summary or bullet points with the floating button.
- **Reset** to clear all fields and start over.

---
