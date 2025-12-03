import { Routes, Route, Navigate } from "react-router-dom";

import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import Dashboard from "./pages/Dashboard";

import Preview from "./pages/Preview/Preview";
import Editor from "./pages/Editor/index";
import { ContextProvider } from "./context/ContextProvider";
import Providers from "./Providers";

function App() {
  return (
    <main className="max-h-screen max-w-screen min-h-screen min-w-screen h-screen w-screen flex flex-col overflow-hidden bg-black-900">
      <Providers>
        <div className="relative flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* 채팅방 페이지 - 경로 파라미터 사용 */}
            <Route path="/preview" element={<Preview />} />
            <Route
              path="/editor"
              element={
                <ContextProvider>
                  <Editor />
                </ContextProvider>
              }
            />
          </Routes>
        </div>
      </Providers>
    </main>
  );
}

export default App;
