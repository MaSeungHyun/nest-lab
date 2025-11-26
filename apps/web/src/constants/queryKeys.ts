/**
 * React Query QueryKey 관리
 * 계층적 구조로 설계하여 부분적 무효화(invalidation)를 쉽게 할 수 있습니다.
 */

export const roomKeys = {
  // 모든 rooms 관련 쿼리를 무효화할 때 사용
  all: ["rooms"] as const,

  // 채팅방 목록 관련
  lists: () => [...roomKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    filters ? ([...roomKeys.lists(), filters] as const) : roomKeys.lists(),

  // 특정 채팅방 상세 관련
  details: () => [...roomKeys.all, "detail"] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
};

/**
 * 사용 예시:
 *
 * 1. 모든 rooms 관련 쿼리 무효화
 *    queryClient.invalidateQueries({ queryKey: roomKeys.all })
 *
 * 2. 채팅방 목록만 무효화
 *    queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
 *
 * 3. 특정 채팅방 상세만 무효화
 *    queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) })
 */
