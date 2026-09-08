import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

export function Pagination({
  page,
  count,
  hasNext,
  hasPrevious,
  onPageChange,
}: {
  page: number
  count: number
  hasNext: boolean
  hasPrevious: boolean
  onPageChange: (page: number) => void
}) {
  if (!hasNext && !hasPrevious && page === 1) return null

  return (
    <div className="flex items-center justify-between text-neutral-500 text-sm">
      <span>{count === 1 ? '1 resultado' : `${count} resultados`}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevious}
          className="px-3 py-1.5"
        >
          <ChevronLeft size={14} />
          Anterior
        </Button>
        <span className="px-1 font-medium text-neutral-700">Página {page}</span>
        <Button
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="px-3 py-1.5"
        >
          Próxima
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}
