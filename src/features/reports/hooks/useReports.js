import { useCallback, useEffect, useState } from "react";
import { reportClient } from "../../../shared/api/reportClient";

export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportClient.getReports();
      setReports(data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const createReport = async (payload) => {
    const created = await reportClient.createReport(payload);
    setReports((prev) => [created, ...prev]);
    return created;
  };

  return { reports, loading, error, refetch: fetchReports, createReport };
}

export function useReportDetail(reportId) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportClient.getReportById(reportId);
      setReport(data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar el reporte");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { report, loading, error, refetch: fetchReport };
}
