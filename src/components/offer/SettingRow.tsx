// Figma 레이어: 오퍼1 "차종 / 톤수" 등, 오퍼3 "복귀지" 등에서 반복되는 라벨-값 행.
// hasDropdown이 true면 값 오른쪽에 셀렉트 화살표가 붙습니다 (선택 시트를 여는 용도).

import KeyboardArrowDown from '@iconify-react/material-symbols-light/keyboard-arrow-down';

export type SettingRowProps = {
  label: string;
  value: string;
  hasDropdown?: boolean;
  onClick?: () => void;
  /**
   * 'card': 독립된 흰색 카드(테두리+둥근 모서리+간격). 오퍼1 "차종/톤수" 등에서 사용.
   * 'plain': 이미 카드로 감싸진 부모 안에서 쓰이는 단순 행. 오퍼2 "운행 안전 기준"에서 사용.
   */
  variant?: 'card' | 'plain';
};

export default function SettingRow({
  label,
  value,
  hasDropdown = false,
  onClick,
  variant = 'card',
}: SettingRowProps) {
  const className =
    variant === 'card'
      ? 'mt-[16px] flex w-full items-center justify-between rounded-[12px] border border-[var(--color-gray-200)] bg-[var(--color-white-1000)] px-[16px] py-[16px] text-left first:mt-0'
      : 'flex w-full items-center justify-between py-[8px] text-left';

  const content =
    variant === 'card' ? (
      <>
        <span className="text-[14px] text-[color:var(--color-text-secondary)]">
          {label}
        </span>
        <span className="flex items-center gap-[2px] text-[15px] font-semibold text-[color:var(--color-text-primary)]">
          {value}
          {hasDropdown && (
            <KeyboardArrowDown
              width="18"
              height="18"
              className="text-[color:var(--color-gray-400)]"
            />
          )}
        </span>
      </>
    ) : (
      <>
        <span className="text-[16px] text-[color:var(--color-text-primary)]">
          {label}
        </span>
        <span className="flex items-center gap-[2px] text-[18px] font-bold text-[color:var(--color-text-primary)]">
          {value}
          {hasDropdown && (
            <KeyboardArrowDown
              width="16"
              height="16"
              className="text-[color:var(--color-text-primary)]"
            />
          )}
        </span>
      </>
    );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
