
import { PlatformSettings } from './types';

class MockDatabase {
  private data: any = {
    users: JSON.parse(localStorage.getItem('toto_users') || '{}'),
    matches: JSON.parse(localStorage.getItem('toto_matches') || '[]'),
    settings: JSON.parse(localStorage.getItem('toto_settings') || JSON.stringify({
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/732/732232.png',
      telegramLink: 'https://t.me/your_channel'
    })),
    chat: {}
  };

  constructor() {
    if (this.data.matches.length === 0) {
      this.data.matches = [
        {
          id: '1',
          title: 'India vs Australia - Border Gavaskar Trophy',
          sport: 'Cricket',
          streamUrl: 'https://test-streams.mux.dev/x36xhzz/url_6/144p/index.m3u8',
          streamType: 'm3u8',
          status: 'live',
          chatEnabled: true,
          viewers: 14205,
          watching: 4200,
          createdAt: Date.now()
        }
      ];
      this.save();
    }
  }

  private save() {
    localStorage.setItem('toto_users', JSON.stringify(this.data.users));
    localStorage.setItem('toto_matches', JSON.stringify(this.data.matches));
    localStorage.setItem('toto_settings', JSON.stringify(this.data.settings));
  }

  getUsers() { return Object.values(this.data.users); }
  getMatches() { return this.data.matches; }
  getUser(uid: string) { return this.data.users[uid]; }
  getSettings(): PlatformSettings { return this.data.settings; }
  
  updateSettings(settings: PlatformSettings) {
    this.data.settings = settings;
    this.save();
  }

  upsertUser(user: any) {
    this.data.users[user.uid] = user;
    this.save();
  }

  deleteUser(uid: string) {
    delete this.data.users[uid];
    this.save();
  }

  addMatch(match: any) {
    this.data.matches.push(match);
    this.save();
  }

  updateMatch(id: string, updates: any) {
    const idx = this.data.matches.findIndex((m: any) => m.id === id);
    if (idx !== -1) {
      this.data.matches[idx] = { ...this.data.matches[idx], ...updates };
      this.save();
    }
  }

  deleteMatch(id: string) {
    this.data.matches = this.data.matches.filter((m: any) => m.id !== id);
    this.save();
  }

  getChat(matchId: string) { return this.data.chat[matchId] || []; }
  addChatMessage(matchId: string, msg: any) {
    if (!this.data.chat[matchId]) this.data.chat[matchId] = [];
    this.data.chat[matchId].push(msg);
  }
}

export const db = new MockDatabase();
