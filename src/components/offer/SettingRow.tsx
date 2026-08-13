// Figma 레이어: 오퍼1 "차종 / 톤수" 등, 오퍼3 "복귀지" 등에서 반복되는 라벨-값 행.
// hasDropdown이 true면 값 오른쪽에 셀렉트 화살표가 붙습니다 (선택 시트를 여는 용도).

import KeyboardArrowDown from '@iconify-react/material-symbols-light/keyboard-arrow-down';

export type SettingRowProps = {
  label: string;
  value: string;
  hasDropdown?: boolean;
  onClick?: () => void;
};

export default function SettingRow({
  label,
  value,
  hasDropdown = false,
  onClick,
}: SettingRowProps) {
  const className =
    'flex w-full items-center justify-between border-b border-[var(--color-gray-100)] py-[16px] text-left last:border-b-0';

  const content = (
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
