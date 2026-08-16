import { type SelectHTMLAttributes, forwardRef } from 'react'
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
          <label htmlFor={selectId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          name={name}
          className={cn(
            'focus:border-brand-navy focus:ring-brand-navy rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  },
)
Select.displayName = 'Select'
