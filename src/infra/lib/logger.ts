function log(level: "debug" | "info" | "warn" | "error", message: string, meta?: Record<string, unknown>): void {
  const entry = JSON.stringify({ level, message, timestamp: new Date().toISOString(), ...meta });
  if (level === "warn") {
    console.warn(entry);
  } else if (level === "error") {
    console.error(entry);
  } else {
    console.log(entry);
  }
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    log("debug", message, meta);
  },
  info(message: string, meta?: Record<string, unknown>): void {
    log("info", message, meta);
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    log("warn", message, meta);
  },
  error(message: string, meta?: Record<string, unknown>): void {
    log("error", message, meta);
  },
};
