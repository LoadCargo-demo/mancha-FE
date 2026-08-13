// 협상 전화 플로우 전체(협상도착 → 근거조회/840/839 → 오퍼요약)에서 공유하는
// "오늘 추천 패키지 id" — 각 화면의 확정 액션이 이 id로 POST /api/briefing/confirm을 호출합니다.

import { create } from 'zustand';

type NegotiationState = {
  recommendedPackageId: string | null;
  setRecommendedPackageId: (id: string | null) => void;
};

export const useNegotiationStore = create<NegotiationState>((set) => ({
  recommendedPackageId: null,
  setRecommendedPackageId: (recommendedPackageId) =>
    set({ recommendedPackageId }),
}));
