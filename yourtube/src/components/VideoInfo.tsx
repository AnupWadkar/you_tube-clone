import { formatDistanceToNow } from "date-fns";
import { Clock, Download, MoreHorizontal, Share, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

export default function VideoInfo({ video }: any) {
  const { user } = useUser();
  const [likes, setLikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    setLikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
    // Optionally check if user already liked/disliked this video
    // by fetching user's interaction status
  }, [video]);

  // Increment view count on mount
  useEffect(() => {
    const recordView = async () => {
      try {
        if (user) {
          await axiosInstance.post(`/history/${video._id}`, { userId: user._id });
        } else {
          await axiosInstance.post(`/history/views/${video._id}`);
        }
      } catch (error) {
        console.error("View record error:", error);
      }
    };
    recordView();
  }, [video._id, user]);

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, { userId: user._id });
      if (res.data.liked) {
        setLikes((prev: number) => prev + 1);
        setIsLiked(true);
        if (isDisliked) {
          setDislikes((prev: number) => prev - 1);
          setIsDisliked(false);
        }
      } else {
        setLikes((prev: number) => prev - 1);
        setIsLiked(false);
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/dislike/${video._id}`, { userId: user._id });
      if (res.data.disliked) {
        setDislikes((prev: number) => prev + 1);
        setIsDisliked(true);
        if (isLiked) {
          setLikes((prev: number) => prev - 1);
          setIsLiked(false);
        }
      } else {
        setDislikes((prev: number) => prev - 1);
        setIsDisliked(false);
      }
    } catch (error) {
      console.error("Dislike error:", error);
    }
  };

  const handleWatchLater = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, { userId: user._id });
      setIsWatchLater(res.data.watchlater);
    } catch (error) {
      console.error("Watch later error:", error);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{video.videotitle}</h1>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{video.videochanel?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{video.videochanel}</h3>
            <p className="text-sm text-gray-600">1.2M subscribers</p>
          </div>
          <Button className="ml-4">Subscribe</Button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-gray-100 rounded-full">
            <Button variant="ghost" size="sm" className="rounded-l-full" onClick={handleLike}>
              <ThumbsUp className={`w-5 h-5 mr-2 ${isLiked ? "fill-black text-black" : ""}`} />
              {likes.toLocaleString()}
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button variant="ghost" size="sm" className="rounded-r-full" onClick={handleDislike}>
              <ThumbsDown className={`w-5 h-5 mr-2 ${isDisliked ? "fill-black text-black" : ""}`} />
              {dislikes.toLocaleString()}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`bg-gray-100 rounded-full ${isWatchLater ? "text-primary" : ""}`}
            onClick={handleWatchLater}
          >
            <Clock className="w-5 h-5 mr-2" />
            {isWatchLater ? "Saved" : "Watch Later"}
          </Button>
          <Button variant="ghost" size="sm" className="bg-gray-100 rounded-full">
            <Share className="w-5 h-5 mr-2" /> Share
          </Button>
          <Button variant="ghost" size="sm" className="bg-gray-100 rounded-full">
            <Download className="w-5 h-5 mr-2" /> Download
          </Button>
          <Button variant="ghost" size="icon" className="bg-gray-100 rounded-full">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex gap-4 text-sm font-medium mb-2">
          <span>{video.views?.toLocaleString() || 0} views</span>
          <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
        </div>
        <div className={`text-sm ${showFullDescription ? "" : "line-clamp-3"}`}>
          <p>{video.description || "No description provided."}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0 h-auto font-medium"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>
    </div>
  );
}