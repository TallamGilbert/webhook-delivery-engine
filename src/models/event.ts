export interface DeliveryEvent {
  id: string;
  payload: Record<string, unknown>;
  destination: string;
}

export interface CreateEventRequest {
  payload: Record<string, unknown>;
  destination: string;
}
