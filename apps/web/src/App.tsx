import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GetData from "./pages/GetData";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4">
        <GetData />
      </div>
    </QueryClientProvider>
  );
}

export default App;
