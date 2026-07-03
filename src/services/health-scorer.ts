import prisma from "../db/client";

const HEALTH_WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const AUTO_PAUSE_THRESHOLD = 20;

export interface EndpointHealth {
  destination: string;
  score: number;
  paused: boolean;
  recentAttempts: number;
  recentSuccesses: number;
}

export async function calculateHealthScore(
  destination: string,
): Promise<number> {
  const windowStart = new Date(Date.now() - HEALTH_WINDOW_MS);

  const recentAttempts = await prisma.attempt.findMany({
    where: {
      event: {
        destination,
      },
      timestamp: {
        gte: windowStart,
      },
    },
  });

  if (recentAttempts.length === 0) {
    return 100; // No data = assume healthy
  }

  const successes = recentAttempts.filter((a) => a.success).length;
  return Math.round((successes / recentAttempts.length) * 100);
}

export async function getEndpointHealth(
  destination: string,
): Promise<EndpointHealth> {
  const windowStart = new Date(Date.now() - HEALTH_WINDOW_MS);

  const recentAttempts = await prisma.attempt.findMany({
    where: {
      event: {
        destination,
      },
      timestamp: {
        gte: windowStart,
      },
    },
  });

  const successes = recentAttempts.filter((a) => a.success).length;
  const score =
    recentAttempts.length === 0
      ? 100
      : Math.round((successes / recentAttempts.length) * 100);

  return {
    destination,
    score,
    paused: score < AUTO_PAUSE_THRESHOLD,
    recentAttempts: recentAttempts.length,
    recentSuccesses: successes,
  };
}

export async function shouldPauseEndpoint(
  destination: string,
): Promise<boolean> {
  const score = await calculateHealthScore(destination);
  return score < AUTO_PAUSE_THRESHOLD;
}

export async function getPausedEndpoints(): Promise<string[]> {
  const allDestinations = await prisma.event.findMany({
    select: { destination: true },
    distinct: ["destination"],
  });

  const paused: string[] = [];

  for (const { destination } of allDestinations) {
    const score = await calculateHealthScore(destination);
    if (score < AUTO_PAUSE_THRESHOLD) {
      paused.push(destination);
    }
  }

  return paused;
}
