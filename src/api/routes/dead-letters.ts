import { FastifyInstance } from "fastify";
import prisma from "../../db/client";

export async function deadLetterRoutes(app: FastifyInstance) {
  app.get("/dead-letters", async () => {
    const events = await prisma.event.findMany({
      where: { status: "dead_lettered" },
      include: {
        attempts: {
          orderBy: { attemptNumber: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return events.map((event) => ({
      eventId: event.id,
      destination: event.destination,
      attemptCount: event.attemptCount,
      lastError: event.attempts[0]?.error || "Unknown",
      lastStatusCode: event.attempts[0]?.statusCode || null,
      deadLetteredAt: event.updatedAt,
    }));
  });
}
