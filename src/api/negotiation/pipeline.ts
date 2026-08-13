// /api/pipeline

import { apiFetch } from '@/lib/api-client';

export type ScoutOrder = {
  order_id: string;
  pickup: string;
  dropoff: string;
  pickup_start: string;
  pickup_end: string;
  cargo_type: string;
  pallet_count: number;
  loading_type: 'forklift' | 'manual' | string;
  price: number;
  shipper_name: string;
  raw_text: string | null;
};

export type ScoutResult = {
  collected_count: number;
  passed_count: number;
  passed_orders: ScoutOrder[];
  completed_at: string; // ISO datetime
};

export type PackageBlock = {
  order_id: string | null;
  location: string;
  arrival_time: string;
  action: '상차' | '하차' | '귀가' | string;
  is_fixed: boolean;
};

export type Package = {
  package_id: string;
  label: string;
  blocks: PackageBlock[];
  order_ids: string[];
  empty_km: number;
  nominal_profit: number;
  return_time: string;
  is_recommended: boolean;
  excluded_reason: string | null;
  hard_violations: string[];
};

export type BuilderResult = {
  generated_combination_count: number;
  passed_constraint_count: number;
  packages: Package[];
  completed_at: string;
};

export type OrderRisk = {
  order_id: string;
  shipper_name: string;
  cancel_probability: number; // 0~1
  delay_probability: number; // 0~1
  success_probability: number; // 0~1
  is_auto_excluded: boolean;
  exclude_reason: string | null;
  backup_order_id: string | null;
  explanation: string; // 오더별 리스크 판단 근거 문장
};

export type RiskResult = {
  order_risks: OrderRisk[];
  excluded_count: number;
  backup_pairs: Record<string, string>;
};

export type Deduction = {
  label: string;
  amount: number;
  source: string;
};

export type RankedPackage = {
  package: Package;
  expected_wait_min: number;
  success_probability: number;
  empty_cost: number;
  wait_cost: number;
  adjusted_profit: number;
  deductions: Deduction[];
  balanced_score: number;
  recommendable: boolean;
};

export type AppraisalResult = {
  ranked_packages: RankedPackage[];
  recommended_package_id: string;
  recommendation_reason: string;
  briefing_text: string;
};

export type RunAllResponse = {
  driver_id: string;
  status: string; // 예: "briefing_ready"
  scout: ScoutResult;
  builder: BuilderResult;
  risk: RiskResult;
  appraisal: AppraisalResult;
};

export function runAll() {
  return apiFetch<RunAllResponse>('/api/pipeline/run-all', { method: 'POST' });
}

// 개별 단계 실행이 필요할 때를 위해 남겨둠 (run-all과 각각 같은 모양의 하위 필드를 반환)
export function runScout() {
  return apiFetch<ScoutResult>('/api/pipeline/scout', { method: 'POST' });
}
export function runBuilder() {
  return apiFetch<BuilderResult>('/api/pipeline/builder', { method: 'POST' });
}
export function runRisk() {
  return apiFetch<RiskResult>('/api/pipeline/risk', { method: 'POST' });
}
export function runAppraiser() {
  return apiFetch<AppraisalResult>('/api/pipeline/appraiser', {
    method: 'POST',
  });
}

export type PipelineStatusResponse = {
  status: string;
  scout?: ScoutResult;
  builder?: BuilderResult;
  risk?: RiskResult;
  risk_excluded_count?: number;
  appraisal?: AppraisalResult;
};

export function getPipelineStatus() {
  return apiFetch<PipelineStatusResponse>('/api/pipeline/status');
}

export function formatTime(iso: string): string {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return iso;

  const utcHours = parseInt(match[1], 10);
  const minutes = match[2];
  const kstHours = (utcHours + 9) % 24;

  return `${String(kstHours).padStart(2, '0')}:${minutes}`;
}
