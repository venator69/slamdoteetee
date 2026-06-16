import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { SiteLayout } from "./layouts/SiteLayout";
import { DashboardHubPage } from "./pages/dashboard/DashboardHubPage";
import { DroneMonitoringPage } from "./pages/dashboard/DroneMonitoringPage";
import { RobotMonitoringPage } from "./pages/dashboard/RobotMonitoringPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHubPage />} />
          <Route path="robot" element={<RobotMonitoringPage />} />
          <Route path="drone" element={<DroneMonitoringPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <AppRoutes />
        </GoogleOAuthProvider>
      ) : (
        <AppRoutes />
      )}
    </BrowserRouter>
  );
}
