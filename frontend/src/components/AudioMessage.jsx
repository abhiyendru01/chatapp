import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const AudioMessage = ({ audioSrc, isSender = true }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:15");

  useEffect(() => {
    if (!waveformRef.current) return;

    // Destroy existing WaveSurfer instance if it exists
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    // Get DaisyUI theme colors from CSS variables
    const waveColor = isSender
      ? getComputedStyle(document.documentElement)
          .getPropertyValue("--primary-content")
          
      : getComputedStyle(document.documentElement)
          .getPropertyValue("--base-content")
         
    const progressColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim() || "#ff7f50"; // Fallback to orange if not found

    // Create a new WaveSurfer instance
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor, // Use DaisyUI theme color for wave
      progressColor, // Use DaisyUI theme color for progress
      barWidth: 2,
      barGap: 3,
      barRadius: 3,
      height: 40,
      cursorWidth: 0,
      backend: "WebAudio",
      responsive: true,
      normalize: true,
      partialRender: true,
      barMinHeight: 3,
    });

    wavesurfer.current.load(audioSrc);

    wavesurfer.current.on("ready", () => {
      const time = Math.ceil(wavesurfer.current.getDuration() || 15);
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      setDuration(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    });

    wavesurfer.current.on("play", () => setIsPlaying(true));
    wavesurfer.current.on("pause", () => setIsPlaying(false));
    wavesurfer.current.on("finish", () => setIsPlaying(false));

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audioSrc, isSender]);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  return (
    <div
      className={`${
        isSender ? "bg-primary/80" : "bg-base-300/80"
      } p-4 rounded-lg shadow-lg w-auto max-w-[75%] md:max-w-[60%]`}
    >
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`btn btn-circle btn-sm flex items-center justify-center 
            ${isSender ? "btn-ghost" : "btn-primary"} 
            hover:bg-opacity-90 transition-all duration-200`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Waveform */}
        <div className="flex-1 h-10 min-w-[100px]">
          <div ref={waveformRef} className="w-full" />
        </div>

        {/* Duration */}
        <span
          className={`text-xs font-medium opacity-90 min-w-[40px] text-right ${
            isSender ? "text-primary-content" : "text-base-content"
          }`}
        >
          {duration}
        </span>
      </div>
    </div>
  );
};

export default AudioMessage;