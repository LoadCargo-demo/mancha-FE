export const ROUTES = {
  home: '/',
  offer: '/offer',
  negotiation: '/negotiation',
  myCriteria: '/offer/new/cost',
  onboarding: '/onboarding',
} as const;

export type RouteKey = keyof typeof ROUTES;
