import { FastifyInstance } from "fastify";
import { generateEventId } from "../../lib/id-generator";
import { deliver } from "../../services/delivery";
import { logAttempt } from "../../services/attempt-logger";
import prisma from "../../db/client";
import { config } from "../../config";

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

    const eventId = generateEventId();

    await prisma.event.create({
      data: {
        id: eventId,
        payload: JSON.stringify(payload),
        destination,
        secret: config.webhookSecret,
        status: "processing",
      },
    });

    const result = await deliver(payload, destination);
    await logAttempt(eventId, 1, result);

    return reply.status(201).send({
      eventId,
      status: result.success ? "delivered" : "failed",
      attempt: {
        attemptNumber: 1,
        success: result.success,
        statusCode: result.statusCode,
        error: result.error,
      },
    });
  });
}
