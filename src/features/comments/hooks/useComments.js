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

  const addComment = async (content, parentId = null) => {
    setPosting(true);
    try {
      // Supongamos que tu cliente API hace la petición POST
      const newComment = await commentClient.create(reportId, content, parentId);

      setComments((prevComments) => {
        if (!parentId) {
          // Es un comentario principal, va al inicio o final
          return [newComment, ...prevComments];
        } else {
          // Es una respuesta: lo metemos dentro del array 'replies' del comentario padre
          return prevComments.map((comment) => {
            if (comment.id === parentId) {
              const currentReplies = comment.replies || [];
              return {
                ...comment,
                replies: [...currentReplies, newComment]
              };
            }
            return comment;
          });
        }
      });
      return true;
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      return false;
    } finally {
      setPosting(false);
    }
  };

  const removeComment = async (commentId) => {
    await commentClient.remove(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return {
    comments,
    setComments,
    loading,
    error,
    posting,
    addComment,
    removeComment,
    refetch: fetchComments
  };
}