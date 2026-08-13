// 기사님이 음성으로 되물었을 때(RAG) AI가 답변하는 결과 화면입니다.
//
// NegotiationCallScreen에서 실제 STT로 인식된 질문(location.state.heardText)을 그대로
// 받아서 화면에 표시하고, 백엔드 RAG 질의에도 그대로 사용한다 (더 이상 하드코딩 없음).
// 이 화면에 직접 들어온 경우(state 없음) 대비 기본 질문으로 폴백한다.

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Close from '@iconify-react/material-symbols-light/close';
import CheckBoxOutlineBlank from '@iconify-react/material-symbols-light/check-box-outline-blank';

import Navigation from '../../components/common/Navigation';
import BottomCTA from '../../components/common/BottomCTA';
import DataChip from '../../components/negotiation/DataChip';
import Database from '@iconify-react/material-symbols-light/database';
import MarkdownLite from '../../components/negotiation/MarkdownLite';
import { ROUTES } from '../../router/routes';
import { askQuestion } from '@/api/negotiation/qna';
import type { QnaResponse } from '@/api/negotiation/types';
import { useNegotiationStore } from '../../store/useNegotiationStore';
import SystemStatusBar from '../../components/common/SystemStatusBar';

// NegotiationCallScreen을 거치지 않고 이 화면에 직접 들어온 경우를 위한 폴백 질문
const FALLBACK_QUESTION = '대기 시간이 왜 이렇게 길어?';

type LocationState = {
  heardText?: string;
};

export default function NegotiationResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const recommendedPackageId = useNegotiationStore(
    (s) => s.recommendedPackageId,
  );
  const packageLabel = recommendedPackageId?.replace(/^pkg_/, '') ?? '추천안';

  const state = location.state as LocationState | null;
  const displayedQuestion = state?.heardText?.trim() || FALLBACK_QUESTION;

  const [answer, setAnswer] = useState<QnaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // STT로 실제 인식된 질문(또는 폴백 질문)을 그대로 RAG 백엔드에 질의한다.
    // 예전처럼 별도 "백엔드용 키워드"를 따로 두지 않고, 사용자가 실제로 말한 문장 그대로 보낸다.
    askQuestion(displayedQuestion)
      .then((res) => {
        if (!cancelled) setAnswer(res);
      })
      .catch(() => {
        if (!cancelled) setError('답변을 불러오지 못했어요.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedQuestion]);

  return (
    <div className="flex h-dvh mx-auto w-full max-w-[390px] flex-col bg-[var(--color-white-1000)]">
      <SystemStatusBar />
      <Navigation
        title="브리핑 에이전트"
        showRightAction={false}
        leftIcon={<Close width="24" height="24" />}
        onBack={() => navigate(-1)}
      />

      <div className="flex flex-1 flex-col gap-[16px] px-[var(--spacing-screen)] pt-[8px]">
        <div className="flex justify-end">
          <div className="rounded-[12px] rounded-tr-none bg-[var(--color-gray-100)] px-[14px] py-[10px]">
            <p className="text-[14px] text-[color:var(--color-text-primary)]">
              "{displayedQuestion}"
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] rounded-[12px] bg-[var(--color-blue-50)] p-[16px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-[13px] font-semibold text-[color:var(--color-text-secondary)]">
              만차 에이전트
            </span>
            <span className="rounded-full bg-[var(--color-action-primary)] px-[8px] py-[2px] text-[11px] font-bold text-[color:var(--color-text-inverse)]">
              RAG 응답
            </span>
          </div>

          {error && (
            <p className="text-[13px] text-[color:var(--color-point-red)]">
              {error}
            </p>
          )}
          {isLoading && (
            <p className="text-[13px] text-[color:var(--color-text-secondary)]">
              답변을 생성하고 있어요...
            </p>
          )}
          {answer && <MarkdownLite text={answer.answer} />}
        </div>

        {answer && answer.sources.length > 0 && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-[13px] font-semibold text-[color:var(--color-text-secondary)]">
              이 답변의 출처
            </p>
            {answer.sources.map((source) => (
              <DataChip
                key={source.source}
                icon={Database}
                label={source.source}
              />
            ))}
          </div>
        )}

        {answer && answer.follow_up_questions.length > 0 && (
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center gap-[8px]">
              <p className="text-[13px] font-semibold text-[color:var(--color-text-secondary)]">
                이어서 물어볼 수 있는 것
              </p>
              <span className="rounded-full bg-[var(--color-gray-100)] px-[8px] py-[2px] text-[11px] font-semibold text-[color:var(--color-text-secondary)]">
                AI 제안
              </span>
            </div>
            {answer.follow_up_questions.map((question) => (
              <div
                key={question}
                className="flex items-center gap-[8px] py-[4px]"
              >
                <CheckBoxOutlineBlank
                  width="18"
                  height="18"
                  className="shrink-0 text-[color:var(--color-gray-400)]"
                />
                <span className="text-[14px] text-[color:var(--color-text-primary)]">
                  {question}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomCTA
        type="VoiceConfirm"
        confirmLabel={`${packageLabel}으로 확정`}
        onPrimaryClick={() => navigate(ROUTES.offer)}
      />
    </div>
  );
}
