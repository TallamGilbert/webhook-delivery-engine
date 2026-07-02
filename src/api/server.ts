import Fastify from "fastify";
import { config } from "../config";

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Health check
  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  return app;
}
