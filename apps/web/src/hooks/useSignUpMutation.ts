import { useMutation } from "@tanstack/react-query";
import { signup } from "../api/auth";

export default function useSignUpMutation() {
  const { mutate, ...rest } = useMutation({
    mutationFn: ({
      id,
      password,
    }: {
      id: string;
      password: string;
      passwordConfirm: string;
    }) => signup(id, password),
  });

  return { signUpMutation: mutate, ...rest };
}
