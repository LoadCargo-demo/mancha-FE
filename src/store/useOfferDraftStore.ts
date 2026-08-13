// 오퍼1~3(원가/스케줄/조건) 입력값을 화면 이동 중에 들고 있다가,
// 오퍼3 "등록하기"에서 POST /api/registration/day 한 번으로 모아 제출하기 위한 임시 상태.

import { create } from 'zustand';
import type { DriverConstraints } from '../api/negotiation/types';

type OfferDraftState = {
  constraints: DriverConstraints | null;
  aiSuggestionMessage: string | null;
  setConstraints: (constraints: DriverConstraints) => void;
  updateConstraints: (patch: Partial<DriverConstraints>) => void;
  setAiSuggestionMessage: (message: string | null) => void;
};

export const useOfferDraftStore = create<OfferDraftState>((set) => ({
  constraints: null,
  aiSuggestionMessage: null,
  setConstraints: (constraints) => set({ constraints }),
  updateConstraints: (patch) =>
    set((state) => ({
      constraints: state.constraints
        ? { ...state.constraints, ...patch }
        : state.constraints,
    })),
  setAiSuggestionMessage: (aiSuggestionMessage) => set({ aiSuggestionMessage }),
}));
