import Fastify from "fastify";
import { eventRoutes } from "./routes/events";
import { deadLetterRoutes } from "./routes/dead-letters";
import { replayRoutes } from "./routes/replay";

export async function buildApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  await app.register(eventRoutes);
  await app.register(deadLetterRoutes);
  await app.register(replayRoutes);

  return app;
}
