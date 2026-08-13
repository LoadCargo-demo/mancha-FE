// Figma 레이어: 오퍼4 — 기준 등록 완료. 여기서 "AI 협상 시작"을 누르면 협상(전화) 플로우로 넘어갑니다.

import { useLocation, useNavigate } from 'react-router-dom';
import CheckCircle from '@iconify-react/material-symbols-light/check-circle';

import Navigation from '../../components/common/Navigation';
import BottomCTA from '../../components/common/BottomCTA';
import { ROUTES } from '../../router/routes';
import SystemStatusBar from '../../components/common/SystemStatusBar';

export default function OfferCompleteStep() {
  const navigate = useNavigate();
  const location = useLocation();
  const message: string =
    (location.state as { message?: string } | null)?.message ??
    '브리핑은 내일 04:40에 음성으로 도착합니다';

  return (
    <div className="flex h-dvh w-full max-w-[390px] mx-auto flex-col bg-[var(--color-white-1000)]">
      <SystemStatusBar />
      <Navigation title="등록하기" onBack={() => navigate(-1)} />

      <div className="flex flex-1 flex-col items-center justify-center gap-[12px] px-[var(--spacing-screen)] text-center">
        <CheckCircle
          width="64"
          height="64"
          className="text-[color:var(--color-action-primary)]"
        />
        <p className="text-[20px] font-bold text-[color:var(--color-text-primary)]">
          등록완료!
        </p>
        <p className="text-[14px] text-[color:var(--color-text-secondary)]">
          {message}
        </p>
      </div>

      <BottomCTA
        label="AI 협상 시작"
        onPrimaryClick={() => navigate(ROUTES.negotiationCall)}
      />
    </div>
  );
}
