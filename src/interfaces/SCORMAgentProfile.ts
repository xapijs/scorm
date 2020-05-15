import { Preferences } from "./Preferences";

export interface SCORMAgentProfile {
  learner_id: string;
  learner_name: string;
  preferences: Preferences;
}
