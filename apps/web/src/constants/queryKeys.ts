/**
 * React Query QueryKey 관리
 * 계층적 구조로 설계하여 부분적 무효화(invalidation)를 쉽게 할 수 있습니다.
 */

// ============================================
// Room Keys (채팅방)
// ============================================
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

// ============================================
// User Keys (사용자)
// ============================================
export const userKeys = {
  // 모든 user 관련 쿼리를 무효화할 때 사용
  all: ["user"] as const,

  // 현재 로그인한 유저 (me)
  me: () => [...userKeys.all, "me"] as const,

  // 유저 프로필
  profiles: () => [...userKeys.all, "profile"] as const,
  profile: (userId: string) => [...userKeys.profiles(), userId] as const,

  // 유저 목록 (필요시)
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    filters ? ([...userKeys.lists(), filters] as const) : userKeys.lists(),
};

/**
 * 사용 예시:
 *
 * [Rooms]
 * 1. 모든 rooms 관련 쿼리 무효화
 *    queryClient.invalidateQueries({ queryKey: roomKeys.all })
 *
 * 2. 채팅방 목록만 무효화
 *    queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
 *
 * 3. 특정 채팅방 상세만 무효화
 *    queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) })
 *
 * [Users]
 * 1. 현재 로그인한 유저 정보 조회
 *    useQuery({ queryKey: userKeys.me() })
 *
 * 2. 로그아웃 시 유저 정보 무효화
 *    queryClient.invalidateQueries({ queryKey: userKeys.all })
 *    또는
 *    queryClient.removeQueries({ queryKey: userKeys.all })
 *
 * 3. 특정 유저 프로필 조회
 *    useQuery({ queryKey: userKeys.profile(userId) })
 */
