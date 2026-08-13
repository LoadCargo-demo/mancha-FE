// 오퍼3 - 기준 등록 마법사 3/3. AI가 제안한 내일 스케줄을 확인하고 시장에 등록합니다.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Bolt from '@iconify-react/material-symbols-light/bolt';
import CheckCircle from '@iconify-react/material-symbols-light/check-circle';
import RadioButtonUnchecked from '@iconify-react/material-symbols-light/radio-button-unchecked';

import SystemStatusBar from '../../components/common/SystemStatusBar';
import OfferStepHeader from '../../components/offer/OfferStepHeader';
import SettingRow from '../../components/offer/SettingRow';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import BottomCTA from '../../components/common/BottomCTA';
import { ROUTES } from '../../router/routes';
import {
  getRegistrationPrefill,
  postRegisterDay,
} from '../../api/offer/registration';
import { useOfferDraftStore } from '../../store/useOfferDraftStore';

export default function OfferConditionsStep() {
  const navigate = useNavigate();
  const {
    constraints,
    setConstraints,
    aiSuggestionMessage,
    setAiSuggestionMessage,
    updateConstraints,
  } = useOfferDraftStore();
  const [isLoading, setIsLoading] = useState(!constraints);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [acceptAiSuggestion, setAcceptAiSuggestion] = useState(true);

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

  const handleRegister = () => {
    if (!constraints) return;
    setIsSubmitting(true);
    setSubmitError(null);

    postRegisterDay(constraints)
      .then((res) => {
        navigate(ROUTES.offerNewComplete, { state: { message: res.message } });
      })
      .catch(() => {
        setSubmitError('등록에 실패했어요. 잠시 후 다시 시도해주세요.');
        setIsSubmitting(false);
      });
  };

  return (
    <div className="flex h-dvh w-full max-w-[390px] mx-auto flex-col bg-[var(--color-white-1000)]">
      <SystemStatusBar />

      <OfferStepHeader
        step={3}
        title={'기사님의 내일 하루를\n시장에 등록해요.'}
        subtitle="기사님의 설정 조건을 고려한 스케줄이에요."
      />

      <div className="flex flex-1 flex-col gap-[16px] px-[var(--spacing-screen)]">
        <div className="flex items-center gap-[4px] rounded-[8px] bg-[var(--color-blue-50)] px-[12px] py-[10px] text-[12px] font-medium text-[color:var(--color-action-primary)]">
          <Bolt width="14" height="14" />
          AI 에이전트 · 기존 대비 공차 감소율 최소 20% 예상
        </div>

        {aiSuggestionMessage && (
          <button
            type="button"
            onClick={() => setAcceptAiSuggestion((prev) => !prev)}
            className="flex items-start justify-between gap-[12px] rounded-[12px] border border-[var(--color-gray-100)] p-[16px] text-left"
          >
            <div className="flex flex-col gap-[6px]">
              <span className="w-fit rounded-full bg-[var(--color-action-primary)] px-[8px] py-[2px] text-[11px] font-bold text-[color:var(--color-text-inverse)]">
                AI 제안
              </span>
              <p className="text-[14px] font-semibold leading-[1.5] text-[color:var(--color-text-primary)]">
                {aiSuggestionMessage}
              </p>
            </div>
            {acceptAiSuggestion ? (
              <CheckCircle
                width="22"
                height="22"
                className="shrink-0 text-[color:var(--color-action-primary)]"
              />
            ) : (
              <RadioButtonUnchecked
                width="22"
                height="22"
                className="shrink-0 text-[color:var(--color-gray-400)]"
              />
            )}
          </button>
        )}

        <div className="border-b border-[var(--color-gray-100)] py-[8px]">
          <p className="mb-[4px] text-[13px] text-[color:var(--color-text-secondary)]">
            고정 스케줄
          </p>
          <p className="text-[15px] font-semibold text-[color:var(--color-text-primary)]">
            {isLoading || !constraints
              ? '불러오는 중...'
              : `${constraints.fixed_pickup_time} ${constraints.fixed_pickup} → ${constraints.fixed_dropoff_time} ${constraints.fixed_dropoff}`}
          </p>
        </div>

        <div className="flex flex-col">
          <SettingRow
            label="복귀지"
            value={
              isLoading || !constraints
                ? '불러오는 중...'
                : constraints.return_location
            }
          />
          <SettingRow
            label="복귀 마감"
            value={
              isLoading || !constraints
                ? '불러오는 중...'
                : constraints.return_deadline
            }
            hasDropdown
          />
        </div>

        <div className="flex flex-col gap-[16px]">
          <p className="text-[13px] font-semibold text-[color:var(--color-text-secondary)]">
            추가 적용 조건
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[color:var(--color-text-primary)]">
              수작업 심하차 제외
            </span>
            <ToggleSwitch
              checked={constraints?.exclude_manual_loading ?? false}
              onChange={(checked) =>
                updateConstraints({ exclude_manual_loading: checked })
              }
              label="수작업 심하차 제외"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[color:var(--color-text-primary)]">
              심야 운행 회피
            </span>
            <ToggleSwitch
              checked={constraints?.avoid_night_driving ?? false}
              onChange={(checked) =>
                updateConstraints({ avoid_night_driving: checked })
              }
              label="심야 운행 회피"
            />
          </div>
        </div>

        {submitError && (
          <p className="text-[13px] text-[color:var(--color-point-red)]">
            {submitError}
          </p>
        )}
      </div>

      <BottomCTA
        label={isSubmitting ? '등록 중...' : '등록하기'}
        enabled={!isLoading && !isSubmitting && !!constraints}
        onPrimaryClick={handleRegister}
      />
    </div>
  );
}
