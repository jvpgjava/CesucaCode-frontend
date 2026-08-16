import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, name, children, ...props }, ref) => {
    const selectId = id ?? name
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="font-medium text-neutral-700 text-sm">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          name={name}
          className={cn(
            'rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-red-600 text-xs">{error}</span>}
      </div>
    )
  },
)
Select.displayName = 'Select'
