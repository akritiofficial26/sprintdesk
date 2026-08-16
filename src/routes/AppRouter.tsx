import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { FullScreenLoader } from "../components/ui/FullScreenLoader";
import { useAuthStore } from "../store/authStore";

const LoginPage = lazy(() => import("../features/auth/LoginPage"));
const DashboardPage = lazy(() => import("../features/dashboard/DashboardPage"));
const BoardPage = lazy(() => import("../features/board/BoardPage"));
const AnalyticsPage = lazy(() => import("../features/analytics/AnalyticsPage"));

export function AppRouter() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Suspense
      fallback={<FullScreenLoader variant={isAuthenticated ? "app" : "auth"} />}
    >
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
