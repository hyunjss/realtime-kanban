import { create } from 'zustand';
import type { ConnectionStatus } from '@/lib/socket';

const NICKNAME_STORAGE_KEY = 'realtime-kanban:nickname';

function getStoredNickname(): string {
  try {
    const v = localStorage.getItem(NICKNAME_STORAGE_KEY);
    return typeof v === 'string' && v.trim() ? v.trim() : '';
  } catch {
    return '';
  }
}

export interface PresenceUser {
  userId: string;
  color: string;
}

const PRESENCE_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

function colorForUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = hash * 31 + userId.charCodeAt(i);
    hash = Math.imul(hash, 1) || hash;
  }
  const index = Math.abs(hash) % PRESENCE_COLORS.length;
  const color = PRESENCE_COLORS[index];
  return color ?? PRESENCE_COLORS[0]!;
}

interface SocketState {
  status: ConnectionStatus;
  error: string | null;
  mySocketId: string | null;
  myNickname: string;
  presence: PresenceUser[];
}

interface SocketActions {
  setStatus: (status: ConnectionStatus) => void;
  setError: (error: string | null) => void;
  setMySocketId: (id: string | null) => void;
  setMyNickname: (name: string) => void;
  addPresence: (userId: string) => void;
  removePresence: (userId: string) => void;
  clearPresence: () => void;
}

export const socketStore = create<SocketState & SocketActions>((set) => ({
  status: 'idle',
  error: null,
  mySocketId: null,
  myNickname: getStoredNickname(),
  presence: [],

  setStatus(status) {
    set({ status });
  },

  setError(error) {
    set({ error });
  },

  setMySocketId(id) {
    set({ mySocketId: id });
  },

  setMyNickname(name) {
    const trimmed = typeof name === 'string' ? name.trim() : '';
    try {
      if (trimmed) localStorage.setItem(NICKNAME_STORAGE_KEY, trimmed);
      else localStorage.removeItem(NICKNAME_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    set({ myNickname: trimmed });
  },

  addPresence(userId) {
    set((state) => {
      if (state.presence.some((u) => u.userId === userId)) return state;
      return {
        presence: [
          ...state.presence,
          { userId, color: colorForUserId(userId) },
        ],
      };
    });
  },

  removePresence(userId) {
    set((state) => ({
      presence: state.presence.filter((u) => u.userId !== userId),
    }));
  },

  clearPresence() {
    set({ presence: [], mySocketId: null });
  },
}));

export const useSocketStore = socketStore;
