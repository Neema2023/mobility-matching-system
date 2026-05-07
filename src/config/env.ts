const requireEnv = (key: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  port: Number(process.env.PORT) || 3000,

  dbUrl: requireEnv("DB_URL", process.env.DB_URL),

  redisUrl: requireEnv("REDIS_URL", process.env.REDIS_URL),

  nodeEnv: process.env.NODE_ENV || "development",
};