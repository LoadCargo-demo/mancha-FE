// 오퍼2 "엄격히 / 웬만하면 / 유연하게" 3분할 선택 버튼.
// 제네릭 value 타입을 그대로 써서 다른 화면의 3~4지선다 토글에도 재사용할 수 있습니다.

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-wrap gap-[8px]">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-[16px] py-[8px] text-[14px] font-medium transition-colors ${
              isSelected
                ? 'border-[var(--color-gray-600)] bg-[var(--color-gray-800)] text-[color:var(--color-text-inverse)]'
                : 'border-[var(--color-gray-200)] bg-[var(--color-white-1000)] text-[color:var(--color-text-primary)]'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
