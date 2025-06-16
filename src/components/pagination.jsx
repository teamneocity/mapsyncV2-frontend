import { Button } from "./ui/button";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-between ">
      <span className="text-sm text-gray-500">
        Página {currentPage} de {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
          Próxima
        </Button>
      </div>
    </div>
  );
}
