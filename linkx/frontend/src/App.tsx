import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LandingPage } from "@/pages/Landing";
import { LoginPage } from "@/pages/Login";
import { RegisterPage } from "@/pages/Register";
import { DashboardPage } from "@/pages/Dashboard";
import { UrlsPage } from "@/pages/UrlsPage";
import { UrlAnalyticsPage } from "@/pages/UrlAnalytics";
import { NotFoundPage } from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/urls"
            element={
              <ProtectedRoute>
                <UrlsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/urls/:id"
            element={
              <ProtectedRoute>
                <UrlAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/:id"
            element={
              <ProtectedRoute>
                <UrlAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
