// Figma 레이어: 오퍼2 — 기준 등록 마법사 2/3. 하루 운행 스케줄과 안전 기준을 입력받습니다.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Add from '@iconify-react/material-symbols-light/add';

import OfferStepHeader from '../../components/offer/OfferStepHeader';
import SettingRow from '../../components/offer/SettingRow';
import SegmentedControl from '../../components/common/SegmentedControl';
import Chip from '../../components/common/Chip';
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
  const [fixedSchedules, setFixedSchedules] = useState<string[]>([
    '수 19:00 병원(허리)',
    '주말 휴무',
  ]);

  useEffect(() => {
    // constraints를 deps에 넣으면 이 effect가 스스로 발생시킨 상태 변경 때문에
    // 즉시 재실행→취소되어 setIsLoading(false)가 무시된다. 마운트 시 1회만 실행하고,
    // 이미 로드된 상태인지는 getState()로 그때그때 확인한다.
    if (useOfferDraftStore.getState().constraints) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;

    getRegistrationPrefill()
      .then((res) => {
        if (cancelled) return;
        setConstraints(res.prefill);
        setAiSuggestionMessage(res.ai_suggestion.message);
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

      <div className="flex flex-1 flex-col gap-[24px] px-[var(--spacing-screen)]">
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[color:var(--color-text-secondary)]">
              귀가 희망 시간
            </span>
            <span className="text-[15px] font-semibold text-[color:var(--color-text-primary)]">
              {homeHour}:00
            </span>
          </div>
          <input
            type="range"
            min={16}
            max={24}
            step={1}
            value={homeHour}
            onChange={(e) => setHomeHour(Number(e.target.value))}
            className="h-[6px] w-full appearance-none rounded-full bg-[var(--color-gray-200)] accent-[#3581ff]"
          />
          <SegmentedControl
            options={STRICTNESS_OPTIONS}
            value={strictness}
            onChange={setStrictness}
          />
        </div>

        <div className="flex flex-col">
          <p className="pb-[8px] text-[13px] font-semibold text-[color:var(--color-text-secondary)]">
            운행 안전 기준
          </p>
          <SettingRow
            label="연속 운행 한도"
            value={
              isLoading || !constraints
                ? '불러오는 중...'
                : minutesToHourLabel(constraints.max_continuous_drive_min)
            }
            hasDropdown
            onClick={() =>
              constraints &&
              updateConstraints({
                max_continuous_drive_min:
                  constraints.max_continuous_drive_min === 240 ? 180 : 240,
              })
            }
          />
          <SettingRow
            label="1일 총 운행 한도"
            value={
              isLoading || !constraints
                ? '불러오는 중...'
                : minutesToHourLabel(constraints.max_daily_drive_min)
            }
            hasDropdown
            onClick={() =>
              constraints &&
              updateConstraints({
                max_daily_drive_min:
                  constraints.max_daily_drive_min === 600 ? 540 : 600,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-[8px]">
          <p className="text-[13px] font-semibold text-[color:var(--color-text-secondary)]">
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

      <BottomCTA
        label="다음"
        enabled={!isLoading}
        onPrimaryClick={() => navigate(ROUTES.offerNewConditions)}
      />
    </div>
  );
}
