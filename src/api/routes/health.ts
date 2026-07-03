import { FastifyInstance } from "fastify";
import {
  getEndpointHealth,
  getPausedEndpoints,
} from "../../services/health-scorer";

export async function healthScoreRoutes(app: FastifyInstance) {
  // GET /health-scores — all endpoints with their scores
  app.get("/health-scores", async () => {
    const prisma = (await import("../../db/client")).default;

    const destinations = await prisma.event.findMany({
      select: { destination: true },
      distinct: ["destination"],
    });

    const scores = await Promise.all(
      destinations.map((d) => getEndpointHealth(d.destination)),
    );

    return scores;
  });

  // GET /health-scores/:destination — single endpoint health
  app.get("/health-scores/:destination", async (request, reply) => {
    const { destination } = request.params as { destination: string };
    const decoded = decodeURIComponent(destination);
    const health = await getEndpointHealth(decoded);
    return health;
  });

  // GET /paused-endpoints — list paused endpoints
  app.get("/paused-endpoints", async () => {
    const paused = await getPausedEndpoints();
    return { paused };
  });
}
