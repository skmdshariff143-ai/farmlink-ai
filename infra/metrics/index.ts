// =================================================================================
// FARMLINK AI - METRICS TELEMETRY & SYSTEM MONITOR
// =================================================================================

import { logger } from "@/lib/monitoring";

const metricsStore = new Map<string, number>();

export const MetricsEngine = {
  increment(metricName: string, value: number = 1): void {
    const current = metricsStore.get(metricName) || 0;
    metricsStore.set(metricName, current + value);
    logger.info(`📈 Metrics Tick: ${metricName}`, { val: current + value });
  },

  set(metricName: string, value: number): void {
    metricsStore.set(metricName, value);
  },

  get(metricName: string): number {
    return metricsStore.get(metricName) || 0;
  },

  dump(): Record<string, number> {
    return Object.fromEntries(metricsStore.entries());
  }
};
