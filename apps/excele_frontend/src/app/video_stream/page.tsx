"use client";
import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

function Video_Stream() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const videoSrc =
      "http://localhost:3001/public/hsl_converted_video/14066c05-5593-4e2f-b9d5-050bf4e38d7f/720p.m3u8";

    if (video) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari browsers
        video.src = videoSrc;
      }
    }
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        controls
        style={{ width: "100%", maxWidth: "720px" }}
      />
    </div>
  );
}

export default Video_Stream;
