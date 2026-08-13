// 오퍼3 - 기준 등록 마법사 3/3. AI가 제안한 내일 스케줄을 확인하고 시장에 등록합니다.
// Figma node 776:7321 기준으로 구현.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stars2 from '@iconify-react/material-symbols-light/stars-2';
import Check from '@iconify-react/material-symbols-light/check';
import KeyboardArrowDown from '@iconify-react/material-symbols-light/keyboard-arrow-down';

import SystemStatusBar from '../../components/common/SystemStatusBar';
import OfferStepHeader from '../../components/offer/OfferStepHeader';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import BottomCTA from '../../components/common/BottomCTA';
import { ROUTES } from '../../router/routes';
import {
  getRegistrationPrefill,
  postRegisterDay,
} from '../../api/offer/registration';
import { useOfferDraftStore } from '../../store/useOfferDraftStore';

// 카드 공통 스타일 (흰 배경 + 테두리 + rounded-12, 안쪽 패딩은 가로 20 / 세로 16 — Figma 카드 공통 스펙)
// 레이아웃(flex-direction/gap)은 충돌 방지를 위해 각 사용처에서 따로 지정합니다.
const CARD_CLASS =
  'w-full rounded-[12px] border border-[var(--color-gray-200)] bg-[var(--color-white-1000)] px-[20px] py-[16px]';

// ReturnSchedule 카드 안의 옅은 회색 미니 행
const SUBTLE_ROW_CLASS =
  'flex items-center justify-between rounded-[8px] border border-[var(--color-gray-200)] bg-[var(--color-gray-50,#fafafa)] px-[17px] py-[13px]';

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
    // 이미 로드된 상태인지는 getState()로 그때그때 확인한다. isLoading 초기값이
    // useState(!constraints)로 이미 올바르게 계산되므로, 여기선 그냥 fetch만 건너뛰면 된다
    // (굳이 setState를 다시 호출할 필요 없음 — effect 안에서 동기적으로 setState를
    // 호출하면 불필요한 캐스케이딩 렌더링이 발생한다).
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
        {/* AIInsight: 배너 패딩 20/16, 폰트 14px, radius 12 (Figma 대비 이전엔 패딩·radius가 작았음) */}
        <div className="flex items-center gap-[4px] rounded-[12px] bg-[var(--color-blue-50)] px-[20px] py-[16px] text-[14px] font-medium text-[color:var(--color-action-primary)]">
          <Stars2 width="16.5" height="16.5" className="shrink-0" />
          AI 에이전트 · 기존 대비 공차 감소율 최소 20% 예상
        </div>

        {/* AIProposalListRow: 배지가 텍스트 왼쪽에 나란히, 체크는 24x24 사각형 (이전엔 원형 아이콘이었음) */}
        {aiSuggestionMessage && (
          <button
            type="button"
            onClick={() => setAcceptAiSuggestion((prev) => !prev)}
            className={`${CARD_CLASS} flex flex-row items-center gap-[16px] text-left`}
          >
            <div className="flex flex-1 items-center gap-[16px]">
              <span className="w-fit shrink-0 rounded-[6px] bg-[var(--color-action-primary)] px-[8px] py-[4px] text-[12px] font-semibold text-[color:var(--color-text-inverse)]">
                AI 제안
              </span>
              <p className="flex-1 text-[16px] font-semibold leading-[1.3] text-[color:var(--color-text-primary)]">
                {aiSuggestionMessage}
              </p>
            </div>
            {acceptAiSuggestion ? (
              <div className="flex size-[24px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-gray-600)]">
                <div className="relative flex size-[16px] items-center justify-center text-[color:var(--color-text-inverse)]">
                  <Check width="16" height="16" className="absolute" />
                  <Check
                    width="16"
                    height="16"
                    className="absolute translate-x-[0.5px]"
                  />
                </div>
              </div>
            ) : (
              <div className="size-[24px] shrink-0 rounded-[4px] border border-[var(--color-gray-300)] bg-[var(--color-white-1000)]" />
            )}
          </button>
        )}

        {/* FixedSchedule 카드 (이전엔 카드 없이 border-b 구분선만 있었음) */}
        <div className={`${CARD_CLASS} flex flex-col gap-[8px]`}>
          <p className="text-[13px] font-semibold text-[color:var(--color-text-secondary)]">
            고정 스케줄
          </p>
          <p className="text-[16px] font-semibold text-[color:var(--color-text-primary)]">
            {isLoading || !constraints
              ? '불러오는 중...'
              : `${constraints.fixed_pickup_time} ${constraints.fixed_pickup} → ${constraints.fixed_dropoff_time} ${constraints.fixed_dropoff}`}
          </p>
        </div>

        {/* ReturnSchedule 카드: 안에 옅은 회색 미니 행 2개 (이전엔 카드 없이 SettingRow만 나열) */}
        <div className={`${CARD_CLASS} flex flex-col gap-[8px]`}>
          <p className="text-[13px] font-semibold text-[color:var(--color-text-secondary)]">
            추천 스케줄
          </p>
          <div className={SUBTLE_ROW_CLASS}>
            <span className="text-[15px] text-[color:var(--color-text-primary)]">
              복귀지
            </span>
            <span className="text-[15px] font-semibold text-[color:var(--color-text-primary)]">
              {isLoading || !constraints
                ? '불러오는 중...'
                : constraints.return_location}
            </span>
          </div>
          <button type="button" className={`${SUBTLE_ROW_CLASS} text-left`}>
            <span className="text-[15px] text-[color:var(--color-text-primary)]">
              복귀 마감
            </span>
            <span className="flex items-center gap-[2px] text-[15px] font-semibold text-[color:var(--color-text-primary)]">
              {isLoading || !constraints
                ? '불러오는 중...'
                : constraints.return_deadline}
              <KeyboardArrowDown
                width="16"
                height="16"
                className="text-[color:var(--color-text-primary)]"
              />
            </span>
          </button>
        </div>

        {/* AdditionalConditions 카드: 타이틀-행1 간격 12, 행1-행2 간격 16(gap-12 + pt-4) */}
        <div className={`${CARD_CLASS} flex flex-col gap-[12px]`}>
          <p className="text-[13px] font-semibold text-[color:var(--color-text-secondary)]">
            추가 적용 조건
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-[color:var(--color-text-primary)]">
              수작업 상하차 제외
            </span>
            <ToggleSwitch
              checked={constraints?.exclude_manual_loading ?? false}
              onChange={(checked) =>
                updateConstraints({ exclude_manual_loading: checked })
              }
              label="수작업 상하차 제외"
            />
          </div>
          <div className="flex items-center justify-between pt-[4px]">
            <span className="text-[15px] text-[color:var(--color-text-primary)]">
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
