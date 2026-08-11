import mongoose from "mongoose";
import video from "../Modals/video.js";

export const uploadvideo = async (req, res) => {
  if (req.file === undefined) {
    return res
      .status(400)
      .json({ message: "Please upload an mp4 video file only" });
  }
  try {
    const file = new video({
      videotitle: req.body.videotitle,
      filename: req.file.originalname,
      // Store a URL-safe relative path (not the absolute disk path) so the
      // frontend can build `${BACKEND_URL}/${filepath}` reliably.
      filepath: `uploads/${req.file.filename}`,
      filetype: req.file.mimetype,
      filesize: req.file.size,
      videochanel: req.body.videochanel,
      uploader: req.body.uploader,
    });
    await file.save();
    return res.status(201).json({ message: "File uploaded successfully", video: file });
  } catch (error) {
    console.error("uploadvideo error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallvideo = async (req, res) => {
  try {
    const files = await video.find().sort({ createdAt: -1 });
    return res.status(200).json(files);
  } catch (error) {
    console.error("getallvideo error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Get a single video by id — required by the "watch" page on the frontend.
export const getvideobyid = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Video not found" });
  }
  try {
    const file = await video.findById(id);
    if (!file) {
      return res.status(404).json({ message: "Video not found" });
    }
    return res.status(200).json(file);
  } catch (error) {
    console.error("getvideobyid error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// All videos uploaded by a given channel/user — used by the channel page.
export const getvideosbychannel = async (req, res) => {
  const { uploaderId } = req.params;
  try {
    const files = await video.find({ uploader: uploaderId }).sort({ createdAt: -1 });
    return res.status(200).json(files);
  } catch (error) {
    console.error("getvideosbychannel error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Simple text search across title and channel name — used by the search page.
export const searchvideo = async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.status(200).json([]);
  }
  try {
    const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    const results = await video
      .find({ $or: [{ videotitle: regex }, { videochanel: regex }] })
      .sort({ createdAt: -1 });
    return res.status(200).json(results);
  } catch (error) {
    console.error("searchvideo error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
