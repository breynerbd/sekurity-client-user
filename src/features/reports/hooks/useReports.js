import { useCallback, useEffect, useState } from "react";
import { reportClient } from "../../../shared/api/reportClient";
import { useFocusEffect } from "@react-navigation/native";

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

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  const createReport = async (payload) => {
    const created = await reportClient.createReport(payload);
    setReports((prev) => [created, ...prev]);
    return created;
  };

  const rateReport = async (reportId, severityLevel) => {
    const previousReports = [...reports];

    try {
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
              ...r,
              severity_rating: severityLevel,
              danger_level: severityLevel,
              severity: severityLevel
            }
            : r
        )
      );

      const updated = await reportClient.rateReport(reportId, severityLevel);

      setReports((prev) =>
        prev.map((r) => {
          if (r.id === reportId) {
            return {
              ...r,
              ...updated,
              severity_rating: updated?.severity_rating || updated?.danger_level || severityLevel,
            };
          }
          return r;
        })
      );

      return updated;
    } catch (err) {
      setReports(previousReports);
      throw err;
    }
  };

  return { reports, loading, error, refetch: fetchReports, createReport, rateReport };
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