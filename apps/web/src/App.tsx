import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import TitleBar from "./components/TitleBar";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import Dashboard from "./pages/Lobby";
import ChatRoom from "./pages/ChatRoom";
import { AlertProvider } from "./context/AlertProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Preview from "./pages/Preview/Preview";

const queryClient = new QueryClient();

// Electron 라우팅 리스너 컴포넌트
function ElectronRouterListener() {
  const navigate = useNavigate();

  useEffect(() => {
    // Electron에서 라우트 변경 요청 받기
    if (window.electronAPI) {
      window.electronAPI.onNavigate((route: string) => {
        console.log("[App] Electron navigate request:", route);
        navigate(route);
      });
    }

    return () => {
      // 정리
      if (window.electronAPI) {
        window.electronAPI.offNavigate();
      }
    };
  }, [navigate]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <BrowserRouter>
          <ElectronRouterListener />
          <div className="max-h-screen max-w-screen min-h-screen min-w-screen h-screen w-screen flex flex-col overflow-hidden">
            <TitleBar />
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* 채팅방 페이지 - 경로 파라미터 사용 */}
              <Route path="/chat/:roomId" element={<ChatRoom />} />
              <Route path="/preview" element={<Preview />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AlertProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
