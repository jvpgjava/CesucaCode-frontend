import type { Course } from '@/api/types/auth'
import { cn } from '@/shared/lib/cn'

interface CourseCheckboxGroupProps {
  label?: string
  courses: Course[]
  /** Códigos (`code`) dos cursos marcados. */
  value: string[]
  onChange: (value: string[]) => void
  /** Cursos que aparecem mas não podem ser alterados (ex.: que o coordenador não coordena). */
  lockedCodes?: string[]
  error?: string
}

export function CourseCheckboxGroup({
  label,
  courses,
  value,
  onChange,
  lockedCodes = [],
  error,
}: CourseCheckboxGroupProps) {
  const toggle = (code: string) => {
    onChange(value.includes(code) ? value.filter((c) => c !== code) : [...value, code])
  }

  return (
    <fieldset className="flex flex-col gap-1">
      {label && <legend className="mb-1 font-medium text-neutral-700 text-sm">{label}</legend>}
      <div className="flex flex-col gap-2 rounded-lg border border-neutral-300 p-3">
        {courses.map((course) => {
          const locked = lockedCodes.includes(course.code)
          return (
            <label
              key={course.id}
              className={cn(
                'flex items-center gap-2 text-neutral-800 text-sm',
                locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
              )}
            >
              <input
                type="checkbox"
                checked={value.includes(course.code)}
                disabled={locked}
                onChange={() => toggle(course.code)}
                className="h-4 w-4 accent-brand-navy"
              />
              {course.name}
            </label>
          )
        })}
      </div>
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </fieldset>
  )
}
