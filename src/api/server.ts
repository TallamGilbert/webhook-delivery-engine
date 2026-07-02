import Fastify from "fastify";
import { eventRoutes } from "./routes/events";

export async function buildApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  await app.register(eventRoutes);

  return app;
}
