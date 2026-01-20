
export enum Rank {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  PLATINUM = 'Platinum',
  DIAMOND = 'Diamond',
  HEROIC = 'Heroic',
  MASTER = 'Master',
  GRANDMASTER = 'Grandmaster'
}

export type StreamType = 'm3u8' | 'embed';

export interface User {
  uid: string;
  username: string;
  email?: string;
  phone?: string;
  xp: number;
  rank: Rank;
  isAdmin: boolean;
  telegramId?: number;
  photoUrl?: string;
  lastActive?: number;
  isBanned?: boolean;
}

export interface PlatformSettings {
  logoUrl: string;
  telegramLink: string;
}

export interface Match {
  id: string;
  title: string;
  sport: 'Cricket' | 'Football' | 'Basketball' | 'Tennis' | 'Other';
  // Server 1
  streamUrl: string;
  streamType: StreamType;
  // Server 2 (Optional)
  streamUrl2?: string;
  streamType2?: StreamType;
  thumbnailUrl?: string;
  status: 'live' | 'upcoming' | 'ended';
  chatEnabled: boolean;
  viewers: number;
  watching: number;
  createdAt: number;
  description?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  rank: Rank;
  photoUrl?: string;
  isAI?: boolean;
}
