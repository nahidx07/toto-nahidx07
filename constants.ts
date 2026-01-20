
import { Rank } from './types';

export const RANK_THRESHOLDS = [
  { rank: Rank.GRANDMASTER, minXp: 25000, color: 'text-purple-400', bg: 'bg-purple-900/30' },
  { rank: Rank.MASTER, minXp: 10000, color: 'text-red-400', bg: 'bg-red-900/30' },
  { rank: Rank.HEROIC, minXp: 4000, color: 'text-orange-400', bg: 'bg-orange-900/30' },
  { rank: Rank.DIAMOND, minXp: 1500, color: 'text-blue-400', bg: 'bg-blue-900/30' },
  { rank: Rank.PLATINUM, minXp: 500, color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
  { rank: Rank.SILVER, minXp: 100, color: 'text-gray-300', bg: 'bg-gray-700/30' },
  { rank: Rank.BRONZE, minXp: 0, color: 'text-orange-800', bg: 'bg-orange-800/10' },
];

export const XP_GAIN_INTERVAL = 30000; // 30 seconds
export const XP_PER_INTERVAL = 5;

export const getRankByXp = (xp: number): Rank => {
  for (const threshold of RANK_THRESHOLDS) {
    if (xp >= threshold.minXp) return threshold.rank;
  }
  return Rank.BRONZE;
};

export const getRankStyles = (rank: Rank) => {
  return RANK_THRESHOLDS.find(r => r.rank === rank) || RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
};
