import { create } from "zustand";

export interface User {
  uuid: string;
  id: string;
}

// 빈 배열 상수 (참조 안정화)
const EMPTY_USER_ARRAY: User[] = [];

interface UserState {
  // roomId별로 사용자 목록 관리: { [roomId: string]: User[] }
  usersByRoom: Record<string, User[]>;
  // 특정 방의 사용자 목록 가져오기
  getUsersByRoomId: (roomId: string) => User[];
  // 특정 방에 사용자 추가
  joinUser: (roomId: string, user: User) => void;
  // 특정 방에서 사용자 제거
  leaveUser: (roomId: string, identifier: string) => void;
  // 특정 방의 모든 사용자 제거 (방 변경 시 정리용)
  clearRoomUsers: (roomId: string) => void;
  // 특정 방에 여러 사용자 한 번에 추가 (초기 접속자 목록용)
  setRoomUsers: (roomId: string, users: User[]) => void;
}

const useUserStore = create<UserState>((set, get) => ({
  usersByRoom: {},
  getUsersByRoomId: (roomId: string) => {
    return get().usersByRoom[roomId] || EMPTY_USER_ARRAY;
  },
  joinUser: (roomId: string, user: User) =>
    set((state) => {
      const roomUsers = state.usersByRoom[roomId] || [];
      // 이미 존재하는 사용자인지 확인 (중복 방지)
      const exists = roomUsers.some(
        (u) => u.uuid === user.uuid || u.id === user.id
      );
      if (exists) {
        console.log(
          `[UserStore] User already exists in room ${roomId}: ${user.id} (${user.uuid})`
        );
        return state;
      }
      console.log(
        `[UserStore] User joined room ${roomId}: ${user.id} (${user.uuid})`
      );
      return {
        usersByRoom: {
          ...state.usersByRoom,
          [roomId]: [...roomUsers, user],
        },
      };
    }),
  leaveUser: (roomId: string, identifier: string) =>
    set((state) => {
      const roomUsers = state.usersByRoom[roomId] || [];
      console.log(`[UserStore] User leaving room ${roomId}: ${identifier}`);
      return {
        usersByRoom: {
          ...state.usersByRoom,
          [roomId]: roomUsers.filter(
            (user) => user.uuid !== identifier && user.id !== identifier
          ),
        },
      };
    }),
  clearRoomUsers: (roomId: string) =>
    set((state) => {
      console.log(`[UserStore] Clearing all users from room ${roomId}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [roomId]: _, ...rest } = state.usersByRoom;
      return { usersByRoom: rest };
    }),
  setRoomUsers: (roomId: string, users: User[]) =>
    set((state) => {
      console.log(
        `[UserStore] Setting ${users.length} users for room ${roomId}`
      );
      return {
        usersByRoom: {
          ...state.usersByRoom,
          [roomId]: users,
        },
      };
    }),
}));

export default useUserStore;
