import pino from "pino";
import pretty from "pino-pretty";

const isLocal = process.env.ENV === "development";

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  isLocal
    ? pretty({
        colorize: true,
        translateTime: "yyyy-mm-dd HH:MM:ss.l",
        ignore: "pid,hostname",
      })
    : pino.destination()
);
