import { useState, useEffect } from "react";
import { eventsApi, PriceHistoryResponse, PredictionResponse, BuyLink, NewsArticle } from "@/api/events";

export function useEventPrices(eventId: string) {
  const [history, setHistory] = useState<PriceHistoryResponse | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [buyLinks, setBuyLinks] = useState<BuyLink[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    Promise.all([
      eventsApi.priceHistory(eventId),
      eventsApi.prediction(eventId),
      eventsApi.buyLinks(eventId),
      eventsApi.news(eventId),
    ])
      .then(([h, p, b, n]) => {
        setHistory(h.data);
        setPrediction(p.data);
        setBuyLinks(b.data);
        setNews(n.data);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  return { history, prediction, buyLinks, news, loading };
}
