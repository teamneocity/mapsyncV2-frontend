// src/components/pagination.jsx
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const [inputPage, setInputPage] = useState(currentPage || 1);

  const canGoPrev = currentPage > 1;
  const canGoNext = totalPages > 0 && currentPage < totalPages;

  useEffect(() => {
    setInputPage(currentPage || 1);
  }, [currentPage]);

  const goPrev = () => {
    if (!canGoPrev) return;
    onPageChange(currentPage - 1);
  };

  const goNext = () => {
    if (!canGoNext) return;
    onPageChange(currentPage + 1);
  };

  const goFirst = () => {
    if (!canGoPrev) return;
    onPageChange(1);
  };

  const goLast = () => {
    if (!canGoNext) return;
    onPageChange(totalPages);
  };

  const handleGoToPage = () => {
    if (!totalPages || totalPages <= 0) return;

    let pageNumber = parseInt(inputPage, 10);

    if (isNaN(pageNumber)) return;

    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;

    if (pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      handleGoToPage();
    }
  };

  return (
    <div className="flex items-center justify-between mt-4">
      {/* info / input / primeira/última */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          Página {currentPage}{" "}
          {typeof totalPages === "number" ? `de ${totalPages}` : ""}
        </span>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={totalPages || 1}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToPage}
            disabled={!totalPages || totalPages <= 0}
          >
            Ir
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goFirst}
            disabled={!canGoPrev}
          >
            Primeira
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goLast}
            disabled={!canGoNext}
          >
            Última
          </Button>
        </div>
      </div>

      {/* anterior / próxima */}
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
