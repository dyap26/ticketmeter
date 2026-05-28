import api from "./client";

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  notification_email: boolean;
  notification_push: boolean;
}

export const authApi = {
  register: (email: string, password: string, display_name?: string) =>
    api.post<User>("/auth/register", { email, password, display_name }),

  login: (email: string, password: string) =>
    api.post<{ access_token: string }>("/auth/login", { email, password }),

  logout: () => api.post("/auth/logout"),

  me: () => api.get<User>("/users/me"),

  updateMe: (data: Partial<User & { push_subscription: string }>) =>
    api.patch<User>("/users/me", data),
};
