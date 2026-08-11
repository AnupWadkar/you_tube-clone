"use strict";
import fs from "fs";
import path from "path";
import multer from "multer";

// Resolve an absolute uploads path so this works no matter what directory
// the process is started from (a common cause of "ENOENT: no such file or
// directory" errors when deploying).
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const filefilter = (req, file, cb) => {
  if (file.mimetype === "video/mp4") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter: filefilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB, matches the frontend limit
});

export default upload;
