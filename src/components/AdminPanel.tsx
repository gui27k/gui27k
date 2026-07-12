import React, { useState, useEffect } from "react";
import { 
  Settings, Save, LogOut, Lock, User, Image, Music, Hash, 
  MessageSquare, Share2, Shield, Eye, RefreshCw, AlertCircle, CheckCircle2, Upload
} from "lucide-react";
import { BioConfig } from "../types";

interface FileUploaderProps {
  onUploadSuccess: (url: string) => void;
  sessionToken: string;
  accept: string;
  label: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadSuccess,
  sessionToken,
  accept,
  label,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("token", sessionToken);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        onUploadSuccess(data.url);
      } else {
        setError(data.message || "Erro ao enviar.");
      }
    } catch (err) {
      setError("Erro de conexão ao enviar.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="relative flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-purple-300 text-xs font-semibold cursor-pointer transition-all active:scale-95 text-center shrink-0">
        {isUploading ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <Upload className="w-3.5 h-3.5" />
            <span>{label}</span>
          </>
        )}
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </label>
      {error && <span className="text-[10px] text-red-400 mt-0.5">{error}</span>}
    </div>
  );
};

interface AdminPanelProps {
  currentConfig: BioConfig;
  onConfigSaved: (newConfig: BioConfig) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  currentConfig, 
  onConfigSaved, 
  onClose 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState<"general" | "background" | "music" | "discord" | "socials" | "security">("general");

  // Form states matching BioConfig structure
  const [title, setTitle] = useState(currentConfig.title);
  const [subtitle, setSubtitle] = useState(currentConfig.subtitle);
  const [description, setDescription] = useState(currentConfig.description);
  const [avatarUrl, setAvatarUrl] = useState(currentConfig.avatarUrl);
  const [backgroundType, setBackgroundType] = useState(currentConfig.backgroundType);
  const [backgroundUrl, setBackgroundUrl] = useState(currentConfig.backgroundUrl);
  const [viewsCount, setViewsCount] = useState(currentConfig.viewsCount);
  const [titleGlowColor, setTitleGlowColor] = useState(currentConfig.titleGlowColor);
  const [footerText, setFooterText] = useState(currentConfig.footerText || "69pcc Bio");

  // Discord states
  const [discordUsername, setDiscordUsername] = useState(currentConfig.discord?.username || "");
  const [discordStatus, setDiscordStatus] = useState(currentConfig.discord?.status || "offline");
  const [discordAvatarUrl, setDiscordAvatarUrl] = useState(currentConfig.discord?.avatarUrl || "");
  const [discordProfileUrl, setDiscordProfileUrl] = useState(currentConfig.discord?.profileUrl || "");
  const [showDiscord, setShowDiscord] = useState(currentConfig.discord?.showDiscord ?? true);

  // Music states
  const [songUrl, setSongUrl] = useState(currentConfig.music?.songUrl || "");
  const [songTitle, setSongTitle] = useState(currentConfig.music?.songTitle || "");
  const [artistName, setArtistName] = useState(currentConfig.music?.artistName || "");
  const [albumCoverUrl, setAlbumCoverUrl] = useState(currentConfig.music?.albumCoverUrl || "");
  const [showMusicPlayer, setShowMusicPlayer] = useState(currentConfig.music?.showMusicPlayer ?? true);

  // Social states
  const [twitter, setTwitter] = useState(currentConfig.socials?.twitter || "");
  const [tiktok, setTiktok] = useState(currentConfig.socials?.tiktok || "");
  const [spotify, setSpotify] = useState(currentConfig.socials?.spotify || "");
  const [instagram, setInstagram] = useState(currentConfig.socials?.instagram || "");
  const [github, setGithub] = useState(currentConfig.socials?.github || "");
  const [youtube, setYoutube] = useState(currentConfig.socials?.youtube || "");
  const [twitch, setTwitch] = useState(currentConfig.socials?.twitch || "");
  const [customLabel, setCustomLabel] = useState(currentConfig.socials?.customLabel || "");
  const [customUrl, setCustomUrl] = useState(currentConfig.socials?.customUrl || "");

  // Entry Screen Config
  const [entryEmoji, setEntryEmoji] = useState(currentConfig.entryScreen?.emoji || "🔑");
  const [entryText, setEntryText] = useState(currentConfig.entryScreen?.text || "clique para entrar...");

  // Password update state
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Notification Toast states
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [toastMessage, setToastMessage] = useState("");

  // Check existing session
  useEffect(() => {
    const savedToken = sessionStorage.getItem("fakecrime_admin_token");
    if (savedToken) {
      setSessionToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("fakecrime_admin_token", data.token);
        setSessionToken(data.token);
        setIsAuthenticated(true);
        setPasswordInput("");
      } else {
        setLoginError(data.message || "Erro ao fazer login.");
      }
    } catch (err) {
      setLoginError("Não foi possível conectar ao servidor.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("fakecrime_admin_token");
    setSessionToken("");
    setIsAuthenticated(false);
  };

  const showToast = (status: "success" | "error", msg: string) => {
    setSaveStatus(status);
    setToastMessage(msg);
    setTimeout(() => {
      setSaveStatus("idle");
    }, 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmNewPassword) {
      showToast("error", "As senhas não coincidem!");
      return;
    }

    setSaveStatus("saving");

    const updatedConfigPayload: BioConfig = {
      title,
      subtitle,
      description,
      avatarUrl,
      backgroundType,
      backgroundUrl,
      viewsCount,
      titleGlowColor,
      footerText,
      discord: {
        username: discordUsername,
        status: discordStatus as any,
        avatarUrl: discordAvatarUrl,
        profileUrl: discordProfileUrl,
        showDiscord,
      },
      socials: {
        twitter,
        tiktok,
        spotify,
        instagram,
        github,
        youtube,
        twitch,
        customLabel,
        customUrl,
      },
      music: {
        songUrl,
        songTitle,
        artistName,
        albumCoverUrl,
        showMusicPlayer,
      },
      entryScreen: {
        emoji: entryEmoji,
        text: entryText,
        backgroundType: currentConfig.entryScreen?.backgroundType || "interactive_rain",
        backgroundUrl: currentConfig.entryScreen?.backgroundUrl || "",
      },
    };

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          config: updatedConfigPayload,
          newPassword: newPassword.trim() !== "" ? newPassword : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "Configurações salvas com sucesso!");
        onConfigSaved(updatedConfigPayload);
        setNewPassword("");
        setConfirmNewPassword("");
        
        // If password was changed, update our token or force login again
        if (newPassword.trim() !== "") {
          sessionStorage.setItem("fakecrime_admin_token", "fakecrime-session-token-" + newPassword);
          setSessionToken("fakecrime-session-token-" + newPassword);
        }
      } else {
        showToast("error", data.message || "Erro ao atualizar.");
      }
    } catch (err) {
      showToast("error", "Erro de rede ao salvar configurações.");
    }
  };

  // Helper lists of choices
  const bgPresetOptions = [
    { name: "Chuva Interativa", value: "interactive_rain" },
    { name: "Imagem Customizada", value: "image" },
    { name: "Vídeo MP4 Direto", value: "video" },
    { name: "Cor Sólida", value: "color" },
  ];

  const glowOptions = [
    { name: "Nenhum", value: "none" },
    { name: "Branco Neon", value: "white" },
    { name: "Roxo Neon", value: "purple" },
    { name: "Azul Neon", value: "blue" },
    { name: "Vermelho Neon", value: "red" },
    { name: "Verde Neon", value: "green" },
  ];

  const discordStatusOptions = [
    { name: "Online", value: "online" },
    { name: "Ausente (Idle)", value: "idle" },
    { name: "Não Perturbe (DND)", value: "dnd" },
    { name: "Invisível / Offline", value: "offline" },
  ];

  const presetTracks = [
    { title: "Summer Nights", artist: "Liqwyd", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80" },
    { title: "Midnight Drive", artist: "Electronic Synth", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", cover: "https://images.unsplash.com/photo-1515462277126-270d878326e5?auto=format&fit=crop&w=300&q=80" },
    { title: "Chill Lofi Beat", artist: "Royalty Free", url: "https://cdn.pixabay.com/audio/2022/03/10/audio_c37b36bb22.mp3", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80" }
  ];

  const selectPresetTrack = (track: typeof presetTracks[0]) => {
    setSongTitle(track.title);
    setArtistName(track.artist);
    setSongUrl(track.url);
    setAlbumCoverUrl(track.cover);
  };

  // 1. Password/Login view
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 glass-card rounded-2xl border border-white/10 flex flex-col gap-5 text-center shadow-2xl relative overflow-hidden animate-float">
          {/* Top glowing line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 via-white to-purple-500 animate-pulse" />
          
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white/5 rounded-full text-white/80 border border-white/10 animate-pulse">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-sans mt-2">Área Administrativa</h1>
            <p className="text-xs text-white/50 font-sans">
              Insira a senha do painel para editar os links, redes sociais, músicas e perfil do seu Bio Link.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Senha de Acesso (Padrão: admin)</label>
              <input
                type="password"
                placeholder="Insira a senha de administrador..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                id="admin-password-field"
                className="w-full px-4 py-3 bg-white/5 text-white placeholder-white/30 border border-white/10 rounded-xl focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 text-sm font-sans"
                required
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-1.5 text-red-400 bg-red-500/10 p-2.5 rounded-lg text-xs justify-center border border-red-500/20 font-sans animate-shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-white/10 text-white/70 rounded-xl text-sm font-medium hover:bg-white/5 active:scale-95 transition-all cursor-pointer font-sans"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 active:scale-95 transition-all cursor-pointer font-sans flex items-center justify-center gap-1.5"
              >
                Acessar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Main Admin Dashboard View
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* Toast Alert */}
      {saveStatus !== "idle" && (
        <div className="fixed top-4 right-4 z-50 animate-bounce flex items-center gap-2 px-4 py-3 rounded-xl border glass-card text-white shadow-2xl">
          {saveStatus === "saving" && <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />}
          {saveStatus === "success" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
          {saveStatus === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
          <span className="text-sm font-medium font-sans">{toastMessage || "Processando..."}</span>
        </div>
      )}

      {/* Admin Sidebar Navigation */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-black/40 flex flex-col justify-between shrink-0">
        
        {/* Brand & Tabs */}
        <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-[50vh] md:max-h-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-white/80 animate-spin" style={{ animationDuration: "12s" }} />
              <span className="text-base font-bold tracking-tight text-white font-sans">Painel Bio Admin</span>
            </div>
            <button 
              onClick={handleLogout}
              title="Sair do Painel"
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors cursor-pointer md:hidden"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="h-[1px] bg-white/5" />

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer font-sans ${activeTab === "general" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"}`}
            >
              <User className="w-4 h-4" />
              <span>Geral & Perfil</span>
            </button>

            <button
              onClick={() => setActiveTab("background")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer font-sans ${activeTab === "background" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"}`}
            >
              <Image className="w-4 h-4" />
              <span>Fundo e Layout</span>
            </button>

            <button
              onClick={() => setActiveTab("music")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer font-sans ${activeTab === "music" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"}`}
            >
              <Music className="w-4 h-4" />
              <span>Música e Player</span>
            </button>

            <button
              onClick={() => setActiveTab("discord")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer font-sans ${activeTab === "discord" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Widget Discord</span>
            </button>

            <button
              onClick={() => setActiveTab("socials")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer font-sans ${activeTab === "socials" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"}`}
            >
              <Share2 className="w-4 h-4" />
              <span>Redes Sociais</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer font-sans ${activeTab === "security" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"}`}
            >
              <Shield className="w-4 h-4" />
              <span>Segurança & Senha</span>
            </button>
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-5 hidden md:flex flex-col gap-3 border-t border-white/5 bg-black/20">
          <div className="flex items-center justify-between text-xs text-white/30 font-sans">
            <span>Admin logado</span>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500/15 text-red-300 border border-red-500/20 hover:bg-red-500/25 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form Scroll View */}
      <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between h-full overflow-hidden bg-black/20">
        
        {/* Scroll Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
          
          {/* General and Profile Section */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-sans">Geral & Configurações de Perfil</h2>
                <p className="text-xs text-white/40 font-sans mt-1">Configure o nome de usuário principal, subtítulo de status, avatar e contador de visualizações.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Nome do Usuário (Título)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: 69pcc"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Subtítulo (Status / Bio)</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Ex: 最好的"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Descrição Curta / Status Expandido</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Uma frase curta de impacto para seu perfil..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">URL da Foto de Perfil (Avatar)</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://exemplo.com/sua-foto.jpg"
                        className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                        required
                      />
                      {avatarUrl && (
                        <img src={avatarUrl} alt="Preview Avatar" className="w-10 h-10 rounded-full border border-white/15 object-cover shrink-0" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                      )}
                    </div>
                    <FileUploader
                      onUploadSuccess={setAvatarUrl}
                      sessionToken={sessionToken}
                      accept="image/*"
                      label="Upload Foto"
                    />
                  </div>
                  <span className="text-[10px] text-white/30">Insira um link direto de imagem ou clique em "Upload Foto" para enviar diretamente do seu computador.</span>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Efeito de Brilho no Nome (Glow)</label>
                  <select
                    value={titleGlowColor}
                    onChange={(e) => setTitleGlowColor(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30 cursor-pointer"
                  >
                    {glowOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Visualizações Atuais (Editar Contador)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={viewsCount}
                      onChange={(e) => setViewsCount(parseInt(e.target.value) || 0)}
                      className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                    />
                    <button 
                      type="button"
                      onClick={() => setViewsCount(0)}
                      className="px-3 py-2.5 border border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Zerar
                    </button>
                  </div>
                </div>

                {/* Entry Screen Settings */}
                <div className="md:col-span-2 border-t border-white/5 pt-5 mt-2">
                  <h3 className="text-sm font-semibold text-white/80 font-sans mb-3">Tela de Entrada (Antes de Clicar)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Emoji no Centro</label>
                      <input
                        type="text"
                        value={entryEmoji}
                        onChange={(e) => setEntryEmoji(e.target.value)}
                        placeholder="Ex: 👼🏻 ou 🧸"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Frase de Entrada</label>
                      <input
                        type="text"
                        value={entryText}
                        onChange={(e) => setEntryText(e.target.value)}
                        placeholder="Ex: clique para entrar..."
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-left md:col-span-2 pt-2">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Rodapé (Footer Text)</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Ex: Made by fakecrime"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Background and Layout settings */}
          {activeTab === "background" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-sans">Mídia de Fundo (Fundo do Bio)</h2>
                <p className="text-xs text-white/40 font-sans mt-1">Configure o estilo de fundo do seu Bio Link. Você pode habilitar chuva interativa baseada em Canvas ou fornecer mídias próprias (vídeos/imagens).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Tipo de Fundo</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {bgPresetOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setBackgroundType(opt.value as any)}
                        className={`py-3 px-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${backgroundType === opt.value ? "bg-white text-black border-white" : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"}`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>

                {backgroundType !== "interactive_rain" && (
                  <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
                      {backgroundType === "color" ? "Código Hexadecimal da Cor" : "URL Direta da Mídia"}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={backgroundUrl}
                        onChange={(e) => setBackgroundUrl(e.target.value)}
                        placeholder={backgroundType === "color" ? "Ex: #0a0a0c" : "https://exemplo.com/fundo.mp4 ou .jpg"}
                        className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                        required={backgroundType !== "color"}
                      />
                      {backgroundType !== "color" && (
                        <FileUploader
                          onUploadSuccess={setBackgroundUrl}
                          sessionToken={sessionToken}
                          accept={backgroundType === "video" ? "video/*" : "image/*"}
                          label={backgroundType === "video" ? "Upload Vídeo" : "Upload Imagem"}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-white/30">
                      {backgroundType === "video" 
                        ? "Certifique-se de usar um link de vídeo MP4 direto ou clique em 'Upload Vídeo'." 
                        : backgroundType === "color"
                        ? "Insira um código hexadecimal válido de cor."
                        : "Suporta links de fotos comuns .jpg, .png, etc., ou clique em 'Upload Imagem'."}
                    </span>
                  </div>
                )}

                {/* Aesthetic preview placeholder */}
                <div className="md:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2 items-center text-center justify-center">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-widest font-mono">Aviso de Experiência</span>
                  <p className="text-[11px] text-white/40 max-w-md font-sans">
                    A chuva interativa de fundo cria ondulações circulares (Ripples) automaticamente e no local onde o visitante clica! Isso replica perfeitamente o visual autêntico do Fakecrime.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Music settings */}
          {activeTab === "music" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-sans">Música do Bio Link</h2>
                <p className="text-xs text-white/40 font-sans mt-1">Sua música começará a tocar automaticamente assim que o visitante clicar no emoji na tela de entrada do seu site.</p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 mb-2">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-white font-sans">Mostrar Player de Música</span>
                  <span className="text-xs text-white/40 font-sans">Habilita/Desabilita o player glassmorphic visível para o visitante controlar a faixa.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMusicPlayer(!showMusicPlayer)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showMusicPlayer ? 'bg-purple-600' : 'bg-white/10'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showMusicPlayer ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">URL Direta do Áudio (Link MP3)</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={songUrl}
                      onChange={(e) => setSongUrl(e.target.value)}
                      placeholder="https://exemplo.com/musica.mp3"
                      className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                      required
                    />
                    <FileUploader
                      onUploadSuccess={setSongUrl}
                      sessionToken={sessionToken}
                      accept="audio/*"
                      label="Upload Áudio"
                    />
                  </div>
                  <span className="text-[10px] text-white/30">Insira um link de áudio que termine com .mp3 ou clique em "Upload Áudio" para enviar diretamente do seu computador.</span>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Título da Faixa</label>
                  <input
                    type="text"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Ex: FakeCrime Theme"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Artista da Faixa</label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Ex: Kid Cudi"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">URL da Capa do Álbum (Foto da Música)</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={albumCoverUrl}
                      onChange={(e) => setAlbumCoverUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-... ou URL de imagem direta"
                      className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                    />
                    <FileUploader
                      onUploadSuccess={setAlbumCoverUrl}
                      sessionToken={sessionToken}
                      accept="image/*"
                      label="Upload Capa"
                    />
                  </div>
                  <span className="text-[10px] text-white/30">Suporta links diretos de imagens .jpg, .png, etc., ou clique em "Upload Capa" para enviar. Deixe em branco para exibir o ícone musical padrão.</span>
                </div>

                {/* Track Presets */}
                <div className="md:col-span-2 pt-3 border-t border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Músicas Prontas recomendadas para Teste</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {presetTracks.map((track, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectPresetTrack(track)}
                        className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all"
                      >
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-semibold text-white truncate">{track.title}</span>
                          <span className="text-[10px] text-white/40 truncate">{track.artist}</span>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 text-white/60 rounded-md">Selecionar</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Discord settings */}
          {activeTab === "discord" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-sans">Barra de Integração do Discord</h2>
                <p className="text-xs text-white/40 font-sans mt-1">Exiba seu status do Discord, avatar e link de convite na parte inferior do seu card, adicionando maior utilidade ao perfil.</p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 mb-2">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-white font-sans">Mostrar Widget Discord</span>
                  <span className="text-xs text-white/40 font-sans">Habilita/Desabilita a aba inferior do Discord no card bio.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDiscord(!showDiscord)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showDiscord ? 'bg-purple-600' : 'bg-white/10'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showDiscord ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Nome de Usuário / Tag</label>
                  <input
                    type="text"
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)}
                    placeholder="Ex: @69pcc ou 69pcc"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                    required={showDiscord}
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Status do Discord</label>
                  <select
                    value={discordStatus}
                    onChange={(e) => setDiscordStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30 cursor-pointer"
                  >
                    {discordStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">URL da Foto de Avatar (Discord)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={discordAvatarUrl}
                      onChange={(e) => setDiscordAvatarUrl(e.target.value)}
                      placeholder="https://exemplo.com/foto-discord.png"
                      className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                      required={showDiscord}
                    />
                    {discordAvatarUrl && (
                      <img src={discordAvatarUrl} alt="Preview Discord" className="w-10 h-10 rounded-full border border-white/15 object-cover shrink-0" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Link do Perfil ou Convite de Amizade</label>
                  <input
                    type="url"
                    value={discordProfileUrl}
                    onChange={(e) => setDiscordProfileUrl(e.target.value)}
                    placeholder="https://discord.gg/convite ou https://discord.com/users/id"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                    required={showDiscord}
                  />
                  <span className="text-[10px] text-white/30">O botão &quot;Profile&quot; no site do visitante abrirá este link direto.</span>
                </div>
              </div>
            </div>
          )}

          {/* Socials Settings */}
          {activeTab === "socials" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-sans">Redes Sociais e Botões de Link</h2>
                <p className="text-xs text-white/40 font-sans mt-1">Configure as URLs correspondentes das suas redes sociais. Deixe em branco se desejar desabilitar um ícone específico.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Twitter / X URL</label>
                  <input
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/username"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">TikTok URL</label>
                  <input
                    type="url"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="https://tiktok.com/@username"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Spotify URL</label>
                  <input
                    type="url"
                    value={spotify}
                    onChange={(e) => setSpotify(e.target.value)}
                    placeholder="https://open.spotify.com/artist/id"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Instagram URL</label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/username"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">GitHub URL</label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">YouTube URL</label>
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/@username"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Twitch URL</label>
                  <input
                    type="url"
                    value={twitch}
                    onChange={(e) => setTwitch(e.target.value)}
                    placeholder="https://twitch.tv/username"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="md:col-span-2 border-t border-white/5 pt-5 mt-2">
                  <h3 className="text-sm font-semibold text-white/80 font-sans mb-3">Botão Adicional Customizado</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Etiqueta do Botão</label>
                      <input
                        type="text"
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                        placeholder="Ex: Meu Servidor ou Site Pessoal"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">URL de Destino</label>
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://seu-link-customizado.com"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security & Password section */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-sans">Segurança & Alteração de Senha</h2>
                <p className="text-xs text-white/40 font-sans mt-1">Altere a senha que dá acesso a este painel administrativo para manter as suas configurações seguras.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 4 caracteres..."
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repita a nova senha..."
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-yellow-300 font-sans">Atenção ao alterar</span>
                  <p className="text-[10px] text-white/50 font-sans mt-0.5">
                    Guarde a nova senha com cuidado! Se você esquecer a senha, poderá reinicializá-la consultando o arquivo <code className="px-1 py-0.5 rounded bg-black/40 text-yellow-200">bio_config.json</code> no servidor do workspace.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Lower Submit/Action Footer bar */}
        <div className="p-5 border-t border-white/5 bg-black/40 flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 border border-white/10 text-white/70 hover:bg-white/5 hover:text-white rounded-xl text-sm font-medium transition-all cursor-pointer font-sans"
          >
            Fechar Painel
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-white hover:bg-white/90 text-black rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-white/5 transition-all cursor-pointer font-sans"
          >
            <Save className="w-4 h-4 fill-black" />
            <span>Salvar Alterações</span>
          </button>
        </div>

      </form>
    </div>
  );
};
