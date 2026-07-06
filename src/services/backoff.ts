// Delays in milliseconds for attempts 1 through 5
export const BACKOFF_SCHEDULE: Record<number, number> = {
  1: 0, // immediate
  2: 1 * 60 * 1000, // 1 minute
  3: 5 * 60 * 1000, // 5 minutes
  4: 30 * 60 * 1000, // 30 minutes
  5: 2 * 60 * 60 * 1000, // 2 hours
};

export const MAX_ATTEMPTS = 5;

export function getNextAttemptTime(attemptNumber: number): Date | null {
  if (attemptNumber > MAX_ATTEMPTS) {
    return null; // exhausted — dead-letter
  }

  const delay = BACKOFF_SCHEDULE[attemptNumber];
  return new Date(Date.now() + delay);
}
