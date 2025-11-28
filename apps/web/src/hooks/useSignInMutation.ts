import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signin } from "../api/auth";
import { userKeys } from "../constants/queryKeys";

export default function useSignInMutation() {
  const queryClient = useQueryClient();

  const { mutate, ...rest } = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      signin(id, password),
    onSuccess: (data) => {
      // 로그인 성공 시 유저 정보를 캐시에 저장
      if (data.success && data.user) {
        // userKeys.me() 캐시에 유저 정보 설정
        queryClient.setQueryData(userKeys.me(), data.user);

        // localStorage에도 저장 (선택사항)
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    },
  });

  return { signInMutation: mutate, ...rest };
}
