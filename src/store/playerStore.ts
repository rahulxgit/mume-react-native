// src/store/playerStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PlayerStore {
  currentSong: any | null;
  queue: any[];
  currentIndex: number;
  isPlaying: boolean;
  isShuffle: boolean;
  isRepeat: 'none' | 'one' | 'all';
  setCurrentSong: (song: any) => void;
  addToQueue: (songs: any[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      isShuffle: false,
      isRepeat: 'none',
      
      setCurrentSong: (song) => set({ currentSong: song, isPlaying: true }),
      
      addToQueue: (songs) => 
        set((state) => ({ queue: [...state.queue, ...songs] })),
      
      removeFromQueue: (index) =>
        set((state) => ({
          queue: state.queue.filter((_, i) => i !== index),
        })),
      
      clearQueue: () => set({ queue: [] }),
      
      playNext: () => {
        const state = get();
        if (state.isShuffle) {
          const randomIndex = Math.floor(Math.random() * state.queue.length);
          set({ currentIndex: randomIndex, currentSong: state.queue[randomIndex] });
        } else if (state.currentIndex < state.queue.length - 1) {
          const nextIndex = state.currentIndex + 1;
          set({ currentIndex: nextIndex, currentSong: state.queue[nextIndex] });
        } else if (state.isRepeat === 'all') {
          set({ currentIndex: 0, currentSong: state.queue[0] });
        }
      },
      
      playPrevious: () => {
        const state = get();
        if (state.currentIndex > 0) {
          const prevIndex = state.currentIndex - 1;
          set({ currentIndex: prevIndex, currentSong: state.queue[prevIndex] });
        }
      },
      
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      
      toggleRepeat: () =>
        set((state) => ({
          isRepeat: state.isRepeat === 'none' ? 'all' : state.isRepeat === 'all' ? 'one' : 'none',
        })),
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);