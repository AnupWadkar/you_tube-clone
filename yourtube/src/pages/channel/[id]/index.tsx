import ChannelHeader from "@/components/ChannelHeader";
import ChannelVideos from "@/components/ChannelVideos";
import Channeltabs from "@/components/Channeltabs";
import VideoUploader from "@/components/VideoUploader";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ChannelPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();

  const [channel, setChannel] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchChannelData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [channelRes, videosRes] = await Promise.all([
          axiosInstance.get(`/user/${id}`),
          axiosInstance.get(`/video/channel/${id}`),
        ]);
        setChannel(channelRes.data);
        setVideos(videosRes.data);
      } catch (err) {
        console.error("Error fetching channel data:", err);
        setError("Channel not found");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [id]);

  if (loading) return <div className="flex-1 p-6">Loading channel...</div>;
  if (error || !channel) return <div className="flex-1 p-6">Channel not found.</div>;

  const isOwner = user?._id === channel._id;

  return (
    <div className="flex-1 min-h-screen bg-white">
      <div className="max-w-full mx-auto">
        <ChannelHeader channel={channel} user={user} />
        <Channeltabs />
        {isOwner && (
          <div className="px-4 pb-8">
            <VideoUploader channelId={channel._id} channelName={channel.channelname} />
          </div>
        )}
        <div className="px-4 pb-8">
          <ChannelVideos videos={videos} />
        </div>
      </div>
    </div>
  );
}
