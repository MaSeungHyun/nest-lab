import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleClickGoHome = () => {
    navigate("/");
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">대시보드</h1>
      <p className="text-gray-300">로그인에 성공하셨습니다!</p>
      <Button className="mt-5 w-full" onClick={handleClickGoHome}>
        Go Home
      </Button>
    </div>
  );
}
