# Chat App (MERN + Socket.IO + LangChain AI)

A production-style real-time chat application built with a split frontend/backend architecture.

## Core Features

- JWT-based authentication with protected API routes
- Real-time private messaging with Socket.IO
- Online user presence tracking
- Image message upload support through Cloudinary
- Theme-aware frontend UI using TailwindCSS + DaisyUI
- AI assistant panel in home screen powered by LangChain
- ChatGroq integration for fast LLM responses
- Prompt Template based response generation with few-shot examples
- Structured AI output rendered in chat history

## Tech Stack

- Frontend: React, Vite, Zustand, Axios, TailwindCSS, DaisyUI
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO, LangChain
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
GROQ_API_KEY=YOUR_GROQ_API_KEY
```

AI defaults:

- Provider: groq
- Groq model: llama-3.3-70b-versatile

## AI Integration (LangChain)

The chatbot feature uses LangChain in the backend to orchestrate model invocation and output formatting.

### Flow

1. Frontend sends user prompt to `POST /api/ai/chat`
2. Backend controller builds a LangChain `ChatPromptTemplate`
3. Template includes:
   - system instruction
   - few-shot examples (input/output pairs)
   - final user prompt placeholder
4. Backend invokes `ChatGroq`
5. Model response is parsed into structured JSON and returned to frontend

### Prompt Template + Few-Shot Prompting

Few-shot examples are embedded in the template so the model follows a consistent style and structure for every reply.

### Structured Output Contract

The AI is instructed to return JSON in this format:

```json
{
  "answer": "string",
  "highlights": ["string"],
  "nextStep": "string"
}
```

The API response includes:

- `reply`: main answer text for direct rendering
- `structuredOutput`: object with `answer`, `highlights`, `nextStep`
- `provider`: `groq`

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

Example AI response:

```json
{
  "reply": "Socket.IO rooms let you group sockets so you can broadcast messages to specific users or groups.",
  "structuredOutput": {
    "answer": "Socket.IO rooms let you group sockets so you can broadcast messages to specific users or groups.",
    "highlights": [
      "Each socket can join multiple rooms",
      "Use rooms for private or group conversations",
      "Emit to a room without sending to all clients"
    ],
    "nextStep": "Create one room per chat thread and emit new messages to that room."
  },
  "provider": "groq"
}
```

## Notes

- All message and authentication endpoints are protected by authentication middleware where required.
- AI route is protected as well, so user must be authenticated.
