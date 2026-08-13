// Figma 레이어: 오퍼1 — 기준 등록 마법사 1/3. 차량 원가 정보를 입력받아 AI가 손익분기 운임을 계산합니다.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OfferStepHeader from '../../components/offer/OfferStepHeader';
import SettingRow from '../../components/offer/SettingRow';
import BottomSheet from '../../components/common/BottomSheet';
import BottomCTA from '../../components/common/BottomCTA';
import { ROUTES } from '../../router/routes';
import { postCostProfile } from '@/api/offer/onboarding';
import SystemStatusBar from '../../components/common/SystemStatusBar';
import Check from '@iconify-react/material-symbols-light/check';

// 오퍼1 화면에는 원가 관련 숫자 입력 필드가 따로 없어서, 기존 목업 값을 그대로
// 초기 원가로 서버에 제출합니다 (손익분기 계산은 서버가 해줍니다).
const DEFAULT_COST_PER_KM = 1840;
const DEFAULT_VALUE_PER_HOUR = 41000;

// 지금은 각 항목에 실제 선택지가 따로 없어서, 기존 하드코딩 값을 단일 옵션으로 둡니다.
const VEHICLE_TYPE_OPTIONS = ['5톤 윙바디'];
const FUEL_EFFICIENCY_OPTIONS = ['4.2 km/L (경유)'];
const OPERATING_AREA_OPTIONS = ['수도권 남부 ↔ 대구·경북'];

type CostProfile = {
  cost_per_km: number;
  value_per_hour: number;
  min_fare_per_km: number;
  daily_min_revenue: number;
};

export default function OfferCostStep() {
  const navigate = useNavigate();
  const [costProfile, setCostProfile] = useState<CostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPE_OPTIONS[0]);
  const [fuelEfficiency, setFuelEfficiency] = useState(
    FUEL_EFFICIENCY_OPTIONS[0],
  );
  const [operatingArea, setOperatingArea] = useState(OPERATING_AREA_OPTIONS[0]);
  const [openSheet, setOpenSheet] = useState<
    'vehicleType' | 'fuelEfficiency' | 'operatingArea' | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    postCostProfile({
      cost_per_km: DEFAULT_COST_PER_KM,
      value_per_hour: DEFAULT_VALUE_PER_HOUR,
    })
      .then((res) => {
        if (!cancelled) setCostProfile(res.cost_profile);
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
        <SettingRow
          label="차종 / 톤수"
          value={vehicleType}
          hasDropdown
          onClick={() => setOpenSheet('vehicleType')}
        />
        <SettingRow label="월 할부·보험·지입료" value="₩4,120,000" />
        <SettingRow
          label="연비"
          value={fuelEfficiency}
          hasDropdown
          onClick={() => setOpenSheet('fuelEfficiency')}
        />
        <SettingRow
          label="주 활동 권역"
          value={operatingArea}
          hasDropdown
          onClick={() => setOpenSheet('operatingArea')}
        />

        <div className="mt-[16px] flex flex-col gap-[8px] rounded-[12px] border border-[color:var(--color-action-primary)] bg-[var(--color-blue-50)] p-[16px]">
          <p className="text-[12px] font-bold text-[color:var(--color-action-primary)]">
            AI가 아래 손익분기를 제안했어요
          </p>
          {error ? (
            <p className="text-[13px] text-[color:var(--color-point-red)]">
              {error}
            </p>
          ) : (
            <p className="text-[16px] leading-[1.5] text-[color:var(--color-text-primary)]">
              {isLoading || costProfile === null ? (
                '계산 중...'
              ) : (
                <>
                  <span className="font-bold">
                    km당 최소 운임{' '}
                    {costProfile.min_fare_per_km.toLocaleString()}원
                  </span>
                  <span className="font-normal"> · 일 최소 매출</span>
                  <br />
                  <span className="font-black">
                    ₩{costProfile.daily_min_revenue.toLocaleString()}
                  </span>
                </>
              )}
            </p>
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

      <BottomSheet
        isOpen={openSheet === 'vehicleType'}
        onClose={() => setOpenSheet(null)}
        title="차종 / 톤수"
      >
        <div className="flex flex-col">
          {VEHICLE_TYPE_OPTIONS.map((option) => {
            const isSelected = vehicleType === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setVehicleType(option);
                  setOpenSheet(null);
                }}
                className="flex items-center justify-between border-b border-[var(--color-gray-100)] py-[14px] text-left last:border-b-0"
              >
                <span className="text-[16px] text-[color:var(--color-text-primary)]">
                  {option}
                </span>
                {isSelected && (
                  <Check
                    width="20"
                    height="20"
                    className="text-[color:var(--color-action-primary)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={openSheet === 'fuelEfficiency'}
        onClose={() => setOpenSheet(null)}
        title="연비"
      >
        <div className="flex flex-col">
          {FUEL_EFFICIENCY_OPTIONS.map((option) => {
            const isSelected = fuelEfficiency === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setFuelEfficiency(option);
                  setOpenSheet(null);
                }}
                className="flex items-center justify-between border-b border-[var(--color-gray-100)] py-[14px] text-left last:border-b-0"
              >
                <span className="text-[16px] text-[color:var(--color-text-primary)]">
                  {option}
                </span>
                {isSelected && (
                  <Check
                    width="20"
                    height="20"
                    className="text-[color:var(--color-action-primary)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={openSheet === 'operatingArea'}
        onClose={() => setOpenSheet(null)}
        title="주 활동 권역"
      >
        <div className="flex flex-col">
          {OPERATING_AREA_OPTIONS.map((option) => {
            const isSelected = operatingArea === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setOperatingArea(option);
                  setOpenSheet(null);
                }}
                className="flex items-center justify-between border-b border-[var(--color-gray-100)] py-[14px] text-left last:border-b-0"
              >
                <span className="text-[16px] text-[color:var(--color-text-primary)]">
                  {option}
                </span>
                {isSelected && (
                  <Check
                    width="20"
                    height="20"
                    className="text-[color:var(--color-action-primary)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
