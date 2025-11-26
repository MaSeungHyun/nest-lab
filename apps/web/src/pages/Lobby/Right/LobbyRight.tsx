import React from "react";
import useGetRoomsQuery from "../../../hooks/useGetRoomsQuery";
import Room from "./_components/Room";

export default function LobbyRight() {
  const { data: rooms, isLoading, error } = useGetRoomsQuery();

  return (
    <div className="flex-8 bg-zinc-900">
      <div className="flex-wrap gap-4 p-4 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1">
        {isLoading ? (
          <div>로딩 중...</div>
        ) : error ? (
          <div>에러가 발생했습니다: {error.message}</div>
        ) : rooms?.rooms && rooms.rooms.length > 0 ? (
          rooms.rooms
            .sort(
              (a: { createdAt: string }, b: { createdAt: string }) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .map((room: { uuid: string; name: string; createdAt: string }) => (
              <Room key={room.uuid} room={room} />
            ))
        ) : (
          <div>방이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
