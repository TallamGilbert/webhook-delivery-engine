export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "0.0.0.0",
  webhookSecret:
    process.env.WEBHOOK_SECRET || "dev-secret-change-in-production",
  workerPollInterval: parseInt(process.env.WORKER_POLL_INTERVAL || "1000", 10),
};
