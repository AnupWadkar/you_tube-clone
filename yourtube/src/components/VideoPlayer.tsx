import { useRef } from "react";

interface VideoPlayerProps {
  video: any;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        poster="/placeholder-video.png"
      >
        <source
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`}
          type={video.filetype || "video/mp4"}
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}