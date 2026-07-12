import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";
import { MusicConfig } from "../types";

interface MusicPlayerProps {
  config: MusicConfig;
  shouldPlay: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ config, shouldPlay }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Audio
  useEffect(() => {
    // Create new audio instance if URL exists
    if (!config.songUrl) return;

    setError(null);
    const audio = new Audio(config.songUrl);
    audio.volume = volume;
    audio.loop = true;
    audioRef.current = audio;

    // Event listeners
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onError = (e: ErrorEvent) => {
      console.error("Audio playback error:", e);
      setError("Não foi possível carregar a música. Verifique o link no admin.");
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("error", onError as any);

    // If parent instructs to play, start it
    if (shouldPlay) {
      audio.play().catch((err) => {
        console.warn("Autoplay was blocked by browser. Click play to listen.", err);
      });
    }

    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("error", onError as any);
      audioRef.current = null;
    };
  }, [config.songUrl]);

  // Handle play change from shouldPlay parent prop
  useEffect(() => {
    if (shouldPlay && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn("Playback blocked or failed:", err);
      });
    }
  }, [shouldPlay]);

  // Actions
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Play failed:", err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const muteState = !isMuted;
    setIsMuted(muteState);
    audioRef.current.volume = muteState ? 0 : volume;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (!config.showMusicPlayer || !config.songUrl) return null;

  return (
    <div className="w-full mt-4 p-3 rounded-xl border border-white/5 bg-black/30 backdrop-blur-md flex flex-col gap-2 relative overflow-hidden" id="music-player-container">
      {/* Decorative pulse glow */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      {/* Upper controls & meta */}
      <div className="flex items-center justify-between gap-3">
        {/* Track details */}
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {config.albumCoverUrl ? (
            <img 
              src={config.albumCoverUrl} 
              alt="Cover Art" 
              className={`w-10 h-10 rounded-lg object-cover shrink-0 border border-white/15 ${isPlaying ? 'animate-spin' : ''}`} 
              style={{ animationDuration: '10s' }}
              onError={(e) => {
                // If it fails to load, fallback can be handled or ignored
              }}
            />
          ) : (
            <div className={`p-2 rounded-lg bg-white/5 flex items-center justify-center text-white/80 shrink-0 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
              <Music className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-sm font-semibold text-white truncate max-w-[180px] tracking-wide font-sans">
              {config.songTitle || "Sem Título"}
            </span>
            <span className="text-xs text-white/50 truncate max-w-[180px] font-sans">
              {config.artistName || "Artista Desconhecido"}
            </span>
          </div>
        </div>

        {/* Play/Pause control */}
        <button
          onClick={togglePlay}
          id="play-pause-btn"
          className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer shrink-0 shadow-lg shadow-white/10"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black translate-x-[1px]" />}
        </button>
      </div>

      {/* Seek track progress bar */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] font-mono text-white/40 select-none">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          id="seek-slider"
          className="flex-1 h-1 rounded-lg bg-white/10 appearance-none cursor-pointer accent-white hover:bg-white/20 transition-all [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white"
        />
        <span className="text-[10px] font-mono text-white/40 select-none">
          {duration ? formatTime(duration) : "0:00"}
        </span>
      </div>

      {/* Volume and error control */}
      <div className="flex items-center justify-between gap-2 mt-1">
        {error ? (
          <span className="text-[10px] text-red-400 font-sans truncate">{error}</span>
        ) : (
          <span className="text-[10px] text-white/30 font-sans">Fakecrime Player</span>
        )}
        
        {/* Volume adjust */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={toggleMute} id="volume-toggle-btn" className="text-white/60 hover:text-white transition-colors cursor-pointer">
            {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            id="volume-slider"
            className="w-16 h-1 rounded bg-white/10 appearance-none cursor-pointer accent-white hover:bg-white/20 transition-all [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white"
          />
        </div>
      </div>
    </div>
  );
};
