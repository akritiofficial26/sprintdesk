import { useAuthStore } from "./store/authStore";
import { useSessionInit } from "./features/auth/useSessionInit";
import { FullScreenLoader } from "./components/ui/FullScreenLoader";
import { AppRouter } from "./routes/AppRouter";

function App() {
  useSessionInit();
  const isInitializing = useAuthStore((s) => s.isInitializing);

  if (isInitializing) {
    return <FullScreenLoader label="Validating your session..." />;
  }

  return <AppRouter />;
}

export default App;
