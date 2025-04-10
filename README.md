# 🎥 VideoMate

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

<p align="center">
  <b>🚀 A modern web application for seamless video management and sharing</b>
</p>

## 📑 Table of Contents
- [🎥 VideoMate](#-videomate)
  - [📑 Table of Contents](#-table-of-contents)
  - [📋 Overview](#-overview)
    - [✨ Key Features](#-key-features)
  - [📁 Project Structure](#-project-structure)
  - [⚙️ Prerequisites](#️-prerequisites)
  - [🚀 Getting Started](#-getting-started)
    - [🔧 Backend Setup](#-backend-setup)
    - [🎨 Frontend Setup](#-frontend-setup)
  - [✨ Features](#-features)
  - [🛠️ Tech Stack](#️-tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)

## 📋 Overview

VideoMate is a modern web application for video management and sharing. This project consists of a client-side React application and a Node.js server.

### ✨ Key Features
- 🔐 Secure user authentication
- 📤 Easy video upload
- 🎥 Real-time streaming
- 📱 Responsive design
- 🎨 Modern UI/UX

## 📁 Project Structure

```
VideoMate/
├── Client/                 # React frontend application
│   ├── src/               # Source files
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
│
└── Server/                # Node.js backend server
    ├── server.js          # Main server file
    └── package.json       # Backend dependencies
```

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher) 📦
- [npm](https://www.npmjs.com/) (Node Package Manager) 🔧

## 🚀 Getting Started

### 🔧 Backend Setup

1. Navigate to the Server directory:
   ```bash
   cd Server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   PORT=3000
   AGORA_APP_ID=
   AGORA_APP_CERTIFICATE=
   MONGO_URI
   ```

1. Start the server:
   ```bash
   npm start
   ```

### 🎨 Frontend Setup

1. Navigate to the Client directory:
   ```bash
   cd Client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   VITE_API_URL
   AGORA_APP_ID
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## ✨ Features

| Feature | Description |
|:--------|:------------|
| 🎥 Streaming | Real-time video streaming capabilities |
| 📱 Responsive | Works on all devices and screen sizes |
| 🎨 Modern UI | Clean and intuitive user interface |

## 🛠️ Tech Stack

### Frontend
- ⚛️ [React](https://reactjs.org/) - UI Library
- ⚡ [Vite](https://vitejs.dev/) - Build Tool
- 🎨 [TailwindCSS](https://tailwindcss.com/) - Styling
- 📡 [Axios](https://axios-http.com/) - HTTP Client

### Backend
- 🟢 [Node.js](https://nodejs.org/) - Runtime
- 🚂 [Express](https://expressjs.com/) - Web Framework
- 🍃 [MongoDB](https://www.mongodb.com/) - Database

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔄 Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---


