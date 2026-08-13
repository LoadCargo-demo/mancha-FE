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
  // 트랙/실수익 막대는 추천 카드(starred) 여부로, 명목 막대의 '채워짐'은
  // 위반 여부(noteTone)로 결정합니다 — 추천 카드가 아니어도 위반이 없으면 명목이 채워져야 함.
  const hasViolation = noteTone === 'negative';
  const trackClass = starred
    ? 'bg-[var(--color-white-1000)]'
    : 'bg-[var(--color-gray-200)]';
  const nominalFillClass = hasViolation
    ? trackClass // 위반 카드는 트랙과 같은 색이라 사실상 안 보임 (의도된 디자인)
    : starred
      ? 'bg-[var(--color-bluegray-300,#bec6e0)]'
      : 'bg-[var(--color-gray-300)]';
  const netFillClass = starred
    ? 'bg-[var(--color-action-primary)]'
    : 'bg-[var(--color-gray-600)]';

  return (
    <div
      className={`flex flex-col gap-[8px] rounded-[12px] border p-[16px] ${
        starred
          ? 'border-[var(--color-action-primary)]'
          : 'border-[var(--color-gray-200)]'
      }`}
    >
      <p
        className={`text-[14px] text-[color:var(--color-text-primary)] ${
          starred ? 'font-bold' : 'font-medium'
        }`}
      >
        {rankLabel} — {typeName}
        {starred && ' ★'}
      </p>

      <div className="flex items-center justify-between gap-[8px]">
        <span className="w-[40px] shrink-0 text-[12px] font-semibold text-[color:var(--color-text-secondary)]">
          명목
        </span>
        <div className={`h-[16px] flex-1 rounded-[2px] ${trackClass}`}>
          <div
            className={`h-full rounded-[2px] ${nominalFillClass}`}
            style={{ width: `${nominalBarPercent}%` }}
          />
        </div>
        <span className="w-[80px] shrink-0 text-right text-[20px] font-semibold text-[color:var(--color-text-primary)]">
          {nominalValue}
        </span>
      </div>

      <div className="flex items-center justify-between gap-[8px]">
        <span className="w-[40px] shrink-0 text-[12px] font-semibold text-[color:var(--color-text-secondary)]">
          실수익
        </span>
        <div className={`h-[16px] flex-1 rounded-[2px] ${trackClass}`}>
          <div
            className={`h-full rounded-[2px] ${netFillClass}`}
            style={{ width: `${netBarPercent}%` }}
          />
        </div>
        <span
          className={`w-[80px] shrink-0 text-right text-[20px] font-semibold ${
            netValueTone === 'positive'
              ? 'text-[color:var(--color-action-primary)]'
              : 'text-[color:var(--color-point-red)]'
          }`}
        >
          {netValue}
        </span>
      </div>

      <p
        className={`text-center text-[14px] ${
          noteTone === 'positive'
            ? 'text-[color:var(--color-action-primary)]'
            : 'text-[color:var(--color-point-red)]'
        }`}
      >
        {noteTone === 'positive' ? '✓' : '⚠'} {note}
      </p>
    </div>
  );
}
