import { useCallback, useEffect, useState } from "react";
import { ratingClient } from "../../../shared/api/ratingClient";

export function useRatings(zoneId) {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRatings = useCallback(async () => {
    if (!zoneId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ratingClient.getByZone(zoneId);
      setRatings(data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar las calificaciones");
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const submitRating = async (score, comment) => {
    setSubmitting(true);
    try {
      const created = await ratingClient.create(zoneId, score, comment);
      setRatings((prev) => [...prev, created]);
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo enviar la calificación");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { ratings, loading, error, submitting, submitRating, refetch: fetchRatings };
}
