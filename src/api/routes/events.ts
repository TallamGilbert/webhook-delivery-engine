import { FastifyInstance } from "fastify";
import { enqueueEvent } from "../../services/queue";

export async function eventRoutes(app: FastifyInstance) {
  app.post("/events", async (request, reply) => {
    const { payload, destination } = request.body as {
      payload: Record<string, unknown>;
      destination: string;
    };

    if (!payload || !destination) {
      return reply.status(400).send({
        error: 'Both "payload" and "destination" are required',
      });
    }

    // Enqueue — returns immediately, does NOT deliver synchronously
    const eventId = await enqueueEvent({ payload, destination });

    return reply.status(202).send({
      eventId,
      status: "queued",
      message: "Event accepted for delivery",
    });
  });
}
