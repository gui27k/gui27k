import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Twitter, Instagram, Github, Youtube, Twitch, Music, 
  Link2, Eye, Settings, MessageSquare, ExternalLink, HelpCircle
} from "lucide-react";
import { RainEffect } from "./components/RainEffect";
import { MusicPlayer } from "./components/MusicPlayer";
import { AdminPanel } from "./components/AdminPanel";
import { BioConfig } from "./types";

export default function App() {
  const [config, setConfig] = useState<BioConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [shouldPlayMusic, setShouldPlayMusic] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element
    
    // Calculate percentage position
    const px = x / rect.width;
    const py = y / rect.height;
    
    // Calculate rotation (-15deg to 15deg)
    const rotateX = (0.5 - py) * 20; // Max tilt X
    const rotateY = (px - 0.5) * 20; // Max tilt Y
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
    });
  };

  // Load configuration from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        } else {
          console.error("Failed to load config from server");
        }
      } catch (err) {
        console.error("Network error loading config:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Check if admin is requested in URL hash or search parameter (e.g. #admin or ?admin)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#admin" || window.location.search.includes("admin")) {
        setIsAdminOpen(true);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleEnterClick = () => {
    setHasEntered(true);
    setShouldPlayMusic(true);
    
    // Smoothly increment page views on client side or via API
    if (config) {
      setConfig((prev) => prev ? { ...prev, viewsCount: prev.viewsCount + 1 } : null);
    }
  };

  const handleConfigSaved = (newConfig: BioConfig) => {
    setConfig(newConfig);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#060608] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        <span className="text-xs font-mono text-white/40 tracking-wider">carregando bio...</span>
      </div>
    );
  }

  // Active configuration or standard fallback
  const activeConfig = config || {
    title: "69pcc",
    subtitle: "最好的",
    description: "O que vem de cima, passa por cima.",
    avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    backgroundType: "interactive_rain",
    backgroundUrl: "",
    viewsCount: 66,
    titleGlowColor: "white",
    discord: {
      username: "69pcc",
      status: "dnd",
      avatarUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80",
      profileUrl: "https://discord.gg/fakecrime",
      showDiscord: true,
    },
    socials: {
      twitter: "https://twitter.com/fakecrime",
      tiktok: "https://tiktok.com/@fakecrime",
      spotify: "https://open.spotify.com",
      instagram: "https://instagram.com/fakecrime",
      github: "https://github.com/fakecrime",
      youtube: "https://youtube.com/fakecrime",
      twitch: "https://twitch.tv/fakecrime",
      customLabel: "Website",
      customUrl: "",
    },
    music: {
      songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      songTitle: "FakeCrime Anthem",
      artistName: "Unknown Artist",
      showMusicPlayer: true,
    },
    entryScreen: {
      emoji: "👼🏻",
      text: "clique para entrar...",
      backgroundType: "interactive_rain",
      backgroundUrl: "",
    },
    footerText: "Made by fakecrime",
  };

  // Glow class selector
  const getGlowClass = (color: string) => {
    switch (color) {
      case "white": return "neon-glow-white text-white";
      case "purple": return "neon-glow-purple text-purple-400";
      case "blue": return "text-blue-400 [text-shadow:0_0_15px_rgba(59,130,246,0.6)]";
      case "red": return "text-red-400 [text-shadow:0_0_15px_rgba(239,68,68,0.6)]";
      case "green": return "text-green-400 [text-shadow:0_0_15px_rgba(34,197,94,0.6)]";
      case "rgb": return "bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse-slow";
      default: return "text-white";
    }
  };

  // Discord Status Color map
  const getDiscordStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500 border-black/80";
      case "idle": return "bg-yellow-500 border-black/80";
      case "dnd": return "bg-red-500 border-black/80";
      default: return "bg-neutral-500 border-black/80";
    }
  };

  // Check if any socials exist
  const hasSocials = Object.entries(activeConfig.socials).some(
    ([key, val]) => key !== "customLabel" && key !== "customUrl" && typeof val === "string" && val.trim() !== ""
  ) || (activeConfig.socials.customLabel && activeConfig.socials.customUrl);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060608] text-white select-none">
      
      {/* Floating Subtle Settings Access Gear */}
      <button
        onClick={() => setIsAdminOpen(true)}
        id="open-admin-btn"
        className="fixed top-4 left-4 z-40 p-2.5 rounded-full bg-black/40 border border-white/5 text-white/30 hover:text-white/80 hover:bg-black/60 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5 backdrop-blur-md group"
        title="Acessar Configurações"
      >
        <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
        <span className="text-[10px] uppercase tracking-wider font-semibold font-mono opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[100px] transition-all duration-300 overflow-hidden">
          admin
        </span>
      </button>

      {/* Background Layer rendering depending on configured selection */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        {/* Ambient Dark Radial Overlay always active to ensure typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060608]/40 via-black/70 to-[#060608]/90 z-10" />

        {activeConfig.backgroundType === "interactive_rain" && (
          <RainEffect rippleOnClick={true} intensity={3} />
        )}

        {activeConfig.backgroundType === "image" && activeConfig.backgroundUrl && (
          <img
            src={activeConfig.backgroundUrl}
            alt="Background"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none blur-sm scale-105"
          />
        )}

        {activeConfig.backgroundType === "video" && activeConfig.backgroundUrl && (
          <video
            src={activeConfig.backgroundUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-45"
          />
        )}

        {activeConfig.backgroundType === "color" && (
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ backgroundColor: activeConfig.backgroundUrl || "#0a0a0c" }}
          />
        )}
      </div>

      {/* Screen Transitions */}
      <AnimatePresence mode="wait">
        
        {/* 1. ENTRY SCREEN */}
        {!hasEntered ? (
          <motion.div
            key="entry"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onClick={handleEnterClick}
            id="entry-screen"
            className="absolute inset-0 w-full h-full z-30 flex flex-col items-center justify-center cursor-pointer p-4 select-none"
          >
            {/* Centered pulsing vector / character / emoji */}
            <div className="flex flex-col items-center gap-4 animate-float">
              <div 
                id="entry-emoji"
                className="text-2xl select-none animate-sparkle flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              >
                {activeConfig.entryScreen?.emoji || "🔑"}
              </div>
            </div>
          </motion.div>
        ) : (
          
          /* 2. MAIN BIO LINK SCREEN */
          <motion.div
            key="bio"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
            id="main-bio-screen"
            className="absolute inset-0 w-full h-full z-20 flex flex-col items-center justify-center p-4"
          >
            
            {/* Floating Container Wrapper */}
            <div className="w-full max-w-[440px] animate-float relative z-20">
              
              {/* The Glassmorphism Content Card with 3D Mouse Tilt */}
              <div 
                className="w-full rounded-2xl glass-card glass-card-hover p-6 sm:p-7 relative flex flex-col items-center text-center shadow-2xl overflow-hidden"
                style={{
                  ...tiltStyle,
                  transformStyle: "preserve-3d",
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
              
                {/* Card top subtle line */}
                <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              {/* Views counter on card top-right */}
              <div 
                className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-white/75 font-mono shadow-md shadow-black/20 hover:bg-white/10 hover:text-white transition-all cursor-help"
                title="Total de visualizações"
              >
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span>{activeConfig.viewsCount}</span>
              </div>

              {/* Profile Avatar with glowing borders */}
              {activeConfig.avatarUrl && (
                <div className="relative mt-2 group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-white/20 rounded-full blur opacity-50 group-hover:opacity-85 transition duration-300" />
                  <img
                    src={activeConfig.avatarUrl}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-white/10 object-cover relative z-10 hover:scale-105 transition-transform duration-300 shadow-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
                    }}
                  />
                </div>
              )}

              {/* Username Title with dynamic neon glow */}
              {activeConfig.title && (
                <h1 
                  id="bio-title"
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-4 font-sans select-text ${getGlowClass(activeConfig.titleGlowColor)}`}
                >
                  {activeConfig.title}
                </h1>
              )}

              {/* Status / Subtitle subtitle */}
              {activeConfig.subtitle && (
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/50 font-medium mt-1.5 select-text">
                  {activeConfig.subtitle}
                </span>
              )}

              {/* Description Body */}
              {activeConfig.description && (
                <p className="text-xs sm:text-sm text-white/60 font-sans leading-relaxed mt-3 max-w-[320px] select-text">
                  {activeConfig.description}
                </p>
              )}

              {/* Horizontal list of Social Links */}
              {hasSocials && (
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5 py-2 w-full border-t border-b border-white/5">
                  
                  {activeConfig.socials.twitter && (
                    <a
                      href={activeConfig.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white hover:text-black hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer text-white/70"
                      title="Twitter / X"
                    >
                      <Twitter className="w-4 h-4 fill-current" />
                    </a>
                  )}

                  {activeConfig.socials.tiktok && (
                    <a
                      href={activeConfig.socials.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white hover:text-black hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer text-white/70"
                      title="TikTok"
                    >
                      <Music className="w-4 h-4" />
                    </a>
                  )}

                  {activeConfig.socials.spotify && (
                    <a
                      href={activeConfig.socials.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-green-500 hover:text-black hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer text-white/70"
                      title="Spotify"
                    >
                      <Music className="w-4 h-4 fill-current" />
                    </a>
                  )}

                  {activeConfig.socials.instagram && (
                    <a
                      href={activeConfig.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white hover:text-black hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer text-white/70"
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}

                  {activeConfig.socials.github && (
                    <a
                      href={activeConfig.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white hover:text-black hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer text-white/70"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}

                  {activeConfig.socials.youtube && (
                    <a
                      href={activeConfig.socials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-red-500 hover:text-black hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer text-white/70"
                      title="YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}

                  {activeConfig.socials.twitch && (
                    <a
                      href={activeConfig.socials.twitch}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-purple-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer text-white/70"
                      title="Twitch"
                    >
                      <Twitch className="w-4 h-4" />
                    </a>
                  )}

                  {/* Additional Custom Button */}
                  {activeConfig.socials.customLabel && activeConfig.socials.customUrl && (
                    <a
                      href={activeConfig.socials.customUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white hover:text-black hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-xs font-semibold font-mono tracking-wider flex items-center gap-1.5 text-white/70"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>{activeConfig.socials.customLabel}</span>
                    </a>
                  )}

                </div>
              )}

              {/* Discord Integration Status Bar */}
              {activeConfig.discord && activeConfig.discord.showDiscord && activeConfig.discord.username && (
                <div className="w-full mt-4 p-3 rounded-xl border border-white/5 bg-black/25 flex items-center justify-between gap-3 relative overflow-hidden" id="discord-widget">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {/* Status Dot Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={activeConfig.discord.avatarUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80"}
                        alt="Discord Avatar"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80";
                        }}
                      />
                      {/* Interactive Discord colored dot */}
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${getDiscordStatusColor(activeConfig.discord.status)}`} />
                    </div>
                    {/* Discord usernames metadata */}
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-xs font-bold text-white truncate font-sans tracking-wide">
                        {activeConfig.discord.username}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono flex items-center gap-1 select-none">
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span>Discord</span>
                      </span>
                    </div>
                  </div>

                  {/* Discord Invite button */}
                  {activeConfig.discord.profileUrl && (
                    <a
                      href={activeConfig.discord.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white hover:text-black border border-white/10 hover:border-white text-[11px] font-semibold tracking-wide font-sans cursor-pointer transition-all flex items-center gap-1 shrink-0"
                    >
                      <span>Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* High Craftsmanship Music Player */}
              {activeConfig.music && (
                <MusicPlayer config={activeConfig.music} shouldPlay={shouldPlayMusic} />
              )}

              </div>
            </div>

            {/* Subtle elegant Footer Credits in bottom-right corner */}
            {activeConfig.footerText && (
              <div className="fixed bottom-4 right-4 z-10 flex items-center gap-1 text-[10px] font-mono font-semibold tracking-wider text-white/30 hover:text-white/60 transition-colors select-none">
                <span className="font-bold uppercase text-white/40">{activeConfig.footerText}</span>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN PANEL DRAWER / MODAL */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-hidden"
          >
            <AdminPanel
              currentConfig={activeConfig}
              onConfigSaved={handleConfigSaved}
              onClose={() => {
                setIsAdminOpen(false);
                // Clear admin trigger from query/hash so it doesn't auto-open again on reload
                if (window.location.hash === "#admin") {
                  window.location.hash = "";
                }
                if (window.location.search.includes("admin")) {
                  window.history.replaceState({}, document.title, window.location.pathname);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
