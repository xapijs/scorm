import { Agent } from "@xapi/xapi";

export interface SCORMConfig {
  attemptIRI?: string;
  courseIRI: string;
  courseTitle?: string;
  courseDescription?: string;
  endpoint: string;
  auth?: string;
  lessonIRI: string;
  lessonTitle?: string;
  lessonDescription?: string;
  entry?: "ab-initio" | "resume";
  actor: Agent;
}
