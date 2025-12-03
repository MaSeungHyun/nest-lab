import { useCallback, useEffect, useState } from "react";
import { Button } from "../../components/Button";
import useSignUpMutation from "../../hooks/useSignUpMutation";
import { cn } from "../../utils/style";
import Icon from "../../components/Icon";
import { useNavigate } from "react-router-dom";
import { alert } from "../../utils/alert";
import InputWithLabel from "./_components/InputWithLabel";
import { SignUpResponseDto } from "../../../../types/common/auth.dto";
import Checkbox from "../../components/Checkbox";

export default function SignUp() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    companyId: "",
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

    if (
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.name ||
      !form.companyId
    ) {
      setError("모든 필드를 입력해주세요.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    signUpMutation(
      {
        email: form.email,
        name: form.name,
        companyId: form.companyId,
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
      <div
        className="absolute left-2 top-2 group hover:bg-gray-700 p-1 rounded-md cursor-pointer"
        onClick={() => navigate("/login")}
      >
        <Icon
          icon="ArrowLeft"
          size={20}
          className="text-gray-300 group-hover:text-white"
        />
      </div>
      <div className="flex flex-col gap-3 w-6/12 min-w-[300px] max-w-4/12">
        <InputWithLabel
          label="Company ID"
          name="companyId"
          onChange={(e) => handleChangeFormData("companyId", e.target.value)}
          value={form.companyId}
        />

        <InputWithLabel
          label="Email Address"
          name="email"
          autoFocus
          onChange={(e) => handleChangeFormData("email", e.target.value)}
          value={form.email}
        />
        <InputWithLabel
          label="Password"
          name="password"
          type={visible.password ? "text" : "password"}
          onChange={(e) => handleChangeFormData("password", e.target.value)}
          value={form.password}
        >
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
        </InputWithLabel>
        <InputWithLabel
          label="Confirm Password"
          name="confirmPassword"
          type={visible.confirmPassword ? "text" : "password"}
          onChange={(e) =>
            handleChangeFormData("confirmPassword", e.target.value)
          }
          value={form.confirmPassword}
        >
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
        </InputWithLabel>
        <InputWithLabel
          label="Name"
          name="name"
          onChange={(e) => handleChangeFormData("name", e.target.value)}
          value={form.name}
        />
        <p
          className={cn(
            "text-red-400 text-sm ",
            error ? "opcaity-100" : "opacity-0"
          )}
        >
          {error ? error : "."}
        </p>
        <Button
          className="w-full mt-6"
          onClick={handleSignUp}
          disabled={isPending}
        >
          {isPending ? "회원가입 중..." : "Sign Up"}
        </Button>
      </div>

      <div className="absolute bottom-0 right-0 w-full flex justify-end px-2 py-1">
        <span className="text-sm text-gray-400">Grapicar v1.3.4</span>
      </div>
    </div>
  );
}
