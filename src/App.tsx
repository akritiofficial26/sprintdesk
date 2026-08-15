import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, refreshTokenStorage } from "./store/authStore";
import { useSessionInit } from "./features/auth/useSessionInit";
import { fetchBoardTasks } from "./features/board/boardApi";
import { FullScreenLoader } from "./components/ui/FullScreenLoader";
import { ToastContainer } from "./components/ui/Toast";
import { AppRouter } from "./routes/AppRouter";


function useWarmBoardCache() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!refreshTokenStorage.get()) return;
    queryClient.prefetchQuery({
      queryKey: ["board-tasks"],
      queryFn: fetchBoardTasks,
      staleTime: Infinity,
    });
  }, [queryClient]);
}

function App() {
  useSessionInit();
  useWarmBoardCache();
  const isInitializing = useAuthStore((s) => s.isInitializing);

  if (isInitializing) {
    return <FullScreenLoader label="Validating your session..." />;
  }

  return (
    <>
      <AppRouter />
      <ToastContainer />
    </>
  );
}

export default App;
