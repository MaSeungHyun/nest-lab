import { getDogs } from "../api/get.ts";
import { Button } from "../components/Button.tsx";
import { useQuery } from "@tanstack/react-query";

export default function GetData() {
  const { data, refetch, isLoading, isError, error } = useQuery({
    queryKey: ["dogs"],
    queryFn: getDogs,
    enabled: false, // 자동으로 실행되지 않도록 설정
  });

  const handleFetchData = () => {
    refetch();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {data && <pre className="text-sm">{`🐶 ${data.message}`}</pre>}
      {error && <div className="text-red-500">{error.message}</div>}
      <Button
        onClick={handleFetchData}
        disabled={isLoading}
        className={error ? "border-red-500" : ""}
      >
        {isLoading ? "Loading..." : "Fetch"}
      </Button>
    </div>
  );
}
