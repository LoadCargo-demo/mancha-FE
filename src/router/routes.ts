export const ROUTES = {
  home: '/',
  offer: '/offer',
  negotiation: '/negotiation',
  myCriteria: '/offer/new/cost',
  NegotiationCandiatePage: '/negotiation/candidates',
  offerNewSchedule: '/offer/new/schedule',
  offerNewConditions: '/offer/new/conditions',
  offerNewComplete: '/offer/new/complete',
  negotiationCall: '/negotiation/call',
  negotiationEvidence: '/negotiation/evidence',
  negotiationCompare: '/negotiation/compare',
  negotiationResult: '/negotiation/result',
  drivingMode1: '/driving/1',
  drivingMode2: '/driving/2',
  drivingMode3: '/driving/3',
  Reassembly: '/Reassembly',
  dailyReport: '/daily-report',
} as const;

export type RouteKey = keyof typeof ROUTES;
