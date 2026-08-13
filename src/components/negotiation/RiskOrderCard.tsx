// Figma: RiskOrderCard (301:6787 등) — 협상2에서 반복 사용되는 경유지 후보 카드.
// 성사 확률에 따라 막대·숫자 색이 바뀌고, 위험 요인이 있으면 경고 배너가 추가된다.

export type RiskOrderCardProps = {
  tag?: string;
  title: string;
  statLine: string;
  probability: number; // 0-100
  probabilityLabel: string; // "성사 확률" | "기준 미달" 등
  tone: 'high' | 'mid' | 'low';
  riskNote?: string;
};

const TONE_COLOR: Record<RiskOrderCardProps['tone'], string> = {
  high: 'var(--color-action-primary)',
  mid: '#4d97ff',
  low: '#797979',
};

export default function RiskOrderCard({
  tag = '경유지',
  title,
  statLine,
  probability,
  probabilityLabel,
  tone,
  riskNote,
}: RiskOrderCardProps) {
  const color = TONE_COLOR[tone];

  return (
    <div className="px-[20px] pb-[16px] w-full">
      <div className="bg-white border border-[var(--color-gray-200)] rounded-[12px] p-[17px] flex flex-col gap-[16px] shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-[4px] pt-[2px]">
            <span className="bg-[var(--color-gray-100)] text-[12px] font-semibold text-[color:var(--color-gray-600)] tracking-[0.48px] rounded-[2px] px-[8px] py-[4px] w-fit">
              {tag}
            </span>
            <h3 className="text-[18px] font-semibold text-[color:var(--color-gray-900)] tracking-[-0.2px] pt-[4px]">
              {title}
            </h3>
            <p className="text-[14px] text-[color:var(--color-gray-600)]">
              {statLine}
            </p>
          </div>
          <div className="flex flex-col items-end gap-[4.5px] shrink-0">
            <span
              className="text-[24px] font-semibold tracking-[-0.24px]"
              style={{ color }}
            >
              {probability}%
            </span>
            <span className="text-[12px] font-semibold text-[color:var(--color-gray-600)] tracking-[0.48px]">
              {probabilityLabel}
            </span>
          </div>
        </div>

        {riskNote && (
          <div className="bg-[var(--color-gray-200)] rounded-[4px] p-[8px] flex gap-[8px] items-center">
            <span aria-hidden className="text-[12px]">
              ⚠️
            </span>
            <p className="text-[12px] font-semibold text-[color:var(--color-gray-600)] tracking-[0.48px]">
              {riskNote}
            </p>
          </div>
        )}

        <div className="bg-[var(--color-gray-200)] h-[8px] rounded-[12px] w-full overflow-hidden">
          <div
            className="h-full rounded-[12px]"
            style={{ width: `${probability}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}
