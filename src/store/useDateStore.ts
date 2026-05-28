import { create } from 'zustand';
import dayjs from 'dayjs';

type DateState = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
};

export const useDateStore = create<DateState>((set) => ({
  selectedDate: dayjs().format('YYYY-MM-DD'),
  setSelectedDate: (date: string) => set({ selectedDate: date }),
}));