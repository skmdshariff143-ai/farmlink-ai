// =================================================================================
// FARMLINK AI - LOGGING INFRASTRUCTURE LAYER
// =================================================================================

import { logger } from "@/lib/monitoring";

export const SystemLogger = {
  info: (msg: string, ctx?: any) => logger.info(msg, ctx),
  warn: (msg: string, ctx?: any) => logger.warn(msg, ctx),
  error: (msg: string, err?: any, ctx?: any) => logger.error(msg, err, ctx)
};
