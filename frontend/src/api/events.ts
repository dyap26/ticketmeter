import api from "./client";

export interface EventSummary {
  id: string;
  title: string;
  event_type: string;
  magnitude: string;
  venue_name: string | null;
  venue_city: string | null;
  event_datetime: string;
  image_url: string | null;
  popularity_score: number;
  min_price: number | null;
  avg_price: number | null;
  buy_score: number | null;
  recommendation: string | null;
  distance_miles: number | null;
}

export interface EventDetail extends EventSummary {
  external_id: string | null;
  source: string;
  sport_type: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PriceHistoryPoint {
  date: string;
  min: number | null;
  avg: number | null;
  platform: string;
}

export interface PredictedPoint {
  date: string;
  min_est: number;
  avg_est: number;
  confidence: number;
}

export interface PriceHistoryResponse {
  historical: PriceHistoryPoint[];
  predicted: PredictedPoint[];
}

export interface PredictionResponse {
  score: number;
  recommendation: string;
  confidence: number;
  reasoning: string[];
  best_window_start: string | null;
  best_window_end: string | null;
}

export interface BuyLink {
  platform: string;
  url: string;
  min_price: number | null;
  display_name: string;
}

export interface NewsArticle {
  title: string;
  url: string;
  published_at: string;
  source: string | null;
  sentiment_score: number | null;
}

export const eventsApi = {
  list: (params: {
    lat?: number;
    lon?: number;
    radius_miles?: number;
    q?: string;
    category?: string;
  }) => api.get<EventSummary[]>("/events", { params }),

  get: (id: string) => api.get<EventDetail>(`/events/${id}`),

  priceHistory: (id: string) => api.get<PriceHistoryResponse>(`/events/${id}/price-history`),

  prediction: (id: string) => api.get<PredictionResponse>(`/events/${id}/prediction`),

  buyLinks: (id: string) => api.get<BuyLink[]>(`/events/${id}/buy-links`),

  news: (id: string) => api.get<NewsArticle[]>(`/events/${id}/news`),
};
