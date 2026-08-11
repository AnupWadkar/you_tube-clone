import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";

import userroutes from "./routes/auth.js";
import commentroutes from "./routes/comment.js";
import dislikeRoutes from "./routes/dislike.js";
import historyrroutes from "./routes/history.js";
import likeroutes from "./routes/like.js";
import videoroutes from "./routes/video.js";
import watchlaterroutes from "./routes/watchlater.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DBURL = process.env.DB_URL;

if (!DBURL) {
  console.error("Missing DB_URL environment variable. Check your .env file.");
  process.exit(1);
}

// Allow a comma-separated list of origins via FRONTEND_URL, falling back to
// allowing all origins (handy for local development).
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Make sure the uploads directory exists before we try to serve from it.
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => {
  res.send("You tube backend is working");
});

app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/dislike", dislikeRoutes);

// 404 handler for unmatched routes.
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized error handler (catches anything thrown/next(err)'d downstream).
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Something went wrong" });
});

mongoose
  .connect(DBURL)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
