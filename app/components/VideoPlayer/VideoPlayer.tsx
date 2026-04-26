"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgress = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
      setCurrentTime(current);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime =
      (Number(e.target.value) / 100) * (videoRef.current?.duration || 0);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
    setProgress(Number(e.target.value));
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.parentElement?.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const onLoadedMetadata = () => setDuration(video.duration);
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      return () =>
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
    }
  }, []);

  return (
    <section className="w-full px-6 lg:px-12 pt-10 lg:pt-16 mb-20">
      <div
        className="max-w-7xl mx-auto relative group bg-black overflow-hidden aspect-video"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={handleProgress}
          playsInline
        />

        {/* Center Play Button Overlay */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none"
            >
              <div className="w-20 h-20 bg-(--secondary) text-(--primary) flex items-center justify-center">
                <Play className="w-8 h-8 fill-current" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Controls Bar */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent flex flex-col gap-4"
            >
              {/* Progress Bar */}
              <div className="relative w-full h-1 bg-white/20 group/progress cursor-pointer">
                <div
                  className="absolute top-0 left-0 h-full bg-(--secondary)"
                  style={{ width: `${progress}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Controls Group */}
              <div className="flex items-center justify-between text-(--secondary)">
                <div className="flex items-center gap-6">
                  <button
                    onClick={togglePlay}
                    className="hover:opacity-70 transition-opacity"
                  >
                    {isPlaying ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} fill="currentColor" />
                    )}
                  </button>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleMute}
                      className="hover:opacity-70 transition-opacity"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <span className="font-mono text-sm tracking-tighter">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="hover:opacity-70 transition-opacity"
                >
                  <Maximize size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
