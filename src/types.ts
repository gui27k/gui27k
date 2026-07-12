export interface DiscordConfig {
  username: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  avatarUrl: string;
  profileUrl: string;
  showDiscord: boolean;
}

export interface SocialLinks {
  twitter: string;
  tiktok: string;
  spotify: string;
  instagram: string;
  github: string;
  youtube: string;
  twitch: string;
  customLabel: string;
  customUrl: string;
}

export interface MusicConfig {
  songUrl: string;
  songTitle: string;
  artistName: string;
  albumCoverUrl?: string;
  showMusicPlayer: boolean;
}

export interface EntryScreenConfig {
  emoji: string;
  text: string;
  backgroundType: 'color' | 'interactive_rain' | 'custom_image';
  backgroundUrl: string;
}

export interface BioConfig {
  title: string;
  subtitle: string;
  description: string;
  avatarUrl: string;
  backgroundType: 'image' | 'video' | 'color' | 'interactive_rain';
  backgroundUrl: string;
  viewsCount: number;
  titleGlowColor: 'none' | 'white' | 'purple' | 'blue' | 'red' | 'green' | 'rgb';
  discord: DiscordConfig;
  socials: SocialLinks;
  music: MusicConfig;
  entryScreen: EntryScreenConfig;
  footerText: string;
}
