export const signin = async (id: string, password: string) => {
  const res = await fetch(
    `${process.env.GRAPICAR_SERVER_API_URL}/auth/signin`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, password }),
    }
  );

  console.log(res);
  if (!res.ok) {
    throw new Error("로그인 요청 실패");
  }

  return res.json();
};

export const signup = async (id: string, password: string) => {
  const res = await fetch(
    `${process.env.GRAPICAR_SERVER_API_URL}/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, password }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "회원가입 요청 실패");
  }

  return res.json();
};
