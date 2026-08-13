// Figma 레이어: 오퍼1 / 오퍼2 / 오퍼3 상단 (진행률 바 + 타이틀 + 서브카피)
// title에 개행이 필요하면 '\n'을 넣어주세요 (whitespace-pre-line으로 그대로 줄바꿈됩니다).

export type OfferStepHeaderProps = {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
};

export default function OfferStepHeader({
  step,
  totalSteps = 3,
  title,
  subtitle,
}: OfferStepHeaderProps) {
  return (
    <div className="w-full max-w-[390px] shrink-0">
      <div className="h-[3px] w-full bg-[var(--color-gray-200)]">
        <div
          className="h-full bg-[var(--color-action-primary)] transition-[width]"
          style={{ width: `${Math.min(step / totalSteps, 1) * 100}%` }}
        />
      </div>

      <div className="flex flex-col gap-[8px] px-[var(--spacing-screen)] pb-[8px] pt-[24px]">
        <h1 className="whitespace-pre-line text-[22px] font-bold leading-[1.35] text-[color:var(--color-text-primary)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] leading-[1.5] text-[color:var(--color-text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
