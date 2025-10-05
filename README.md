# Blog Summarizer

A full-stack AI-powered web application for generating concise summaries and key bullet points from long-form blog content. Built with a modern React frontend and a Node.js/Express backend that leverages state-of-the-art large language models (LLMs) from Cerebras and Llama.

---

## 🦅 Project Overview

**Blog Summarizer** enables users to:
- Paste or input any blog/article content
- Select a preferred summary length (short, medium, large)
- Instantly receive a TL;DR summary and, optionally, detailed bullet points
- Copy, reset, and interact with summaries in a beautiful, responsive UI

---

## 🏗️ Architecture

- **Frontend:**
  - React 19 + Vite + Material UI
  - Responsive, dark-themed, and mobile-friendly
  - Features: input validation, animated feedback, copy-to-clipboard, toggling between summary and details
  - Deployed to GitHub Pages

- **Backend:**
  - Node.js + Express
  - REST API endpoint `/summarize` for summarization requests
  - Handles prompt building, text cleaning, and error management

### ⚡️ Why Cerebras & Llama-3.3-70B?
- Utilizes **Cerebras Cloud** as the LLM provider for blazing fast API responses.
- Employs the **Llama-3.3-70B** model, renowned for its high accuracy in summarizing large text content.
- Ensures both speed and quality in generating concise, reliable summaries.
---

## 🤖 How AI is Used

- The backend sends user blog content and summary length to the Cerebras (or Llama) LLM via API.
- The LLM returns a structured response with:
  - `tldr`: a concise summary
  - `bullets`: key points
  - `meta`: model info, tokens used, processing time
- The frontend displays the TL;DR by default, with an option to reveal bullet points.

---

## 🧩 Tech Stack

- **Frontend:** React, Vite, Material UI, Emotion
- **Backend:** Node.js, Express
- **AI/LLM:** Cerebras, Llama (configurable)
- **Deployment:** GitHub Pages (frontend), Render.com (backend)

---

## 🚦 Quick Start

1. **Clone the repo:**
   ```sh
   git clone https://github.com/balayokesh/blog-summarizer.git
   ```
2. **Start the backend:**
   ```sh
   cd blog-summarizer/backend
   npm install
   npm start
   ```
3. **Start the frontend:**
   ```sh
   cd ../frontend
   npm install
   npm run dev
   ```
4. **Open your browser:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000/summarize](http://localhost:5000/summarize)

---

## 🌟 Key Features
- Paste blog content and select summary length
- AI-powered TL;DR and bullet points
- Toggle between summary and details
- Copy to clipboard, reset, and input validation
- Animated feedback and modern UI
- Powered by Cerebras and Llama LLMs

---

## 📄 License

MIT
