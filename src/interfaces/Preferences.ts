import { RFC5646LanguageCodes } from "@xapi/xapi";

export interface Preferences {
  audio_level: number;
  language: RFC5646LanguageCodes;
  delivery_speed: number;
  audio_captioning: -1 | 0 | 1;
}
