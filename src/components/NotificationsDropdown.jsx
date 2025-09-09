// src/components/NotificationsDropdown.jsx
import { useRef } from "react";
import { X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationsDropdown({
  open,
  onClose,

  notifications: notificationsProp,
  onToggleRead: onToggleReadProp,
  onMarkAllRead: onMarkAllReadProp,

  page: pageProp,
  hasNext: hasNextProp,
  onNextPage: onNextPageProp,
  onPrevPage: onPrevPageProp,
  loading: loadingProp,
  error: errorProp,
}) {
  const ref = useRef(null);

  const {
    notifications: notificationsHook,
    loading: loadingHook,
    error: errorHook,
    page: pageHook,
    hasNext: hasNextHook,
    nextPage,
    prevPage,
    markAsRead,
    markAllRead,
    allRead: allReadHook,
  } = useNotifications({ open });

  if (!open) return null;

  const notifications = notificationsProp ?? notificationsHook;
  const loading = loadingProp ?? loadingHook;
  const error = errorProp ?? errorHook;
  const page = pageProp ?? pageHook;
  const hasNext = hasNextProp ?? hasNextHook;

  const allRead =
    notifications && notifications.length > 0
      ? notificationsProp
        ? notifications.every((n) => n.read === true)
        : allReadHook
      : false;

  const handleToggleAllRead = (e) => {
    if (!e.target.checked) return;
    if (onMarkAllReadProp) onMarkAllReadProp();
    else markAllRead();
  };

  const handleToggleOne = (id) => {
    if (onToggleReadProp) onToggleReadProp(id);
    else markAsRead(id);
  };

  const handlePrev = () => {
    if (onPrevPageProp) onPrevPageProp();
    else prevPage();
  };

  const handleNext = () => {
    if (onNextPageProp) onNextPageProp();
    else nextPage();
  };

  return (
    <div ref={ref} className="absolute right-0 z-50 w-[374px]">
      <div className="mt-2 w-[374px] h-[48px] rounded-[24px] shadow border bg-white flex items-center justify-between px-3">
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-zinc-200 text-zinc-600"
          aria-label="Fechar notificações"
        >
          <X className="w-8 h-8 text-black bg-[#FAFAFA] rounded-full" />
        </button>

        <span className="text-16 text-black font-small">
          Marcar todas como lidas
        </span>

        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={allRead}
            onChange={handleToggleAllRead}
            aria-checked={allRead}
            aria-label="Ler todas as notificações"
          />

          <div className="w-12 h-6 bg-zinc-300 rounded-full peer-checked:bg-red-600 transition-colors" />
          <div
            className="pointer-events-none absolute left-0.5 top-1/2 -translate-y-1/2
                       w-5 h-5 bg-white rounded-full shadow border transition-transform
                       peer-checked:translate-x-6"
          />
        </label>
      </div>

      <div
        className="mt-2 w-[374px] h-[524px] rounded-[24px] shadow-xl border overflow-hidden
                   bg-[#BABABA]/80 backdrop-blur-[1px]"
        role="dialog"
        aria-label="Notificações"
      >
        <div className="h-full overflow-y-auto p-3">
          {/* Loading */}
          {loading && (
            <ul className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <li
                  key={i}
                  className="bg-white rounded-[17px] shadow-sm border p-3"
                >
                  <div className="h-4 bg-zinc-200 rounded w-3/4" />
                </li>
              ))}
            </ul>
          )}

          {/* Erro */}
          {!loading && error && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm text-red-700 text-center">
                Não foi possível carregar as notificações.
                <br />
                Tente novamente.
              </span>
            </div>
          )}

          {!loading && !error && (
            <>
              {!notifications || notifications.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-sm text-white">
                    Sem notificações no momento
                  </span>
                </div>
              ) : (
                <ul className="space-y-3">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className="bg-white rounded-[17px] shadow-sm border p-3"
                    >
                      <div className="grid items-center grid-cols-[24px_1fr_24px] gap-2">
                        <label className="flex items-center justify-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="appearance-none w-3 h-3 rounded-full border border-zinc-400
                                       checked:bg-red-600 checked:border-red-700 transition"
                            checked={!!n.read}
                            onChange={() => handleToggleOne(n.id)}
                            aria-checked={!!n.read}
                            aria-label={n.read ? "Já lida" : "Marcar como lida"}
                          />
                        </label>

                        <div className="text-center">
                          <p className="text-sm text-zinc-900">
                            {n.title ?? "Sem título"}
                          </p>
                        </div>

                        <div aria-hidden />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Paginação */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={loading || page <= 1}
                  className="px-3 py-1 rounded-md text-sm border bg-white disabled:opacity-50"
                >
                  Anterior
                </button>

                <span className="text-xs text-zinc-700">Página {page}</span>

                <button
                  onClick={handleNext}
                  disabled={loading || !hasNext}
                  className="px-3 py-1 rounded-md text-sm border bg-white disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
