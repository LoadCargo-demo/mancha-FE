// Figma 레이어: 오퍼1 — 기준 등록 마법사 1/3. 차량 원가 정보를 입력받아 AI가 손익분기 운임을 계산합니다.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stars2 from '@iconify-react/material-symbols-light/stars-2';

import OfferStepHeader from '../../components/offer/OfferStepHeader';
import SettingRow from '../../components/offer/SettingRow';
import BottomCTA from '../../components/common/BottomCTA';
import { ROUTES } from '../../router/routes';
import { postCostProfile } from '@/api/offer/onboarding';
import SystemStatusBar from '../../components/common/SystemStatusBar';

// 오퍼1 화면에는 원가 관련 숫자 입력 필드가 따로 없어서, 기존 목업 값을 그대로
// 초기 원가로 서버에 제출합니다 (손익분기 계산은 서버가 해줍니다).
const DEFAULT_COST_PER_KM = 1840;
const DEFAULT_VALUE_PER_HOUR = 41000;

export default function OfferCostStep() {
  const navigate = useNavigate();
  const [minFarePerKm, setMinFarePerKm] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    postCostProfile({
      cost_per_km: DEFAULT_COST_PER_KM,
      value_per_hour: DEFAULT_VALUE_PER_HOUR,
    })
      .then((res) => {
        if (!cancelled) setMinFarePerKm(res.cost_profile.min_fare_per_km);
      })
      .catch(() => {
        if (!cancelled)
          setError('손익분기 계산에 실패했어요. 잠시 후 다시 시도해주세요.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-dvh w-full max-w-[390px] mx-auto flex-col bg-[var(--color-white-1000)]">
      <SystemStatusBar />
      <OfferStepHeader
        step={1}
        title={'기사님의\n원가를 알고 싶어요.'}
        subtitle="에이전트는 해당 조건 외의 주행을 추천하지 않아요."
      />

      <div className="flex flex-1 flex-col px-[var(--spacing-screen)]">
        <SettingRow label="차종 / 톤수" value="5톤 윙바디" hasDropdown />
        <SettingRow label="월 할부·보험·지입료" value="₩4,120,000" />
        <SettingRow label="연비" value="4.2 km/L (경유)" hasDropdown />
        <SettingRow
          label="주 활동 권역"
          value="수도권 남부 ↔ 대구·경북"
          hasDropdown
        />

        <div className="mt-[16px] flex flex-col gap-[4px] rounded-[12px] bg-[var(--color-blue-50)] p-[16px]">
          <div className="flex items-center gap-[4px] text-[13px] font-semibold text-[color:var(--color-action-primary)]">
            <Stars2 width="14" height="14" />
            AI가 아래 손익분기를 계산했어요
          </div>
          {error ? (
            <p className="text-[13px] text-[color:var(--color-point-red)]">
              {error}
            </p>
          ) : (
            <>
              <p className="text-[14px] text-[color:var(--color-text-primary)]">
                km당 최소 운임
              </p>
              <p className="text-[22px] font-bold text-[color:var(--color-text-primary)]">
                {isLoading || minFarePerKm === null
                  ? '계산 중...'
                  : `${minFarePerKm.toLocaleString()}원`}
              </p>
            </>
          )}
          <p className="text-[11px] text-[color:var(--color-text-secondary)]">
            유가 변동 시 자동 갱신 (주 1회 · 오피넷 기준)
          </p>
        </div>
      </div>

      <BottomCTA
        label="다음"
        enabled={!isLoading}
        onPrimaryClick={() => navigate(ROUTES.offerNewSchedule)}
      />
    </div>
  );
}
