// 기사님이 음성으로 되물었을 때(RAG) AI가 답변하는 결과 화면입니다.
//
// NegotiationCallScreen에서 실제 STT로 인식된 질문(location.state.heardText)을 그대로
// 받아서 화면에 표시하고, 백엔드 RAG 질의에도 그대로 사용한다 (더 이상 하드코딩 없음).
// 이 화면에 직접 들어온 경우(state 없음) 대비 기본 질문으로 폴백한다.

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Close from '@iconify-react/material-symbols-light/close';

import Navigation from '../../components/common/Navigation';
import BottomCTA from '../../components/common/BottomCTA';
import DataChip from '../../components/negotiation/DataChip';
import Database from '@iconify-react/material-symbols-light/database';
import ChatBubbleOutline from '@iconify-react/material-symbols-light/chat-bubble-outline';
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
  const initialQuestion = state?.heardText?.trim() || FALLBACK_QUESTION;
  // 팔로업 질문을 탭하면 이 값을 바꿔서 재조회한다. null이면 초기 질문(STT 인식/폴백) 사용.
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const displayedQuestion = activeQuestion ?? initialQuestion;

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
          <div className="max-w-[296px] rounded-[12px] rounded-tr-[2px] border border-[var(--color-gray-300)] bg-[var(--color-gray-200)] p-[17px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)]">
            <p className="text-right text-[16px] font-semibold text-[color:var(--color-text-primary)]">
              {displayedQuestion}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[8px] rounded-[12px] border border-[var(--color-gray-200)] bg-[var(--color-white-1000)] p-[17px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-[4px]">
            <span className="text-[12px] font-semibold tracking-[0.48px] text-[color:var(--color-text-secondary)]">
              만차 에이전트
            </span>
            <span className="rounded-[12px] bg-[var(--color-action-primary)] px-[8px] py-[4px] text-[12px] font-semibold tracking-[0.48px] text-[color:var(--color-blue-surface-soft,#f5faff)]">
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

          {answer && (
            <div className="flex h-[24px] w-full items-end justify-end gap-[4px] pt-[8px]">
              {[9.6, 16.8, 24, 14.4, 7.2].map((h, i) => (
                <div
                  key={i}
                  className="w-[6px] rounded-[12px] bg-[var(--color-action-primary)]"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          )}
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
          <div className="flex flex-col gap-[16px] rounded-[12px] border border-dashed border-[var(--color-gray-300)] bg-[var(--color-white-1000)] p-[17px]">
            <div className="flex items-center gap-[8px]">
              <p className="text-[12px] font-semibold tracking-[0.48px] text-[color:var(--color-text-secondary)]">
                이어서 물어볼 수 있는 것
              </p>
              <span className="rounded-[12px] bg-[var(--color-gray-200)] px-[8px] py-[2px] text-[12px] font-semibold tracking-[0.48px] text-[color:var(--color-text-secondary)]">
                AI 제안
              </span>
            </div>
            <div className="flex flex-col gap-[12px]">
              {answer.follow_up_questions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => setActiveQuestion(question)}
                  className="flex items-center gap-[8px] text-left"
                >
                  <ChatBubbleOutline
                    width="14"
                    height="14"
                    className="shrink-0 text-[color:var(--color-text-secondary)]"
                  />
                  <span className="text-[14px] text-[color:var(--color-text-primary)]">
                    {question}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomCTA
        type="VoiceConfirm"
        confirmLabel={`${packageLabel} 확정`}
        onPrimaryClick={() => navigate(ROUTES.offer)}
      />
    </div>
  );
}
