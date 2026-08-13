// 오퍼3 "수작업 심하차 제외" / "심야 운행 회피" 토글 스위치.

export type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

export default function ToggleSwitch({
  checked,
  onChange,
  label,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[24px] w-[44px] shrink-0 rounded-full transition-colors ${
        checked
          ? 'bg-[var(--color-action-primary)]'
          : 'bg-[var(--color-gray-300)]'
      }`}
    >
      <span
        className={`absolute top-[2px] size-[20px] rounded-full bg-[var(--color-white-1000)] shadow-sm transition-transform ${
          checked ? 'translate-x-[0px]' : 'translate-x-[-20px]'
        }`}
      />
    </button>
  );
}
