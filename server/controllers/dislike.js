import dislike from "../Modals/dislike.js";
import video from "../Modals/video.js";

// Toggle dislike (add/remove)
export const handleDislike = async (req, res) => {
  const { userId } = req.body;       // userId from request body (or from auth middleware)
  const { videoId } = req.params;

  try {
    // Check if the user already disliked this video
    const existingDislike = await dislike.findOne({
      viewer: userId,
      videoid: videoId,
    });

    if (existingDislike) {
      // Remove dislike
      await dislike.findByIdAndDelete(existingDislike._id);
      await video.findByIdAndUpdate(videoId, { $inc: { Dislike: -1 } });
      return res.status(200).json({ disliked: false });
    } else {
      // Add dislike (and ensure like is removed if present – optional)
      // Optional: remove like if exists to prevent both states
      // You can implement that by calling the like controller or adding logic here.
      await dislike.create({ viewer: userId, videoid: videoId });
      await video.findByIdAndUpdate(videoId, { $inc: { Dislike: 1 } });
      return res.status(200).json({ disliked: true });
    }
  } catch (error) {
    console.error("Error toggling dislike:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Get all disliked videos for a user
export const getAllDislikedVideos = async (req, res) => {
  const { userId } = req.params;

  try {
    const dislikedVideos = await dislike
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();

    return res.status(200).json(dislikedVideos);
  } catch (error) {
    console.error("Error fetching disliked videos:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};