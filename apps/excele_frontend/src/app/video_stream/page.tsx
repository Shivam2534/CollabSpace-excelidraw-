"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { redirect } from "next/navigation";
import Video_Call_Invite from "./video call invite/Video_Call_Invite";

function Video_Stream() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [movieInfo] = useState({
    title: "Interstellar",
    year: "2014",
    director: "Christopher Nolan",
    duration: "2h 49m",
    rating: "PG-13",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    starring: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
  });

  // Control visibility timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, showControls]);

  useEffect(() => {
    const video = videoRef.current;
    const videoSrc =
      "http://localhost:3001/public/hsl_converted_video/14066c05-5593-4e2f-b9d5-050bf4e38d7f/720p.m3u8";

    if (video) {
      // Set up event listeners
      video.addEventListener("play", () => setIsPlaying(true));
      video.addEventListener("pause", () => setIsPlaying(false));
      video.addEventListener("timeupdate", () =>
        setCurrentTime(video.currentTime)
      );
      video.addEventListener("loadedmetadata", () =>
        setDuration(video.duration)
      );
      video.addEventListener("volumechange", () => setVolume(video.volume));

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari browsers
        video.src = videoSrc;
      }

      // Clean up event listeners
      return () => {
        video.removeEventListener("play", () => setIsPlaying(true));
        video.removeEventListener("pause", () => setIsPlaying(false));
        video.removeEventListener("timeupdate", () =>
          setCurrentTime(video.currentTime)
        );
        video.removeEventListener("loadedmetadata", () =>
          setDuration(video.duration)
        );
        video.removeEventListener("volumechange", () =>
          setVolume(video.volume)
        );
      };
    }
  }, []);

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (video) {
      const newTime = Number.parseFloat(e.target.value);
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle volume
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (video) {
      const newVolume = Number.parseFloat(e.target.value);
      video.volume = newVolume;
      setVolume(newVolume);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    const videoContainer = document.getElementById("video-container");
    if (!videoContainer) return;

    if (!isFullscreen) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header/Navigation */}
      <header className="bg-black/80 backdrop-blur-sm py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-red-600">collabWatch</h1>
          <nav className="ml-10 hidden md:block">
            <ul className="flex space-x-6">
              <li className="hover:text-red-500 transition-colors">
                Browse movies
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
            <span className="font-bold">U</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Video Player Section */}
          <div className="lg:w-3/4">
            {/* Video Player */}
            <div
              id="video-container"
              className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
              onMouseMove={() => {
                setShowControls(true);
                if (isPlaying) {
                  // Reset the timer when mouse moves
                  const timer = setTimeout(() => {
                    setShowControls(false);
                  }, 3000);
                  return () => clearTimeout(timer);
                }
              }}
            >
              <video
                ref={videoRef}
                className="w-full aspect-video object-contain"
              />

              {/* Custom Video Controls */}
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
              >
                {/* Progress Bar */}
                <div className="flex items-center mb-2">
                  <span className="text-xs mr-2">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600"
                  />
                  <span className="text-xs ml-2">{formatTime(duration)}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button onClick={togglePlay} className="focus:outline-none">
                      {isPlaying ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Volume Control */}
                    <div className="flex items-center space-x-1">
                      <button className="focus:outline-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolume}
                        className="w-16 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Fullscreen Button */}
                    <button
                      onClick={toggleFullscreen}
                      className="focus:outline-none"
                    >
                      {isFullscreen ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 9V4.5M9 9H4.5M15 9H19.5M15 9V4.5M15 15v4.5M15 15H19.5M9 15H4.5M9 15v4.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Movie Information */}
            <div className="mt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{movieInfo.title}</h1>
                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                  <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    My List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Future Video Call Integration */}
          <Video_Call_Invite />
        </div>
      </main>
    </div>
  );
}

export default Video_Stream;
