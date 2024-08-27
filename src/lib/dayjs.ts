import dayjsLib from "dayjs";
import duration from "dayjs/plugin/duration";
import relative from "dayjs/plugin/relativeTime";

dayjsLib.extend(relative);
dayjsLib.extend(duration);

export const dayjs = dayjsLib;
