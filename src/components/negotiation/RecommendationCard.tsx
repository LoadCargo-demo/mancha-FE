// Figma 레이어: 840 "RecommendationCard" (Type=균형/조기복귀). 2안·3안 데일리 패키지 카드.

export type RecommendationCardProps = {
  rankLabel: string;
  typeName: string;
  recommended?: boolean;
  /** 정책 위반 등으로 자동 제외된 패키지. '자동 제외' 배지 + 복귀시각/공차거리를 경고색으로 표시. */
  excluded?: boolean;
  netIncome?: string;
  nominalIncome?: string;
  returnTime?: string;
  emptyDistance?: string;
};

export default function RecommendationCard({
  rankLabel,
  typeName,
  recommended = false,
  excluded = false,
  netIncome,
  nominalIncome,
  returnTime,
  emptyDistance,
}: RecommendationCardProps) {
  const dividerColorClass = recommended
    ? 'border-[var(--color-action-primary)]'
    : 'border-[var(--color-gray-200)]';
  // 제외된 카드는 복귀시각/공차거리 숫자를 경고색으로 강조
  const warnValueClass = excluded
    ? 'text-[color:var(--color-point-red)]'
    : 'text-[color:var(--color-text-primary)]';

  return (
    <div
      className={`flex w-[280px] shrink-0 flex-col gap-[16px] rounded-[12px] border p-[16px] ${
        recommended
          ? 'border-transparent bg-[var(--color-blue-50)]'
          : 'border-[var(--color-gray-200)]'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-[2px] px-[8px] py-[4px] text-[12px] font-semibold ${
            recommended
              ? 'bg-[var(--color-white-1000)] text-[color:var(--color-action-primary)]'
              : 'bg-[var(--color-gray-100)] text-[color:var(--color-text-secondary)]'
          }`}
        >
          {rankLabel}
        </span>

        {recommended ? (
          <span className="rounded-[12px] bg-[var(--color-action-primary)] px-[8px] py-[4px] text-[12px] font-semibold text-[color:var(--color-text-inverse)]">
            추천안
          </span>
        ) : excluded ? (
          <span className="rounded-[12px] bg-[#ffe6e8] px-[8px] py-[4px] text-[12px] font-semibold text-[#d5474e]">
            자동 제외
          </span>
        ) : (
          <span className="rounded-[12px] bg-[var(--color-gray-100)] px-[8px] py-[4px] text-[12px] font-semibold text-[color:var(--color-text-secondary)]">
            그 다음
          </span>
        )}
      </div>

      <p className="text-[20px] font-bold text-[color:var(--color-text-primary)]">
        {typeName}
      </p>

      <div className="flex flex-col gap-[12px]">
        <div
          className={`flex items-center justify-between border-b pb-[9px] ${dividerColorClass}`}
        >
          <span className="text-[14px] text-[color:var(--color-text-secondary)]">
            보정 실수익
          </span>
          <span
            className={`text-[20px] font-bold ${
              recommended
                ? 'text-[color:var(--color-action-primary)]'
                : 'text-[color:var(--color-text-primary)]'
            }`}
          >
            {netIncome ?? '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-[color:var(--color-text-secondary)]">
            명목 순수익
          </span>
          <span className="text-[14px] text-[color:var(--color-text-primary)]">
            {nominalIncome ?? '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-[color:var(--color-text-secondary)]">
            복귀 시각
          </span>
          <span className={`text-[14px] font-bold ${warnValueClass}`}>
            {returnTime ?? '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-[color:var(--color-text-secondary)]">
            공차 거리
          </span>
          <span className={`text-[14px] font-bold ${warnValueClass}`}>
            {emptyDistance ?? '-'}
          </span>
        </div>
      </div>
    </div>
  );
}
