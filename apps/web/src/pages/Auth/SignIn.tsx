import { useCallback, useEffect, useState } from "react";
import Input from "../../components/Input";

import { cn } from "../../utils/style";
import logo from "../../assets/logo.png";
import Icon from "../../components/Icon";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import useSignInMutation from "../../hooks/useSignInMutation";

export default function SignIn() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: "",
    password: "",
  });
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const { signInMutation, isPending } = useSignInMutation();

  const handleLogin = useCallback(() => {
    setError("");
    if (!form.id || !form.password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    signInMutation(
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
  }, [form, signInMutation, navigate]);

  const handleChangeFormData = (key: string, value: string) => {
    setError("");
    setForm({ ...form, [key]: value });
  };

  const handleClickRouteToSignUp = () => {
    navigate("/signup");
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

  useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.send("window-set-login-window-size");
    }
  }, []);

  return (
    <div className="flex-1 items-center justify-center flex flex-col">
      <img
        src={logo}
        alt="logo"
        className="w-1/6 brightness-180 mb-5 min-w-[220px]"
      />
      <div className="flex flex-col gap-2 w-6/12 min-w-[300px] max-w-3/12">
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
        <div className="flex justify-center gap-12 mt-10">
          <span
            className="text-sm  hover:cursor-pointer text-cyan-700 hover:text-cyan-400"
            onClick={handleClickRouteToSignUp}
          >
            Sign Up
          </span>
          <span className="text-sm hover:cursor-pointer text-cyan-700 hover:text-cyan-400">
            Forgot Password?
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-full flex justify-end px-2 py-1">
        <span className="text-sm text-gray-400">Grapicar v1.3.4</span>
      </div>
    </div>
  );
}
