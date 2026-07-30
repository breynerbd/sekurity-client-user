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

      const normalizedZones = (Array.isArray(data) ? data : data?.zones || []).map((zone) => {
        const reportsArray = zone.reports || zone.Incidents || zone.reports_list || [];
        const directCount = Number(
          zone.reportsCount ?? zone.reports_count ?? zone.totalReports ?? zone.count ?? 0
        );

        return {
          ...zone,
          reportsCount: reportsArray.length > 0 ? reportsArray.length : directCount,
        };
      });

      setZones(normalizedZones);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar las zonas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const createZone = async (zoneData) => {
    try {
      const newZone = await zoneClient.createZone(zoneData);
      await fetchZones();
      return newZone;
    } catch (err) {
      throw err;
    }
  };

  return { zones, loading, error, refetch: fetchZones, createZone };
}

export function useZoneDetail(zoneId) {
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!zoneId) return;
    setLoading(true);
    zoneClient
      .getZoneById(zoneId)
      .then((data) => {
        if (mounted) {
          const reportsArray = data.reports || data.Incidents || data.reports_list || [];
          const directCount = Number(
            data.reportsCount ?? data.reports_count ?? data.totalReports ?? 0
          );

          setZone({
            ...data,
            reportsCount: reportsArray.length > 0 ? reportsArray.length : directCount,
          });
        }
      })
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