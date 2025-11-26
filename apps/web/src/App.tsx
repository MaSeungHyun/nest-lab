import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TitleBar from "./components/TitleBar";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import Dashboard from "./pages/Lobby";
import ChatRoom from "./pages/ChatRoom";
import { AlertProvider } from "./context/AlertProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <BrowserRouter>
          <div className="max-h-screen max-w-screen min-h-screen min-w-screen h-screen w-screen flex flex-col overflow-auto">
            <TitleBar />
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* 채팅방 페이지 - 경로 파라미터 사용 */}
              <Route path="/chat/:roomId" element={<ChatRoom />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AlertProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
