import { create } from 'zustand';

interface QueueState {
  queue: any[];
  addToQueue: (song: any) => void;
  removeFromQueue: (id: string) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  queue: [],
  addToQueue: (song) =>
    set((state) => ({ queue: [...state.queue, song] })),
  removeFromQueue: (id) =>
    set((state) => ({
      queue: state.queue.filter((s) => s.id !== id),
    })),
}));
