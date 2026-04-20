/**
 * TanStack Query key factory for posts. Use with `useQuery` / `invalidateQueries`.
 */
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (statusFilter: string) => [...postKeys.lists(), statusFilter] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};
