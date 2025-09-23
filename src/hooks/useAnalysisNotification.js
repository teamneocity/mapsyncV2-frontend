// src/hooks/useAnalysisNotification.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/services/api";

export function useAnalysisNotification({
  userId,
  intervalFg = 45_000,
  intervalBg = 120_000,
  paused = false,
} = {}) {
  const [currentCount, setCurrentCount] = useState(0);

  const [lastSeenCount, setLastSeenCount] = useState(null);

  const hasNew = useMemo(() => {
    if (lastSeenCount === null) return false;
    return currentCount > lastSeenCount;
  }, [currentCount, lastSeenCount]);

  const timeoutRef = useRef(null);
  const abortRef = useRef(null);

  const storageKey = useMemo(() => {
    const id = userId ?? "anon";
    return `analysis:lastSeenCount:${id}`;
  }, [userId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) {
        const parsed = Number(raw);
        setLastSeenCount(Number.isFinite(parsed) ? parsed : 0);
      } else {
        setLastSeenCount(null);
      }
    } catch {
      setLastSeenCount(0);
    }
  }, [storageKey]);

  const persistLastSeen = useCallback(
    (value) => {
      try {
        localStorage.setItem(storageKey, String(value));
      } catch {}
      setLastSeenCount(value);
    },
    [storageKey]
  );

  const markAsSeen = useCallback(() => {
    persistLastSeen(currentCount);
  }, [currentCount, persistLastSeen]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== storageKey) return;
      const val = e.newValue == null ? null : Number(e.newValue);
      if (val === null) {
        setLastSeenCount(null);
      } else if (Number.isFinite(val)) {
        setLastSeenCount(val);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  const fetchCount = useCallback(async (signal) => {
    const { data } = await api.get("/occurrences/in-analysis", { signal });
    const totalCount = Number(data?.totalCount ?? 0);
    return Number.isFinite(totalCount) ? totalCount : 0;
  }, []);

  useEffect(() => {
    if (paused) return;

    let stopped = false;

    const loop = async () => {
      if (stopped) return;

      const visible = document.visibilityState === "visible";
      const baseInterval = visible ? intervalFg : intervalBg;

      if (!navigator.onLine) {
        timeoutRef.current = setTimeout(loop, baseInterval);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const total = await fetchCount(controller.signal);
        setCurrentCount(total);

        timeoutRef.current = setTimeout(loop, baseInterval);
      } catch (err) {
        if (controller.signal.aborted) return;

        const backoff = Math.min(baseInterval * 2, 5 * 60 * 1000);
        timeoutRef.current = setTimeout(loop, backoff);
      }
    };

    loop();

    return () => {
      stopped = true;
      abortRef.current?.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [intervalFg, intervalBg, paused, fetchCount]);

  return {
    hasNew,
    currentCount,
    lastSeenCount,
    markAsSeen,
  };
}
