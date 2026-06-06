export type SurveillanceEvent = {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  module: string;
  action: string;
  target: string;
  severity: "info" | "warning" | "critical";
  detail: string;
  ip: string;
};

export const SURVEILLANCE_MOCK_EVENTS: SurveillanceEvent[] = [];
