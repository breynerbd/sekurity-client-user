import { useCallback, useEffect, useState } from "react";
import { zoneClient } from "../../../shared/api/zoneClient";

export function useZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await zoneClient.getZones();
      setZones(data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar las zonas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  return { zones, loading, error, refetch: fetchZones };
}

export function useZoneDetail(zoneId) {
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    zoneClient
      .getZoneById(zoneId)
      .then((data) => mounted && setZone(data))
      .catch((err) =>
        mounted &&
        setError(err?.response?.data?.message || "No se pudo cargar la zona")
      )
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [zoneId]);

  return { zone, loading, error };
}
