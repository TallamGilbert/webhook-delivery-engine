import prisma from "../db/client";
import { deliver } from "./delivery";
import { logAttempt } from "./attempt-logger";
import { getNextAttemptTime, MAX_ATTEMPTS } from "./backoff";

export async function processDueJobs(): Promise<number> {
  // Find all jobs that are pending and due
  const dueJobs = await prisma.event.findMany({
    where: {
      status: "pending",
      nextAttemptAt: {
        lte: new Date(),
      },
    },
  });

  for (const job of dueJobs) {
    const attemptNumber = job.attemptCount + 1;
    const payload = JSON.parse(job.payload);

    // Mark as processing so another worker doesn't pick it up
    await prisma.event.update({
      where: { id: job.id },
      data: { status: "processing" },
    });

    // Deliver
    const result = await deliver(payload, job.destination);

    // Log the attempt
    await logAttempt(job.id, attemptNumber, result);

    if (result.success) {
      // Done
      await prisma.event.update({
        where: { id: job.id },
        data: { status: "completed" },
      });
    } else if (attemptNumber >= MAX_ATTEMPTS) {
      // Exhausted — move to dead-letter queue
      await prisma.event.update({
        where: { id: job.id },
        data: { status: "dead_lettered" },
      });
    } else {
      // Schedule next retry
      const nextAttemptAt = getNextAttemptTime(attemptNumber + 1);
      await prisma.event.update({
        where: { id: job.id },
        data: {
          status: "pending",
          nextAttemptAt,
        },
      });
    }
  }

  return dueJobs.length;
}
