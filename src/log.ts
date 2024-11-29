import { cheese, CheeseColors } from "cheese-log";
import { allowedVerboseModes, VerboseMode } from "./allowedVerboseModes";

export const log = (scriptOutputMode: VerboseMode, logIfMin: VerboseMode, color: CheeseColors | "", msg: string) => {
  if (allowedVerboseModes.indexOf(scriptOutputMode) < allowedVerboseModes.indexOf(logIfMin)) {
    return;
  }
  cheese[`info${color}`](msg);
};
