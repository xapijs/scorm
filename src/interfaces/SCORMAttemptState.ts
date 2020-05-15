import { SCORMActivityComment, Preferences } from ".";
import { ADLData } from "./ADLData";

export interface SCORMAttemptState {
  comments_from_lms: SCORMActivityComment;
  credit: "credit" | "no-credit";
  mode: "browse" | "normal" | "review";
  location: string;
  preferences: Preferences;
  total_time: string;
  adl_data: ADLData[];
}
