import React, { useCallback, useEffect, useState } from "react";
import Input from "../components/Input";
import { Button } from "../components/Button";
import useLoginMutation from "../hooks/useLoginMutation";
import { cn } from "../utils/style";
import logo from "../assets/logo.png";
import Icon from "../components/Icon";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    id: "",
    password: "",
  });
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const { loginMutation, isPending } = useLoginMutation();
  const navigate = useNavigate();

  const handleLogin = useCallback(() => {
    setError("");
    if (!form.id || !form.password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    loginMutation(
      { id: form.id, password: form.password },
      {
        onError: (error) => {
          setError(error.message);
        },
        onSuccess: (data) => {
          if (data.success) {
            // 서버에서 받은 redirectUrl로 이동
            navigate(data.redirectUrl);
          } else {
            // 로그인 실패
            setError(data.message);
          }
        },
      }
    );
  }, [form, loginMutation, navigate]);

  const handleChangeFormData = (key: string, value: string) => {
    setError("");
    setForm({ ...form, [key]: value });
  };

  useEffect(() => {
    const registerKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleLogin();
      }
    };
    window.addEventListener("keydown", registerKeyPress);
    return () => {
      window.removeEventListener("keydown", registerKeyPress);
    };
  }, [handleLogin]);

  return (
    <>
      <img
        src={logo}
        alt="logo"
        className="w-1/6 brightness-180 mb-5 min-w-[220px]"
      />
      <div className="flex flex-col gap-2 w-3/12 min-w-[300px]">
        <Input
          placeholder={"ID"}
          onChange={(e) => handleChangeFormData("id", e.target.value)}
          value={form.id}
          className="mb-2"
        />
        <div className="relative">
          <Input
            placeholder={"Password"}
            className={"w-full"}
            type={visible ? "text" : "password"}
            onChange={(e) => handleChangeFormData("password", e.target.value)}
            value={form.password}
          />
          <Icon
            icon={visible ? "EyeOff" : "Eye"}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setVisible(!visible)}
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
        <Button
          className="mt-5 w-full"
          onClick={handleLogin}
          disabled={isPending}
        >
          {isPending ? "로그인 중..." : "Login"}
        </Button>
      </div>
    </>
  );
}

export default Login;
