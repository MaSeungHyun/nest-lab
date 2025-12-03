import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { AlertProvider } from "./context/AlertProvider";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { ProgressProvider } from "./context/ProgressProvider";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import TitleBar from "./components/TitleBar";
import { isElectron } from "./utils/environment";

interface ProvidersProps {
  children: React.ReactNode;
}

function ElectronRouterListener() {
  const navigate = useNavigate();

  useEffect(() => {
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
export default function Providers({ children }: ProvidersProps) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <BrowserRouter>
          <ProgressProvider />
          <Toaster />
          <ElectronRouterListener />
          {isElectron() && <TitleBar />}
          {children}
        </BrowserRouter>
      </AlertProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
