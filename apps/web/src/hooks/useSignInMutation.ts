import { useMutation } from "@tanstack/react-query";
import { signin } from "../api/auth";

export default function useSignInMutation() {
  const { mutate, ...rest } = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      signin(id, password),
  });

  return { signInMutation: mutate, ...rest };
}
