import { FastifyInstance } from "fastify";
import prisma from "../../db/client";
import { getNextAttemptTime } from "../../services/backoff";

export async function replayRoutes(app: FastifyInstance) {
  app.post("/events/:id/replay", async (request, reply) => {
    const { id } = request.params as { id: string };

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return reply.status(404).send({
        error: "Event not found",
      });
    }

    if (event.status !== "dead_lettered" && event.status !== "completed") {
      return reply.status(400).send({
        error: `Cannot replay event with status "${event.status}". Only dead_lettered or completed events can be replayed.`,
      });
    }

    // Reset for replay — keeps original ID, resets attempt count, schedules immediate retry
    await prisma.event.update({
      where: { id },
      data: {
        status: "pending",
        attemptCount: 0,
        nextAttemptAt: getNextAttemptTime(1), // immediate
      },
    });

    return {
      eventId: id,
      status: "requeued",
      message: "Event has been requeued for delivery. Original ID preserved.",
    };
  });
}
