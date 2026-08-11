import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function SearchResult({ query }: { query: string }) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setVideos([]);
      setLoading(false);
      return;
    }

    const fetchSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get("/video/search", {
          params: { q: query },
        });
        setVideos(res.data);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to load search results");
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [query]);

  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Enter a search term to find videos and channels.</p>
      </div>
    );
  }

  if (loading) return <div>Loading search results...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-gray-600">Try different keywords or remove search filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {videos.map((video) => (
          <div key={video._id} className="flex gap-4 group">
            <Link href={`/watch/${video._id}`} className="flex-shrink-0">
              <div className="relative w-80 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <video
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </Link>
            <div className="flex-1 min-w-0 py-1">
              <Link href={`/watch/${video._id}`}>
                <h3 className="font-medium text-lg line-clamp-2 group-hover:text-blue-600 mb-2">
                  {video.videotitle}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>{video.views?.toLocaleString() || 0} views</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
              </div>
              <Link href={`/channel/${video.uploader}`} className="flex items-center gap-2 mb-2 hover:text-blue-600">
                <Avatar className="w-6 h-6">
                  <AvatarImage src="/placeholder.svg?height=24&width=24" />
                  <AvatarFallback className="text-xs">{video.videochanel?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{video.videochanel}</span>
              </Link>
              {video.description && (
                <p className="text-sm text-gray-700 line-clamp-2">{video.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center py-8">
        <p className="text-gray-600">Showing {videos.length} results for &quot;{query}&quot;</p>
      </div>
    </div>
  );
}
