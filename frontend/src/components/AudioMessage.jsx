import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const AudioMessage = ({ audioSrc, isSender = true }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:15");

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: isSender ? "text-primary-content" : "text-secondary-content", // blue-300 for sender, blue-200 for receiver
      progressColor: "chat-bubble-accent", // blue-600
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
    <div className={`chat ${isSender ? "chat-end" : "chat-start"}`}>
      <div className={` rounded ${isSender ? "chat-bubble-secondary " : "chat-bubble-primary"} 
        flex items-center gap-4 min-w-[300px] max-w-[500px] p-2`}>
        <button
          onClick={togglePlay}
          className={`btn btn-circle btn-sm ${isSender ? "btn-ghost" : "btn-primary"} 
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

        <div className="flex-1 h-10">
          <div ref={waveformRef} className="w-full" />
        </div>

        <span className="text-sm opacity-90 min-w-[40px] text-right">
          {duration}
        </span>
      </div>
    </div>
  );
};

export default AudioMessage;