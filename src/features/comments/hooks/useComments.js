import { useCallback, useEffect, useState } from "react";
import { commentClient } from "../../../shared/api/commentClient";

export function useComments(reportId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await commentClient.getByReport(reportId);
      setComments(data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los comentarios");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content) => {
    setPosting(true);
    try {
      const created = await commentClient.create(reportId, content);
      setComments((prev) => [...prev, created]);
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo publicar el comentario");
      return false;
    } finally {
      setPosting(false);
    }
  };

  const removeComment = async (commentId) => {
    await commentClient.remove(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return { comments, loading, error, posting, addComment, removeComment, refetch: fetchComments };
}
