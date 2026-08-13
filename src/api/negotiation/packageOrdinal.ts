// 백엔드 패키지에는 "1안/2안/3안" 같은 순번이 없고 label(균형형 등)만 있어서,
// 명목 순수익 내림차순으로 화면 표시용 순번을 붙여줍니다.

import type { PackageEvaluation } from '../negotiation/types';

const ORDINAL_LABELS = ['1안', '2안', '3안'];

export type RankedPackage = {
  ordinal: string;
  evaluation: PackageEvaluation;
};

export function withOrdinalLabels(
  evaluations: PackageEvaluation[],
): RankedPackage[] {
  return [...evaluations]
    .sort((a, b) => b.package.nominal_profit - a.package.nominal_profit)
    .map((evaluation, index) => ({
      ordinal: ORDINAL_LABELS[index] ?? `${index + 1}안`,
      evaluation,
    }));
}
