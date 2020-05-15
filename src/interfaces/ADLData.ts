import { Agent } from "@xapi/xapi";

export interface ADLData {
  activityId: string;
  agent: Agent;
  stateId: string;
  registration?: string;
}
