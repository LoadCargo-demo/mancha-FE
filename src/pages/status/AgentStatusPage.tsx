//  에이전트 작업 현황
// run-all 응답 하나로 스카우트/빌더/리스크/감정사 4단계 요약을 만든다.
// (지금 배포된 백엔드는 4단계를 동기로 한 번에 처리해서 반환하기 때문에,
//  4단계가 항상 동시에 "completed"로 표시된다 — 실제 단계별 진행 스트리밍은 아님)
//
// MobileLayout 밖에 있는 화면이라, 하단 탭바 클릭 시 이동도 이 화면이 직접 처리해야 함
// (MobileLayout 안에 있을 땐 MobileLayout이 대신 해줬음).
//
// 4단계(감정사)까지 다 보여준 뒤 3초 있다가 자동으로 협상2(거래 후보 리스트)로 이동한다.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SystemStatusBar from '../../components/common/SystemStatusBar';
import BottomTabBar, {
  type BottomTabKey,
} from '../../components/common/BottomTabBar';
import { ROUTES } from '@/router/routes';
import {
  runAll,
  formatTime,
  type RunAllResponse,
} from '@/api/negotiation/pipeline';

// 탭 ↔ 경로 매핑 — MobileLayout.tsx의 TAB_TO_PATH와 동일한 개념
const TAB_TO_PATH: Record<BottomTabKey, string> = {
  home: ROUTES.home,
  offer: ROUTES.offer,
  negotiation: ROUTES.negotiation,
  myCriteria: ROUTES.myCriteria,
};

// 4단계 다 보여준 뒤 협상2로 자동 이동하기까지 대기 시간
const AUTO_ADVANCE_DELAY_MS = 3000;

type StepStatus = 'completed' | 'current' | 'pending';

type DisplayStep = {
  key: string;
  name: string;
  time: string;
  status: StepStatus;
  description: string;
};

// 로딩 중에도 스켈레톤으로 미리 보여줄 4단계 이름
const STEP_NAMES = ['스카우트', '빌더', '리스크 예측기', '감정사'] as const;

/** "103.19999999999999km" 같은 문자열 속 소수점 숫자를 "103.2km"처럼 1자리로 반올림 */
function roundDecimalsInText(text: string): string {
  return text.replace(/\d+\.\d+/g, (match) => Number(match).toFixed(1));
}

function buildSteps(data: RunAllResponse): DisplayStep[] {
  const { scout, builder, risk, appraisal } = data;

  return [
    {
      key: 'scout',
      name: '스카우트',
      time: formatTime(scout.completed_at),
      status: 'completed',
      description: `오더 ${scout.collected_count}건 수집 → 경로·시간창 통과 ${scout.passed_count}건`,
    },
    {
      key: 'builder',
      name: '빌더',
      time: formatTime(builder.completed_at),
      status: 'completed',
      description: `시공간 조합 ${builder.generated_combination_count}개 생성 → 제약 통과 ${builder.passed_constraint_count}개 → ${builder.packages.length}개 안 선별`,
    },
    {
      key: 'risk',
      name: '리스크 예측기',
      time: formatTime(builder.completed_at),
      status: 'completed',
      description: `자동 탈락 ${risk.excluded_count}건 · 백업 오더 ${Object.keys(risk.backup_pairs).length}건 확보`,
    },
    {
      key: 'appraiser',
      name: '감정사',
      time: formatTime(builder.completed_at),
      status: 'completed',
      description: appraisal.recommendation_reason,
    },
  ];
}

function StepMarker({ status }: { status: StepStatus }) {
  if (status === 'completed') {
    return (
      <div className="size-[24px] rounded-full bg-[var(--color-action-primary)] flex items-center justify-center shrink-0">
        <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
          <path
            d="M1 4L4 7L10 1"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (status === 'current') {
    return (
      <div className="size-[24px] rounded-full border-2 border-blue-300 bg-white flex items-center justify-center shrink-0">
        <div className="size-[12px] rounded-full bg-blue-500" />
      </div>
    );
  }

  return (
    <div className="size-[24px] rounded-full border-2 border-[var(--color-gray-300)] bg-white shrink-0" />
  );
}

/** 데이터 도착 전 로딩 마커 — 연한 파란 링(pulse) + 진한 파란 점 */
function LoadingStepMarker() {
  return (
    <div className="relative size-[24px] shrink-0">
      <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse" />
      <div className="absolute inset-[6px] rounded-full bg-[var(--color-action-primary)]" />
    </div>
  );
}

export default function NegotiationAgentProgressPage() {
  const navigate = useNavigate();

  const [steps, setSteps] = useState<DisplayStep[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [dataTags, setDataTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    runAll()
      .then((res) => {
        if (cancelled) return;

        setSteps(buildSteps(res));

        const recommended = res.appraisal.ranked_packages.find(
          (p) => p.package.package_id === res.appraisal.recommended_package_id,
        );

        setDataTags(
          recommended?.deductions.map((d) => roundDecimalsInText(d.source)) ??
            [],
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '불러오기 실패');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (steps.length === 0) return;

    const timers = steps.map((_, i) =>
      window.setTimeout(() => setVisibleCount(i + 1), i * 600),
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [steps]);

  // 4단계(감정사)까지 다 보여준 뒤 3초 있다가 협상2로 자동 이동
  useEffect(() => {
    if (steps.length === 0 || visibleCount < steps.length) {
      return;
    }

    const timer = window.setTimeout(() => {
      navigate(ROUTES.NegotiationCandiatePage);
    }, AUTO_ADVANCE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [visibleCount, steps.length, navigate]);

  return (
    <div className="flex flex-col h-dvh max-w-[390px] mx-auto bg-white">
      <SystemStatusBar />

      <div className="flex-1 overflow-y-auto">
        {/* 알림 예약 배너 */}
        <div className="px-[20px] pt-[8px] pb-[20px]">
          <div className="bg-[var(--color-blue-50)] rounded-[12px] p-[16px] flex items-center gap-[8px] shadow-sm">
            <span className="text-[14px]">알림 예약됨</span>

            <div className="w-px h-[12px] bg-[var(--color-gray-200)]" />

            <span className="text-[14px] text-[color:var(--color-text-secondary)]">
              04:40 음성 브리핑 · 30초
            </span>
          </div>
        </div>

        {/* 타이틀 */}
        <div className="px-[20px] pb-[16px]">
          <h1 className="text-[20px] font-medium text-[color:var(--color-text-primary)]">
            에이전트 작업 현황
          </h1>
        </div>

        {/* 로딩 중 */}
        {loading && (
          <div className="relative px-[36px] py-[16px]">
            <div className="absolute border border-[var(--color-gray-200)] rounded-[12px] inset-y-0 left-[20px] right-[20px]" />

            <div className="flex flex-col gap-[24px]">
              {STEP_NAMES.map((name, i) => (
                <div
                  key={name}
                  className="flex gap-[16px] items-start relative"
                >
                  {/* 체크 마커 */}
                  <div className="relative shrink-0 z-10">
                    <LoadingStepMarker />
                  </div>

                  {/* 체크와 다음 체크 연결 */}
                  {i < STEP_NAMES.length - 1 && (
                    <div className="absolute left-[11px] top-[24px] bottom-[-24px] w-[2px] bg-[#e4e9f2]" />
                  )}

                  <div className="flex-1 flex flex-col gap-[4px] min-w-0">
                    <div className="flex gap-[4px] items-center">
                      <span className="text-[14px] font-medium text-[color:var(--color-text-primary)]">
                        {name}
                      </span>

                      <span className="text-[14px] text-[color:var(--color-gray-600)]">
                        ·
                      </span>

                      <span className="text-[14px] text-[color:var(--color-gray-600)]">
                        로딩 중
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <p className="px-[20px] text-[14px] text-red-500">
            불러오지 못했습니다: {error}
          </p>
        )}

        {/* 데이터 로딩 완료 */}
        {!loading && !error && (
          <>
            {/* 스텝 타임라인 */}
            <div className="relative px-[36px] py-[16px]">
              <div className="absolute border border-[var(--color-gray-200)] rounded-[12px] inset-y-0 left-[20px] right-[20px]" />

              <div className="flex flex-col gap-[24px]">
                {steps.slice(0, visibleCount).map((step, i) => (
                  <div
                    key={step.key}
                    className="flex gap-[16px] items-start relative animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    {/* 체크 마커 */}
                    <div className="relative shrink-0 z-10">
                      <StepMarker status={step.status} />
                    </div>

                    {/* 체크와 다음 체크 연결 */}
                    {i < visibleCount - 1 && (
                      <div className="absolute left-[11px] top-[24px] bottom-[-24px] w-[2px] bg-[#e4e9f2]" />
                    )}

                    <div className="flex-1 flex flex-col gap-[4px] min-w-0">
                      <div className="flex gap-[4px] items-center">
                        <span className="text-[14px] font-medium text-[color:var(--color-text-primary)]">
                          {step.name}
                        </span>

                        <span className="text-[14px] text-[color:var(--color-gray-600)]">
                          ·
                        </span>

                        <span className="text-[14px] text-[color:var(--color-gray-600)]">
                          {step.time}
                        </span>
                      </div>

                      <p className="text-[13px] text-[color:var(--color-text-secondary)] leading-[21px]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 판단 근거 데이터 카드 */}
            {visibleCount >= steps.length && (
              <div className="px-[20px] pt-[16px] animate-in fade-in duration-300">
                <div className="bg-[var(--color-gray-100)] border border-[var(--color-gray-200)] rounded-[12px] p-[16px] flex flex-col gap-[8px]">
                  <div className="flex gap-[4px] items-center">
                    <span className="text-[14px] font-medium text-[color:var(--color-gray-600)] tracking-[0.28px]">
                      이 판단에 쓰인 데이터
                    </span>

                    <span className="bg-[var(--color-gray-400)] text-white text-[12px] font-light rounded-[2px] px-[8px] py-[2px] tracking-[0.48px]">
                      AI 기반 근거 추적
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-[6px]">
                    {dataTags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-white border border-[var(--color-gray-300)] rounded-[37px] px-[13px] py-[5px] h-[30px] flex items-center text-[14px] text-[color:var(--color-gray-600)] shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomTabBar
        activeTab="negotiation"
        onTabChange={(tab) => navigate(TAB_TO_PATH[tab])}
      />
    </div>
  );
}
