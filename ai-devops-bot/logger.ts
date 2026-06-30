export const botLogger = {
  info: (msg: string, ctx?: any) => {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: "INFO", scope: "HEALER_BOT", msg, ...ctx }));
  },
  warn: (msg: string, ctx?: any) => {
    console.warn(JSON.stringify({ timestamp: new Date().toISOString(), level: "WARN", scope: "HEALER_BOT", msg, ...ctx }));
  },
  error: (msg: string, err?: any, ctx?: any) => {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: "ERROR", scope: "HEALER_BOT", msg, error: err?.message || err, ...ctx }));
  }
};
