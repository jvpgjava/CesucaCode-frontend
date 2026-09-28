import { useAuth } from '@/features/auth/useAuth'
import { useCoursesQuery } from '@/shared/hooks/useCourses'

/**
 * Cursos que o usuário não pode marcar/desmarcar num material: pro
 * coordenador, os que ele não coordena (o admin não tem restrição). É só
 * conveniência de UI — quem garante a regra é o backend.
 */
export function useLockedCourseCodes(): string[] {
  const { user } = useAuth()
  const { data: courses } = useCoursesQuery()
  if (user?.role !== 'cs_coordinator') return []
  const coordinated = new Set(user.coordinated_courses.map((course) => course.code))
  return (courses?.results ?? []).filter((c) => !coordinated.has(c.code)).map((c) => c.code)
}
