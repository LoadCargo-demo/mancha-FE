export const ROUTES = {
  home: '/',
  offer: '/offer',
  negotiation: '/negotiation',
  myCriteria: '/offer/new/cost',
  NegotiationCandiatePage: '/negotiation/candidates',
  offerNewSchedule: '/offer/new/schedule',
  offerNewConditions: '/offer/new/conditions',
  offerNewComplete: '/offer/new/complete',
} as const;

export type RouteKey = keyof typeof ROUTES;
