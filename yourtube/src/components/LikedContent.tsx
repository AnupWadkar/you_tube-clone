import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Play, ThumbsUp, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function LikedContent() {
  const { user } = useUser();
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadLikedVideos();
    else setLoading(false);
  }, [user]);

  const loadLikedVideos = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.get(`/like/${user._id}`);
      setLikedVideos(res.data);
    } catch (error) {
      console.error("Load liked error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (videoId: string, likedId: string) => {
    // Toggle like via API (removes like)
    try {
      await axiosInstance.post(`/like/${videoId}`, { userId: user?._id });
      setLikedVideos(likedVideos.filter((item) => item._id !== likedId));
    } catch (error) {
      console.error("Remove liked error:", error);
    }
  };

  if (loading) return <div>Loading liked videos...</div>;
  if (!user) {
    return (
      <div className="text-center py-12">
        <ThumbsUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Keep track of videos you like</h2>
        <p className="text-gray-600">Sign in to see your liked videos.</p>
      </div>
    );
  }
  if (likedVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <ThumbsUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No liked videos yet</h2>
        <p className="text-gray-600">Videos you like will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{likedVideos.length} videos</p>
        <Button className="flex items-center gap-2">
          <Play className="w-4 h-4" /> Play all
        </Button>
      </div>
      <div className="space-y-4">
        {likedVideos.map((item) => (
          <div key={item._id} className="flex gap-4 group">
            <Link href={`/watch/${item.videoid._id}`} className="flex-shrink-0">
              <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                <video
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.videoid?.filepath}`}
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  poster="/placeholder-video.png"
                />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/watch/${item.videoid._id}`}>
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
                  {item.videoid.videotitle}
                </h3>
              </Link>
              <p className="text-sm text-gray-600">{item.videoid.videochanel}</p>
              <p className="text-sm text-gray-600">
                {item.videoid.views?.toLocaleString() || 0} views •{" "}
                {formatDistanceToNow(new Date(item.videoid.createdAt))} ago
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Liked {formatDistanceToNow(new Date(item.createdAt))} ago
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleRemove(item.videoid._id, item._id)}>
                  <X className="w-4 h-4 mr-2" /> Remove from liked videos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}