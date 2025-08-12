// src/components/pagination.jsx
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export function Pagination({ onPageChange, hasNextPage }) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    onPageChange(currentPage);
  }, [currentPage, onPageChange]);

  const goPrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goNext = () => {
    if (!hasNextPage) return;          
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-gray-500">Página {currentPage}</span>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goNext}
          disabled={!hasNextPage}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
