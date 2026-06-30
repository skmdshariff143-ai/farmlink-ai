// =================================================================================
// FARMLINK AI - CENTRALIZED OBSERVABILITY & TELEMETRY ENGINE
// =================================================================================

import { NextResponse } from "next/server";

// 1. Env key validations
export function validateEnvironment() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ CRITICAL CONFIGURATION FAULT: DATABASE_URL is missing!");
    throw new Error("Missing DATABASE_URL configuration parameter");
  }
  
  if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
    console.warn("⚠ WARNING: DATABASE_URL format is non-standard for PostgreSQL connection.");
  }

  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  if (!nextAuthSecret) {
    console.warn("⚠ WARNING: NEXTAUTH_SECRET is not configured. Sessions might be insecure.");
  }
}

// 2. Structured telemetry logs
export const logger = {
  info: (message: string, context?: any) => {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: "INFO", message, ...context }));
  },
  warn: (message: string, context?: any) => {
    console.warn(JSON.stringify({ timestamp: new Date().toISOString(), level: "WARN", message, ...context }));
  },
  error: (message: string, error?: any, context?: any) => {
    console.error(JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      level: "ERROR", 
      message, 
      error: error?.message || error, 
      stack: error?.stack,
      ...context 
    }));
  }
};

// 3. API Response timings monitor
export async function withTelemetry(
  routeName: string, 
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = performance.now();
  try {
    validateEnvironment();
    const response = await handler();
    const duration = (performance.now() - startTime).toFixed(2);
    
    logger.info(`✓ API Request Completed: ${routeName}`, { 
      route: routeName, 
      durationMs: Number(duration),
      status: response.status 
    });

    return response;
  } catch (err: any) {
    const duration = (performance.now() - startTime).toFixed(2);
    logger.error(`❌ API Request Failed: ${routeName}`, err, { 
      route: routeName, 
      durationMs: Number(duration) 
    });

    return NextResponse.json({ 
      success: false, 
      error: "Internal server telemetry fault", 
      message: err.message 
    }, { status: 500 });
  }
}
