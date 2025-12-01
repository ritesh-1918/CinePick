# 🎬 CinePick - AI-Powered Movie Discovery

![CinePick Banner](https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-FF0055?style=for-the-badge&logo=vercel&logoColor=white)](https://cine-pick1918.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Stop Scrolling. Start Watching.**  
*The ultimate decision-making tool for movie lovers, powered by AI.*

</div>

---

## ✨ Overview

**CinePick** solves the paradox of choice. We've all been there—spending more time scrolling through Netflix than actually watching something. CinePick uses advanced algorithms, mood-based filtering, and AI conversations to pinpoint exactly what you want to watch in seconds.

Whether you're watching alone, with a partner, or hosting a party, CinePick has a dedicated mode for you.

## 🚀 Key Features

### 🧠 AI Conversation Wizard
Don't know what you want? Chat with our AI. It asks the right questions to understand your vibe and recommends hidden gems you'll love.

### 🔥 Swipe Eliminator (Tinder for Movies)
Can't agree on a movie with your partner?
1.  Start a session.
2.  Both of you swipe Left (No) or Right (Yes) on a curated list.
3.  **It's a Match!** The app reveals the movie you both liked.

### 🎭 Mood & Context Playlists
*   **"I'm Sad"**: Get comforting, feel-good movies.
*   **"Mindblown"**: Sci-fi thrillers that twist your reality.
*   **"Date Night"**: Romantic picks that aren't cheesy.
*   **"Short on Time"**: Great films under 90 minutes.

### 📺 Watch Party Mode
Sync up with friends remotely. Create a lobby, chat in real-time, and react to movies together.

### 📊 Smart Analytics
Track your watch history and get insights into your taste. "You watch a lot of 90s Sci-Fi on Tuesday nights."

---

## 🛠️ Tech Stack

This project is built with a modern, high-performance **MERN** stack:

*   **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion (for buttery smooth animations).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (with Mongoose).
*   **AI Integration**: Google Gemini / Perplexity API for intelligent recommendations.
*   **Authentication**: JWT & Google OAuth.
*   **Deployment**: Vercel (Serverless).

---

## ⚡ Getting Started

Want to run this locally? Follow these steps:

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas URI)

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/ritesh-1918/CinePick.git
    cd CinePick
    ```

2.  **Install Dependencies** (Root, Client, and Server)
    ```bash
    npm run install:all
    ```

3.  **Configure Environment Variables**
    *   Create `.env` in `server/` and `client/` based on the examples.
    *   You will need API keys for TMDB and Google OAuth.

4.  **Run the App**
    ```bash
    npm start
    ```
    This will launch both the backend (port 5000) and frontend (port 5173) concurrently.

---

## 📸 Screenshots

| Dashboard | AI Wizard |
|:---:|:---:|
| <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=60" alt="Dashboard" width="400"/> | <img src="https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=500&q=60" alt="AI Wizard" width="400"/> |

| Swipe Mode | Profile Stats |
|:---:|:---:|
| <img src="https://images.unsplash.com/photo-1517604931442-71053e3e2e3c?auto=format&fit=crop&w=500&q=60" alt="Swipe Mode" width="400"/> | <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=60" alt="Profile" width="400"/> |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

<div align="center">

Made with ❤️ by **Ritesh Bonthalakoti**

</div>
