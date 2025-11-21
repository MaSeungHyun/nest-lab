import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";

export default function useLoginMutation() {
  const { mutate, ...rest } = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      login(id, password),
  });

  return { loginMutation: mutate, ...rest };
}
