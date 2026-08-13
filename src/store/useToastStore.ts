import { create } from 'zustand';

type ToastState = {
  message: string | null;
  /** 같은 메시지를 다시 띄워도 애니메이션이 재시작되도록 매번 바뀌는 키 */
  key: number;
  showToast: (message: string) => void;
  hideToast: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  key: 0,
  showToast: (message) => set((state) => ({ message, key: state.key + 1 })),
  hideToast: () => set({ message: null }),
}));
