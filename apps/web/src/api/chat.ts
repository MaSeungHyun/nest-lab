export const create = async (roomName: string) => {
  const res = await fetch("http://localhost:3000/rooms/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: roomName }),
  });

  if (!res.ok) {
    throw new Error("채팅방 생성 요청 실패");
  }

  return res.json();
};

export const deleteRoom = async (roomId: string) => {
  const res = await fetch(`http://localhost:3000/rooms/${roomId}`, {
    method: "DELETE",
  });

  return res.json();
};

export const getRooms = async () => {
  const res = await fetch("http://localhost:3000/rooms", {
    method: "GET",
  });

  console.log(res);

  if (!res.ok) {
    throw new Error("채팅방 조회 요청 실패");
  }

  return res.json();
};
