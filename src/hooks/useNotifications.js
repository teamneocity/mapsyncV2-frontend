// src/hooks/useNotifications.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";

const PAGE_SIZE = 10;

export function useNotifications({ open }) {
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState(null);

  const parseList = (data) => {
    // Suporta backend que retorna array direto OU dentro de { data: [] }
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const fetchPage = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/notifications", {
          params: { page: targetPage, limit: PAGE_SIZE },
        });

        const list = parseList(data);
        setNotifications(list);
        setHasNext(list.length === PAGE_SIZE);

        // Se a página pedida veio vazia (e não é a primeira), recua uma página
        if (targetPage > 1 && list.length === 0) {
          setPage((p) => Math.max(1, p - 1));
        } else {
          setPage(targetPage);
        }
      } catch (e) {
        setError(e);
        setNotifications([]);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Carrega quando o dropdown abre
  useEffect(() => {
    if (open) fetchPage(1);
  }, [open, fetchPage]);

  const nextPage = useCallback(() => {
    if (hasNext && !loading) fetchPage(page + 1);
  }, [fetchPage, hasNext, loading, page]);

  const prevPage = useCallback(() => {
    if (page > 1 && !loading) fetchPage(page - 1);
  }, [fetchPage, loading, page]);

  const markAsRead = useCallback(async (id) => {
    // Otimista: seta como lida (true) localmente
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await api.patch(`/notifications/${id}/read`);
      // Se sua API já retorna o objeto atualizado, você pode refetch ou mesclar aqui.
    } catch (e) {
      // rollback em caso de erro
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    // Otimista: marca todas localmente
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const results = await Promise.allSettled(
      unread.map((n) => api.patch(`/notifications/${n.id}/read`))
    );

    // Se falhar alguma, faz um refetch da página atual para garantir consistência
    const hasFailure = results.some((r) => r.status === "rejected");
    if (hasFailure) {
      fetchPage(page);
    }
  }, [notifications, fetchPage, page]);

  const allRead = useMemo(
    () => notifications.length > 0 && notifications.every((n) => n.read === true),
    [notifications]
  );

  return {
    notifications,
    loading,
    error,
    page,
    hasNext,
    nextPage,
    prevPage,
    fetchPage,
    markAsRead,
    markAllRead,
    allRead,
  };
}
