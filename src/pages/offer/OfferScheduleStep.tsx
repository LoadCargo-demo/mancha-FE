// Figma 레이어: 오퍼2 — 기준 등록 마법사 2/3. 하루 운행 스케줄과 안전 기준을 입력받습니다.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Add from '@iconify-react/material-symbols-light/add';
import Check from '@iconify-react/material-symbols-light/check';

import OfferStepHeader from '../../components/offer/OfferStepHeader';
import SettingRow from '../../components/offer/SettingRow';
import SegmentedControl from '../../components/common/SegmentedControl';
import Chip from '../../components/common/Chip';
import BottomSheet from '../../components/common/BottomSheet.tsx';
import BottomCTA from '../../components/common/BottomCTA';
import { ROUTES } from '../../router/routes';
import { getRegistrationPrefill } from '@/api/offer/registration';
import { useOfferDraftStore } from '../../store/useOfferDraftStore';
import SystemStatusBar from '../../components/common/SystemStatusBar';

type ScheduleStrictness = 'strict' | 'moderate' | 'flexible';

const STRICTNESS_OPTIONS: { value: ScheduleStrictness; label: string }[] = [
  { value: 'strict', label: '엄격히' },
  { value: 'moderate', label: '웬만하면' },
  { value: 'flexible', label: '유연하게' },
];

// 연속 운행 한도 선택지: 2~6시간
const CONTINUOUS_DRIVE_OPTIONS_MIN = [120, 180, 240, 300, 360];
// 1일 총 운행 한도 선택지: 6~12시간
const DAILY_DRIVE_OPTIONS_MIN = [360, 420, 480, 540, 600, 660, 720];

function minutesToHourLabel(min: number): string {
  if (min % 60 === 0) return `${min / 60}시간`;
  return `${Math.floor(min / 60)}시간 ${min % 60}분`;
}

export default function OfferScheduleStep() {
  const navigate = useNavigate();
  const {
    constraints,
    setConstraints,
    setAiSuggestionMessage,
    updateConstraints,
  } = useOfferDraftStore();
  const [isLoading, setIsLoading] = useState(!constraints);
  const [homeHour, setHomeHour] = useState(20);
  const [strictness, setStrictness] = useState<ScheduleStrictness>('strict');
  const [openSheet, setOpenSheet] = useState<'continuous' | 'daily' | null>(
    null,
  );
  const [fixedSchedules, setFixedSchedules] = useState<string[]>([
    '수 19:00 병원(허리)',
    '주말 휴무',
  ]);

  useEffect(() => {
    if (useOfferDraftStore.getState().constraints) {
      return;
    }
    let cancelled = false;

    getRegistrationPrefill()
      .then((res) => {
        if (cancelled) return;
        setConstraints(res.prefill);
        setAiSuggestionMessage(res.ai_suggestion.message);
      })
      .catch((err) => {
        if (!cancelled) console.error('기준 정보 불러오기 실패:', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeSchedule = (target: string) => {
    setFixedSchedules((prev) => prev.filter((item) => item !== target));
  };

  const addSchedule = () => {
    setFixedSchedules((prev) => [...prev, `새 일정 ${prev.length + 1}`]);
  };

  return (
    <div className="flex h-dvh w-dvh max-w-[390px] mx-auto flex-col bg-[var(--color-white-1000)]">
      <SystemStatusBar />
      <OfferStepHeader
        step={2}
        title={'기사님의\n하루를 작성해주세요.'}
        subtitle="AI는 기사님의 일정을 반영하여 하루를 계획합니다."
      />

      <div className="flex flex-1 flex-col gap-[16px] px-[var(--spacing-screen)]">
        <div className="flex flex-col gap-[16px] rounded-[12px] border border-[var(--color-gray-200)] bg-[var(--color-white-1000)] p-[16px]">
          <span className="text-[16px] font-medium text-[color:var(--color-text-secondary)]">
            귀가 희망 시간
          </span>
          <div className="flex items-center gap-[16px]">
            <div className="relative h-[10px] flex-1">
              <div className="absolute inset-0 rounded-full bg-[var(--color-gray-200)]" />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-action-primary)]"
                style={{ width: `${((homeHour - 16) / (24 - 16)) * 100}%` }}
              />
              <input
                type="range"
                min={16}
                max={24}
                step={1}
                value={homeHour}
                onChange={(e) => setHomeHour(Number(e.target.value))}
                className="absolute inset-0 h-[10px] w-full cursor-pointer appearance-none opacity-0"
              />
            </div>
            <span className="w-[48px] shrink-0 text-right text-[18px] font-bold text-[color:var(--color-text-primary)]">
              {homeHour}:00
            </span>
          </div>
          <SegmentedControl
            options={STRICTNESS_OPTIONS}
            value={strictness}
            onChange={setStrictness}
          />
        </div>

        <div className="flex flex-col rounded-[12px] border border-[var(--color-gray-200)] bg-[var(--color-white-1000)]">
          <div className="flex flex-col gap-[16px] border-b border-[var(--color-gray-200)] p-[16px]">
            <p className="text-[16px] font-medium text-[color:var(--color-text-secondary)]">
              운행 안전 기준
            </p>
            <SettingRow
              variant="plain"
              label="연속 운행 한도"
              value={
                isLoading || !constraints
                  ? '불러오는 중...'
                  : minutesToHourLabel(constraints.max_continuous_drive_min)
              }
              hasDropdown
              onClick={() => setOpenSheet('continuous')}
            />
          </div>
          <div className="p-[16px]">
            <SettingRow
              variant="plain"
              label="1일 총 운행 한도"
              value={
                isLoading || !constraints
                  ? '불러오는 중...'
                  : minutesToHourLabel(constraints.max_daily_drive_min)
              }
              hasDropdown
              onClick={() => setOpenSheet('daily')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-[8px]">
          <div className="rounded-[12px] border border-[var(--color-gray-200)] bg-[var(--color-white-1000)] p-[16px]">
            <p className="text-[13px] font-semibold pb-4 text-[color:var(--color-text-secondary)]">
              고정 일정 (시뮬레이터가 피해감)
            </p>
            <div className="flex flex-wrap gap-[8px]">
              {fixedSchedules.map((schedule) => (
                <Chip
                  key={schedule}
                  label={schedule}
                  onRemove={() => removeSchedule(schedule)}
                />
              ))}
              <button
                type="button"
                onClick={addSchedule}
                className="flex items-center gap-[2px] rounded-full border border-dashed border-[var(--color-gray-300)] py-[8px] pl-[8px] pr-[12px] text-[13px] font-medium text-[color:var(--color-text-secondary)]"
              >
                <Add width="16" height="16" />
                추가
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomCTA
        label="다음"
        enabled={!isLoading}
        onPrimaryClick={() => navigate(ROUTES.offerNewConditions)}
      />

      <BottomSheet
        isOpen={openSheet === 'continuous'}
        onClose={() => setOpenSheet(null)}
        title="연속 운행 한도"
      >
        <div className="flex flex-col">
          {CONTINUOUS_DRIVE_OPTIONS_MIN.map((min) => {
            const isSelected = constraints?.max_continuous_drive_min === min;
            return (
              <button
                key={min}
                type="button"
                onClick={() => {
                  updateConstraints({ max_continuous_drive_min: min });
                  setOpenSheet(null);
                }}
                className="flex items-center justify-between border-b border-[var(--color-gray-100)] py-[14px] text-left last:border-b-0"
              >
                <span className="text-[16px] text-[color:var(--color-text-primary)]">
                  {minutesToHourLabel(min)}
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
        isOpen={openSheet === 'daily'}
        onClose={() => setOpenSheet(null)}
        title="1일 총 운행 한도"
      >
        <div className="flex flex-col">
          {DAILY_DRIVE_OPTIONS_MIN.map((min) => {
            const isSelected = constraints?.max_daily_drive_min === min;
            return (
              <button
                key={min}
                type="button"
                onClick={() => {
                  updateConstraints({ max_daily_drive_min: min });
                  setOpenSheet(null);
                }}
                className="flex items-center justify-between border-b border-[var(--color-gray-100)] py-[14px] text-left last:border-b-0"
              >
                <span className="text-[16px] text-[color:var(--color-text-primary)]">
                  {minutesToHourLabel(min)}
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
