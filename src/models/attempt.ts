export interface AttemptRecord {
  eventId: string;
  attemptNumber: number;
  timestamp: Date;
  statusCode?: number;
  error?: string;
  success: boolean;
}
