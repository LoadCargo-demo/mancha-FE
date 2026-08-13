// Figma 레이어: 840 "RecommendationCard" (Type=균형/조기복귀). 2안·3안 데일리 패키지 카드.

export type RecommendationCardProps = {
  rankLabel: string;
  typeName: string;
  recommended?: boolean;
  netIncome?: string;
  nominalIncome?: string;
  returnTime?: string;
  emptyDistance?: string;
};

export default function RecommendationCard({
  rankLabel,
  typeName,
  recommended = false,
  netIncome,
  nominalIncome,
  returnTime,
  emptyDistance,
}: RecommendationCardProps) {
  return (
    <div
      className={`flex w-[280px] shrink-0 flex-col gap-[16px] rounded-[12px] border p-[16px] ${
        recommended
          ? 'border-transparent bg-[var(--color-blue-50)]'
          : 'border-[var(--color-gray-100)]'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-[6px] px-[8px] py-[2px] text-[13px] font-bold ${
            recommended
              ? 'bg-[var(--color-white-1000)] text-[color:var(--color-text-primary)]'
              : 'bg-[var(--color-gray-100)] text-[color:var(--color-text-secondary)]'
          }`}
        >
          {rankLabel}
        </span>
        {recommended && (
          <span className="rounded-[6px] bg-[var(--color-action-primary)] px-[8px] py-[2px] text-[12px] font-bold text-[color:var(--color-text-inverse)]">
            추천안
          </span>
        )}
      </div>

      <p className="text-[20px] font-bold text-[color:var(--color-text-primary)]">
        {typeName}
      </p>

      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[color:var(--color-text-secondary)]">
            보정 실수익
          </span>
          <span className="text-[16px] font-bold text-[color:var(--color-action-primary)]">
            {netIncome ?? '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[color:var(--color-text-secondary)]">
            명목 순수익
          </span>
          <span className="text-[14px] text-[color:var(--color-text-primary)]">
            {nominalIncome ?? '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[color:var(--color-text-secondary)]">
            복귀 시각
          </span>
          <span className="text-[14px] font-semibold text-[color:var(--color-text-primary)]">
            {returnTime ?? '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[color:var(--color-text-secondary)]">
            공차 거리
          </span>
          <span className="text-[14px] font-semibold text-[color:var(--color-text-primary)]">
            {emptyDistance ?? '-'}
          </span>
        </div>
      </div>
    </div>
  );
}
