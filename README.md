# Chat App (MERN + Socket.IO + AI Proxy)

A production-style real-time chat application built with a split frontend/backend architecture.

## Core Features

- JWT-based authentication with protected API routes
- Real-time private messaging with Socket.IO
- Online user presence tracking
- Image message upload support through Cloudinary
- Theme-aware frontend UI using TailwindCSS + DaisyUI
- AI assistant panel in the home screen (prompt -> backend AI proxy -> response)

## Tech Stack

- Frontend: React, Vite, Zustand, Axios, TailwindCSS, DaisyUI
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO
- Auth: Cookie-based JWT sessions
- Media: Cloudinary

## Project Structure

```text
.
|- backend/
|  |- src/
|  |  |- controllers/
|  |  |- middleware/
|  |  |- models/
|  |  |- routes/
|  |  |- lib/
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- pages/
|  |  |- store/
```

## Environment Variables

Create backend env files using the provided templates:

- backend/.env.example
- backend/.env

Required variables:

```env
MONGODB_URI=YOUR_MONGODB_URI
PORT=5001
JWT_SECRET=YOUR_JWT_SECRET
CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
NODE_ENV=development
AI_SERVICE_URL=YOUR_AI_SERVICE_URL
```

AI integration details:

- Backend sends POST requests to AI_SERVICE_URL.
- Request body shape: { "prompt": "YOUR_USER_PROMPT" }
- The backend returns: { "reply": "AI_RESPONSE_TEXT" }

## Local Development

Install dependencies:

```bash
npm install --prefix backend
npm install --prefix frontend
```

Run backend (terminal 1):

```bash
npm run dev --prefix backend
```

Run frontend (terminal 2):

```bash
npm run dev --prefix frontend
```

Frontend dev server: http://localhost:5173  
Backend API server: http://localhost:5001

## Production Build

Build both apps:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## API Overview

Auth routes:

- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/check
- PUT /api/auth/update-profile

Message routes:

- GET /api/messages/users
- GET /api/messages/:id
- POST /api/messages/send/:id

AI route:

- POST /api/ai/chat

Example AI request:

```bash
curl -X POST http://localhost:5001/api/ai/chat \
	-H "Content-Type: application/json" \
	-d "{\"prompt\":\"Explain Socket.IO rooms in simple terms\"}"
```

## Notes

- AI route is protected by authentication middleware.
- If AI_SERVICE_URL is missing or invalid, /api/ai/chat returns an error response.
- Configure your external AI service to accept JSON prompt payloads.
