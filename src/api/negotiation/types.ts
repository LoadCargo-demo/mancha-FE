export type DriverCostProfile = {
  cost_per_km: number;
  value_per_hour: number;
  min_fare_per_km?: number | null;
};

export type CostProfileResponse = {
  driver_id: string;
  cost_profile: {
    cost_per_km: number;
    value_per_hour: number;
    min_fare_per_km: number;
  };
};

export type DriverConstraints = {
  fixed_pickup: string;
  fixed_pickup_time: string;
  fixed_dropoff: string;
  fixed_dropoff_time: string;
  return_location: string;
  return_deadline: string;
  exclude_manual_loading: boolean;
  avoid_night_driving: boolean;
  max_continuous_drive_min: number;
  max_daily_drive_min: number;
  vehicle_type: string;
  vehicle_capacity_pallets: number;
};

export type PrefillAiSuggestion = {
  type: string;
  message: string;
  applied: boolean;
};

export type PrefillResponse = {
  prefill: DriverConstraints;
  ai_suggestion: PrefillAiSuggestion;
};

export type RegisterDayResponse = {
  driver_id: string;
  status: string;
  message: string;
};

export type RouteBlock = {
  order_id: string | null;
  location: string;
  arrival_time: string;
  action: string;
  is_fixed: boolean;
};

export type Package = {
  package_id: string;
  label: string;
  blocks: RouteBlock[];
  order_ids: string[];
  empty_km: number;
  nominal_profit: number;
  return_time: string;
  is_recommended: boolean;
  excluded_reason: string | null;
  hard_violations: string[];
};

export type Deduction = {
  label: string;
  amount: number;
  source: string;
};

export type PackageEvaluation = {
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

export type PackageComparisonResponse = {
  packages: PackageEvaluation[];
  recommendation_reason?: string;
};

export type VoiceBriefing = {
  briefing_text: string;
  recommended_package_id: string;
  expected_wait_min: number;
  success_probability: number;
};

export type ConfirmResponse = {
  status: string;
  package: Package;
  adjusted_profit: number;
};

export type QnaSource = {
  source: string;
  text: string;
};

export type QnaResponse = {
  answer: string;
  sources: QnaSource[];
  follow_up_questions: string[];
};
