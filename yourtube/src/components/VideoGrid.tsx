import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import VideoCard from "./VideoCard";

export default function VideoGrid() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        setVideos(res.data);
      } catch (err) {
        setError("Failed to load videos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) return <div className="text-center py-8">Loading videos...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (videos.length === 0) return <div className="text-center py-8">No videos uploaded yet.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}