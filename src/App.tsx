import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import PageTransition from "@/components/layout/PageTransition";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PricingPage from "./pages/PricingPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import ResumeAnalysisPage from "./pages/ResumeAnalysisPage";
import RoadmapPage from "./pages/RoadmapPage";
import ProgressPage from "./pages/ProgressPage";
import InterviewPage from "./pages/InterviewPage";
import SupportPage from "./pages/SupportPage";
import SettingsPage from "./pages/SettingsPage";
import OnboardingPage from "./pages/OnboardingPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <PageTransition><OnboardingPage /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PageTransition><DashboardHome /></PageTransition>} />
          <Route path="resume" element={<PageTransition><ResumeAnalysisPage /></PageTransition>} />
          <Route path="roadmap" element={<PageTransition><RoadmapPage /></PageTransition>} />
          <Route path="progress" element={<PageTransition><ProgressPage /></PageTransition>} />
          <Route path="interview" element={<PageTransition><InterviewPage /></PageTransition>} />
          <Route path="support" element={<PageTransition><SupportPage /></PageTransition>} />
          <Route path="settings" element={<PageTransition><SettingsPage /></PageTransition>} />
        </Route>
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AnimatedRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
