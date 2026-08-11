import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import VideoPlayer from "@/components/VideoPlayer";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const [video, setVideo] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchData = async () => {
      try {
        // Fetch current video
        const videoRes = await axiosInstance.get(`/video/${id}`);
        setVideo(videoRes.data);

        // Fetch all videos for related (we'll improve later with pagination)
        const allRes = await axiosInstance.get("/video/getall");
        const others = allRes.data.filter((v: any) => v._id !== id);
        setRelated(others);
      } catch (error) {
        console.error("Error fetching video:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!video) return <div className="p-4">Video not found</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer video={video} />
            <VideoInfo video={video} />
            <Comments videoId={id as string} />
          </div>
          <div className="space-y-4">
            <RelatedVideos videos={related} />
          </div>
        </div>
      </div>
    </div>
  );
}