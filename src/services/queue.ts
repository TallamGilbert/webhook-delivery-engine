import prisma from "../db/client";
import { config } from "../config";
import { CreateEventRequest } from "../models/event";
import { generateEventId } from "../lib/id-generator";
import { getNextAttemptTime } from "./backoff";

export async function enqueueEvent(
  request: CreateEventRequest,
): Promise<string> {
  const eventId = generateEventId();
  const nextAttemptAt = getNextAttemptTime(1); // immediate

  await prisma.event.create({
    data: {
      id: eventId,
      payload: JSON.stringify(request.payload),
      destination: request.destination,
      secret: config.webhookSecret,
      status: "pending",
      attemptCount: 0,
      nextAttemptAt,
    },
  });

  return eventId;
}
