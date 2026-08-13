import { apiFetch } from '@/lib/api-client';
import type {
  CostProfileResponse,
  DriverCostProfile,
} from '../negotiation/types';

/** ONB-01: 원가 입력 → 백엔드가 손익분기(min_fare_per_km)를 자동 계산해서 돌려줍니다. */
export function postCostProfile(profile: DriverCostProfile) {
  return apiFetch<CostProfileResponse>('/api/onboarding/cost-profile', {
    method: 'POST',
    body: profile,
  });
}
