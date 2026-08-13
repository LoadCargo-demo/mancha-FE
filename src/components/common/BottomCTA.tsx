// 화면 하단에 고정되는 CTA 버튼 영역입니다. 시나리오별로 5가지 타입을 지원합니다.
//  - Single      : 단일 버튼 ("등록하기" 등), state=false면 비활성(disabled) 스타일
//  - Briefing    : "확정" primary 버튼 + "근거 조회"/"다른 패키지" 보조 버튼 2개 + 안내 문구
//  - Split       : "타 패키지 선택"(outline) + "2안으로 확정"(filled) 2분할 버튼
//  - VoiceConfirm: "N안 확정" 큰 버튼 + 우측 음성 아이콘 버튼
//  - Route       : "경로 안내 시작" 아이콘 포함 단일 버튼

import imgMicIcon from '../../assets/icons/mic.svg';
import imgRouteIcon from '../../assets/icons/navigation.svg';

export type BottomCTAType =
  'Single' | 'Briefing' | 'Route' | 'Split' | 'VoiceConfirm';

export type BottomCTAProps = {
  className?: string;
  type?: BottomCTAType;
  /** Single 타입에서 false면 비활성(회색) 스타일 */
  enabled?: boolean;
  /** Single 버튼 라벨 */
  label?: string;
  /** Briefing 하단에 안내 문구를 보여줄지 */
  showAgentNote?: boolean;
  agentNote?: string;
  /** Split / VoiceConfirm에서 확정 라벨에 들어갈 안(案) 번호 등 */
  confirmLabel?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  /** Briefing 타입의 "다른 패키지" 버튼 전용 */
  onTertiaryClick?: () => void;
  onVoiceClick?: () => void;
};

export default function BottomCTA({
  className,
  type = 'Single',
  enabled = true,
  label = '등록하기',
  showAgentNote = true,
  agentNote = 'AI 에이전트가 최적의 경로와 수익을 실시간으로 계산했습니다.',
  confirmLabel = '2안으로 확정',
  onPrimaryClick,
  onSecondaryClick,
  onTertiaryClick,
  onVoiceClick,
}: BottomCTAProps) {
  const wrapperBase = 'flex items-start relative w-full max-w-[390px]';
  const wrapperByType: Record<BottomCTAType, string> = {
    Single: 'flex-col pb-[32px] pt-[16px] px-[20px]',
    Briefing: 'bg-white flex-col gap-[12px] p-[20px]',
    Split:
      'bg-white border-[var(--color-gray-200)] border-solid border-t drop-shadow-[0px_-4px_10px_var(--color-black-alpha-5)] gap-[8px] pb-[32px] pt-[17px] px-[20px]',
    VoiceConfirm:
      'flex-col bg-gradient-to-t from-[#f7f9fb] via-[#f7f9fb] to-[rgba(247,249,251,0)] pb-[32px] pt-[16px] px-[20px]',
    Route: 'flex-col px-[20px]',
  };

  return (
    <div className={className || `${wrapperBase} ${wrapperByType[type]}`}>
      {type === 'Single' && (
        <button
          type="button"
          disabled={!enabled}
          onClick={onPrimaryClick}
          className={`flex items-center justify-center p-[16px] rounded-[var(--radius-button-lg)] shrink-0 w-full ${
            enabled
              ? 'bg-[var(--color-action-primary)]'
              : 'bg-[var(--color-gray-400)]'
          }`}
        >
          <span className="font-bold leading-[24px] text-[16px] text-[color:var(--color-text-inverse)] text-center whitespace-nowrap">
            {label}
          </span>
        </button>
      )}

      {type === 'Briefing' && (
        <>
          <button
            type="button"
            onClick={onPrimaryClick}
            className="bg-[var(--color-blue-cta)] h-[52px] relative rounded-[12px] shrink-0 w-full shadow-[0px_3px_15px_-2px_var(--color-blue-090),0px_4px_6px_-4px_var(--color-blue-090)]"
          >
            <span className="font-bold leading-[27px] text-[18px] text-[color:var(--color-text-inverse)]">
              확정
            </span>
          </button>
          <div className="flex gap-[12px] items-start relative shrink-0 w-full">
            <button
              type="button"
              onClick={onSecondaryClick}
              className="bg-[var(--color-gray-200)] border border-[var(--color-gray-200)] border-solid flex h-[52px] items-center justify-center flex-1 rounded-[12px]"
            >
              <span className="font-semibold leading-[21px] text-[14px] text-[color:var(--color-text-primary)] whitespace-nowrap">
                근거 조회
              </span>
            </button>
            <button
              type="button"
              onClick={onTertiaryClick}
              className="bg-[var(--color-gray-200)] border border-[var(--color-gray-200)] border-solid flex h-[52px] items-center justify-center flex-1 rounded-[12px]"
            >
              <span className="font-semibold leading-[21px] text-[14px] text-[color:var(--color-text-primary)] whitespace-nowrap">
                다른 패키지
              </span>
            </button>
          </div>
          {showAgentNote && (
            <p className="font-normal leading-[16.5px] text-[11px] text-[color:var(--color-gray-600)] text-center w-full py-[8px]">
              {agentNote}
            </p>
          )}
        </>
      )}

      {type === 'Split' && (
        <>
          <button
            type="button"
            onClick={onSecondaryClick}
            className="border border-[var(--color-blue-cta)] border-solid flex-1 h-[52px] rounded-[8px]"
          >
            <span className="font-bold leading-[24px] text-[16px] text-[color:var(--color-blue-cta)]">
              타 패키지 선택
            </span>
          </button>
          <button
            type="button"
            onClick={onPrimaryClick}
            className="bg-[var(--color-blue-cta)] h-[52px] rounded-[8px] w-[214px]"
          >
            <span className="font-bold leading-[24px] text-[16px] text-[color:var(--color-text-inverse)]">
              {confirmLabel}
            </span>
          </button>
        </>
      )}

      {type === 'VoiceConfirm' && (
        <div className="flex gap-[12px] items-center relative shrink-0 w-full">
          <button
            type="button"
            onClick={onPrimaryClick}
            className="bg-[var(--color-blue-cta)] flex flex-1 h-[56px] items-center justify-center rounded-[12px] shadow-[0px_4px_6px_-1px_var(--color-black-alpha-8),0px_2px_4px_-2px_var(--color-black-alpha-8)]"
          >
            <span className="font-semibold leading-[27px] text-[18px] text-[color:var(--color-text-inverse)]">
              {confirmLabel.replace('으로 확정', ' 확정')}
            </span>
          </button>
          <button
            type="button"
            onClick={onVoiceClick}
            aria-label="음성으로 답하기"
            className="bg-[var(--color-blue-50)] flex items-center justify-center rounded-[12px] shrink-0 size-[56px] shadow-[0px_4px_6px_-1px_var(--color-black-alpha-8),0px_2px_4px_-2px_var(--color-black-alpha-8)]"
          >
            <img alt="" src={imgMicIcon} className="h-[22px] w-[16px]" />
          </button>
        </div>
      )}

      {type === 'Route' && (
        <button
          type="button"
          onClick={onPrimaryClick}
          className="bg-[var(--color-blue-500)] flex gap-[8px] h-[56px] items-center justify-center rounded-[12px] shrink-0 w-full"
        >
          <img alt="" src={imgRouteIcon} className="h-[19px] w-[16px]" />
          <span className="font-bold leading-[24px] text-[16px] text-[color:var(--color-text-inverse)]">
            경로 안내 시작
          </span>
        </button>
      )}
    </div>
  );
}
