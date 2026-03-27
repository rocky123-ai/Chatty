import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import aiRoutes from "./routes/ai.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

const normalizeOrigin = (url = "") =>
  url
    .trim()
    .replace(/^['\"]|['\"]$/g, "")
    .replace(/\/$/, "");

const frontendUrls = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const corsOrigin = (origin, callback) => {
  // Allow server-to-server calls or tools with no origin header.
  if (!origin) return callback(null, true);

  const normalizedOrigin = normalizeOrigin(origin);

  if (frontendUrls.includes(normalizedOrigin)) {
    return callback(null, true);
  }

  return callback(new Error("Not allowed by CORS"));
};

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
