import { useQuery } from '@tanstack/react-query'
import { getCourses } from '@/api/endpoints/auth'

export function useCoursesQuery() {
  return useQuery({ queryKey: ['courses'], queryFn: getCourses, staleTime: 5 * 60_000 })
}
