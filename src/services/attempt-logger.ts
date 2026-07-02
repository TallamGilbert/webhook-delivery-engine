import prisma from "../db/client";
import { DeliveryResult } from "./delivery";

export async function logAttempt(
  eventId: string,
  attemptNumber: number,
  result: DeliveryResult,
) {
  await prisma.attempt.create({
    data: {
      eventId,
      attemptNumber,
      statusCode: result.statusCode,
      error: result.error,
      success: result.success,
    },
  });

  await prisma.event.update({
    where: { id: eventId },
    data: {
      attemptCount: attemptNumber,
      status: result.success ? "completed" : "pending",
    },
  });
}
