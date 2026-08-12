import History from "../Modals/history.js";
import Video from "../Modals/video.js";

export const handleHistory = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;

  if (!userId || !videoId) {
    return res.status(400).json({ message: "Missing userId or videoId" });
  }

  try {
    // Use upsert to avoid duplicate key errors
    const updatedHistory = await History.findOneAndUpdate(
      { viewer: userId, videoid: videoId },
      { watchedon: Date.now() }, // update timestamp
      { upsert: true, new: true }
    );

    // Increment views only if the video exists
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

    return res.status(200).json({ history: true, data: updatedHistory });
  } catch (error) {
    console.error("History error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const handleView = async (req, res) => {
  const { videoId } = req.params;
  try {
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    return res.status(200).json({ views: true });
  } catch (error) {
    console.error("View increment error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllHistory = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const history = await History.find({ viewer: userId })
      .populate("videoid")
      .sort({ watchedon: -1 })
      .exec();
    return res.status(200).json(history);
  } catch (error) {
    console.error("Get history error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};