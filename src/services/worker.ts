import prisma from "../db/client";
import { deliver } from "./delivery";
import { logAttempt } from "./attempt-logger";
import { getNextAttemptTime, MAX_ATTEMPTS } from "./backoff";
import { shouldPauseEndpoint } from "./health-scorer";

export async function processDueJobs(): Promise<number> {
  const dueJobs = await prisma.event.findMany({
    where: {
      status: "pending",
      nextAttemptAt: {
        lte: new Date(),
      },
    },
  });

  for (const job of dueJobs) {
    // Check if endpoint is paused
    const paused = await shouldPauseEndpoint(job.destination);
    if (paused) {
      console.log(
        `Skipping ${job.id} — destination ${job.destination} is paused (health < 20)`,
      );
      continue;
    }

    const attemptNumber = job.attemptCount + 1;
    const payload = JSON.parse(job.payload);

    await prisma.event.update({
      where: { id: job.id },
      data: { status: "processing" },
    });

    const result = await deliver(payload, job.destination);
    await logAttempt(job.id, attemptNumber, result);

    if (result.success) {
      await prisma.event.update({
        where: { id: job.id },
        data: { status: "completed" },
      });
    } else if (attemptNumber >= MAX_ATTEMPTS) {
      await prisma.event.update({
        where: { id: job.id },
        data: { status: "dead_lettered" },
      });
    } else {
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
