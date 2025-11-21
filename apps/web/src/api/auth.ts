export const login = async (id: string, password: string) => {
  const res = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, password }),
  });

  if (!res.ok) {
    throw new Error("로그인 요청 실패");
  }

  return res.json();
};
