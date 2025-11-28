import React, { useCallback, useEffect, useState } from "react";
import Input from "../../components/Input";
import { Button } from "../../components/Button";
import useSignUpMutation from "../../hooks/useSignUpMutation";
import { cn } from "../../utils/style";

import Icon from "../../components/Icon";
import { useNavigate } from "react-router-dom";
import { SignUpResponseDto } from "../../../../../types/common/auth.dto";
import { alert } from "../../utils/alert";

export default function SignUp() {
  const [form, setForm] = useState({
    id: "",
    password: "",
    confirmPassword: "",
  });
  const [visible, setVisible] = useState({
    password: false,
    confirmPassword: false,
  });

  const [error, setError] = useState("");
  const { signUpMutation, isPending } = useSignUpMutation();
  const navigate = useNavigate();

  const handleSignUp = useCallback(() => {
    setError("");
    if (!form.id || !form.password || !form.confirmPassword) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    signUpMutation(
      {
        id: form.id,
        password: form.password,
        passwordConfirm: form.confirmPassword,
      },
      {
        onError: (error) => {
          alert.error("회원가입 실패", error.message);
        },
        onSuccess: (data) => {
          if ((data as SignUpResponseDto)?.success) {
            // 회원가입 성공 시 로그인 페이지로 이동
            alert.success("회원가입 성공", "회원가입 성공하였습니다.");
            navigate("/login");
          } else {
            // 회원가입 실패
            setError((data as SignUpResponseDto)?.message);
          }
        },
      }
    );
  }, [form, signUpMutation, navigate]);

  const handleChangeFormData = (key: string, value: string) => {
    setError("");
    setForm({ ...form, [key]: value });
  };

  useEffect(() => {
    const registerKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSignUp();
      }
    };
    window.addEventListener("keydown", registerKeyPress);
    return () => {
      window.removeEventListener("keydown", registerKeyPress);
    };
  }, [handleSignUp]);

  return (
    <div className="flex-1 items-center justify-center flex flex-col">
      {/* <h1 className="text-2xl font-bold mb-5">Sign Up</h1> */}
      <div className="flex flex-col gap-5 w-6/12 min-w-[300px] max-w-3/12">
        <Input
          placeholder={"ID"}
          onChange={(e) => handleChangeFormData("id", e.target.value)}
          value={form.id}
        />
        <div className="relative">
          <Input
            placeholder={"Password"}
            className={"w-full"}
            type={visible.password ? "text" : "password"}
            onChange={(e) => handleChangeFormData("password", e.target.value)}
            value={form.password}
          />
          <Icon
            icon={visible.password ? "EyeOff" : "Eye"}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() =>
              setVisible({
                ...visible,
                password: !visible.password ? true : false,
              })
            }
          />
        </div>
        <div className="relative">
          <Input
            placeholder={"Confirm Password"}
            className={"w-full"}
            type={visible.confirmPassword ? "text" : "password"}
            onChange={(e) =>
              handleChangeFormData("confirmPassword", e.target.value)
            }
            value={form.confirmPassword}
          />
          <Icon
            icon={visible.confirmPassword ? "EyeOff" : "Eye"}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() =>
              setVisible({
                ...visible,
                confirmPassword: !visible.confirmPassword ? true : false,
              })
            }
          />
        </div>
        <p
          className={cn(
            "text-red-400 text-sm ",
            error ? "opcaity-100" : "opacity-0"
          )}
        >
          {error ? error : "."}
        </p>
        <Button className="w-full" onClick={handleSignUp} disabled={isPending}>
          {isPending ? "회원가입 중..." : "Sign Up"}
        </Button>
      </div>

      <div className="absolute bottom-0 right-0 w-full flex justify-end px-2 py-1">
        <span className="text-sm text-gray-400">Grapicar v1.3.4</span>
      </div>
    </div>
  );
}
