// 오퍼-근거조회 "2안 — 균형형" / "1안 — 최대수익형" 비교 카드.

export type ComparisonBarCardProps = {
  rankLabel: string;
  typeName: string;
  starred?: boolean;
  nominalValue: string;
  nominalBarPercent: number;
  netValue: string;
  netBarPercent: number;
  netValueTone?: 'positive' | 'negative';
  note: string;
  noteTone: 'positive' | 'negative';
};

export default function ComparisonBarCard({
  rankLabel,
  typeName,
  starred = false,
  nominalValue,
  nominalBarPercent,
  netValue,
  netBarPercent,
  netValueTone = 'positive',
  note,
  noteTone,
}: ComparisonBarCardProps) {
  return (
    <div
      className={`flex flex-col gap-[12px] rounded-[12px] border p-[16px] ${
        starred
          ? 'border-[var(--color-action-primary)]'
          : 'border-[var(--color-gray-100)]'
      }`}
    >
      <p className="text-[15px] font-bold text-[color:var(--color-text-primary)]">
        {rankLabel} — {typeName}
        {starred && ' ★'}
      </p>

      <div className="flex items-center justify-between gap-[12px]">
        <span className="w-[52px] shrink-0 text-[13px] text-[color:var(--color-text-secondary)]">
          명목
        </span>
        <div className="h-[8px] flex-1 rounded-full bg-[var(--color-gray-100)]">
          <div
            className="h-full rounded-full bg-[var(--color-gray-300)]"
            style={{ width: `${nominalBarPercent}%` }}
          />
        </div>
        <span className="w-[74px] shrink-0 text-right text-[15px] font-bold text-[color:var(--color-text-primary)]">
          {nominalValue}
        </span>
      </div>

      <div className="flex items-center justify-between gap-[12px]">
        <span className="w-[52px] shrink-0 text-[13px] text-[color:var(--color-text-secondary)]">
          실수익
        </span>
        <div className="h-[8px] flex-1 rounded-full bg-[var(--color-gray-100)]">
          <div
            className="h-full rounded-full bg-[var(--color-action-primary)]"
            style={{ width: `${netBarPercent}%` }}
          />
        </div>
        <span
          className={`w-[74px] shrink-0 text-right text-[15px] font-bold ${
            netValueTone === 'positive'
              ? 'text-[color:var(--color-action-primary)]'
              : 'text-[color:var(--color-point-red)]'
          }`}
        >
          {netValue}
        </span>
      </div>

      <p
        className={`text-[12px] ${
          noteTone === 'positive'
            ? 'text-[color:var(--color-text-secondary)]'
            : 'text-[color:var(--color-point-red)]'
        }`}
      >
        {noteTone === 'positive' ? '✓' : '⚠'} {note}
      </p>
    </div>
  );
}
