import { type InputHTMLAttributes, forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, name, type, ...props }, ref) => {
    const inputId = id ?? name
    const isPassword = type === 'password'
    const [visible, setVisible] = useState(false)

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={isPassword && visible ? 'text' : type}
            className={cn(
              'focus:border-brand-navy focus:ring-brand-navy w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-1',
              isPassword && 'pr-9',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((prev) => !prev)}
              tabIndex={-1}
              title={visible ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  },
)
Input.displayName = 'Input'
