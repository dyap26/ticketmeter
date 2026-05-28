import api from "./client";

export interface TrackedEvent {
  id: string;
  event_id: string;
  target_price: number | null;
  notify_cheapest: boolean;
  notify_flash_sale: boolean;
  notify_last_minute: boolean;
}

export interface Entity {
  id: string;
  name: string;
  slug: string;
  entity_type: string;
  sport_genre: string | null;
  popularity_score: number;
  win_streak: number;
  recent_form: string | null;
}

export interface Notification {
  id: string;
  event_id: string;
  type: string;
  message: string;
  sent_at: string;
  read_at: string | null;
}

export const usersApi = {
  getTrackedEvents: () => api.get<TrackedEvent[]>("/users/me/tracked"),

  trackEvent: (event_id: string, opts?: Partial<TrackedEvent>) =>
    api.post<TrackedEvent>("/users/me/tracked", { event_id, ...opts }),

  untrackEvent: (event_id: string) => api.delete(`/users/me/tracked/${event_id}`),

  getTrackedEntities: () => api.get<Entity[]>("/users/me/entities"),

  trackEntity: (entity_id: string) => api.post<Entity>("/users/me/entities", { entity_id }),

  untrackEntity: (entity_id: string) => api.delete(`/users/me/entities/${entity_id}`),

  getNotifications: () => api.get<Notification[]>("/notifications/"),

  markNotifRead: (id: string) => api.patch(`/notifications/${id}/read`),

  registerPush: (subscription: string) =>
    api.post("/users/me/push-subscription", { subscription }),
};
