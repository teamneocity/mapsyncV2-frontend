// src/components/pagination.jsx
import { Button } from "./ui/button";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const canGoPrev = currentPage > 1;
  const canGoNext = totalPages > 0 && currentPage < totalPages;

  const goPrev = () => {
    if (!canGoPrev) return;
    onPageChange(currentPage - 1);
  };

  const goNext = () => {
    if (!canGoNext) return;
    onPageChange(currentPage + 1);
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-gray-500">
        Página {currentPage} {typeof totalPages === "number" ? `de ${totalPages}` : ""}
      </span>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={!canGoPrev}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goNext}
          disabled={!canGoNext}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
