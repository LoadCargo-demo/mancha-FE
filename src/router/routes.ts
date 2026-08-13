export const ROUTES = {
  home: '/',
  offer: '/offer',
  negotiation: '/negotiation',
  myCriteria: '/offer/new/cost',
  onboarding: '/onboarding',
  offerNewSchedule: '/offer/new/schedule',
  offerNewConditions: '/offer/new/conditions',
  offerNewComplete: '/offer/new/complete',
} as const;

export type RouteKey = keyof typeof ROUTES;
