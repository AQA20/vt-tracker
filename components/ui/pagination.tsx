import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  // Always show pagination, even if only one page
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="cursor-pointer h-9 px-3"
        >
          <span className="sm:hidden cursor-pointer"><ChevronLeft className="h-4 w-4" /></span>
          <span className="hidden sm:inline cursor-pointer">Previous</span>
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            if (
              p === 1 ||
              p === totalPages ||
              (p >= page - 1 && p <= page + 1)
            ) {
              return (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(p)}
                  className="h-9 w-9 p-0 cursor-pointer"
                >
                  {p}
                </Button>
              );
            }
            if (p === page - 2 || p === page + 2) {
              return (
                <span key={p} className="px-1 text-muted-foreground">
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="cursor-pointer h-9 px-3"
        >
          <span className="sm:hidden cursor-pointer"><ChevronRight className="h-4 w-4" /></span>
          <span className="hidden sm:inline cursor-pointer">Next</span>
        </Button>
      </div>
      <div className="text-sm text-muted-foreground font-medium">
        Page {page} of {totalPages}
      </div>
    </div>
  );
}
