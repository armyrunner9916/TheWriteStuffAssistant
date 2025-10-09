import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/hooks/useAuth";
import { HelmetProvider } from "react-helmet-async";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";

import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import PasswordResetForm from "@/components/PasswordResetForm";
import Dashboard from "@/pages/Dashboard";
import UnifiedHistory from "@/pages/UnifiedHistory";

import Prose from "@/pages/Prose";
import Poetry from "@/pages/Poetry";
import Nonfiction from "@/pages/Nonfiction";
import OnlineContent from "@/pages/OnlineContent";
import Songwriting from "@/pages/Songwriting";
import StageScreen from "@/pages/StageScreen";

// Demo pages
import DemoDashboard from "@/pages/demo/DemoDashboard";
import DemoProse from "@/pages/demo/DemoProse";
import DemoPoetry from "@/pages/demo/DemoPoetry";
import DemoNonfiction from "@/pages/demo/DemoNonfiction";
import DemoOnlineContent from "@/pages/demo/DemoOnlineContent";
import DemoSongwriting from "@/pages/demo/DemoSongwriting";
import DemoStageScreen from "@/pages/demo/DemoStageScreen";

const ProtectedRoute = ({ element: Element, ...rest }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  return <Element {...rest} />;
};

const PublicRoute = ({ element: Element, ...rest }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated && Element !== SignIn) {
    return <Navigate to="/dashboard" />;
  }
  return <Element {...rest} />;
};

const AppContent = () => {
  const { signOut: authSignOut } = useAuth();

  const handleSignOut = async () => {
    await authSignOut();
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PublicRoute element={SignIn} />} />
        <Route path="/signup" element={<PublicRoute element={SignUp} />} />
        <Route path="/signin" element={<Navigate to="/" />} />
        <Route path="/password-reset" element={<PasswordResetForm />} />
        <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
        <Route path="/prose" element={<ProtectedRoute element={Prose} />} />
        <Route path="/poetry" element={<ProtectedRoute element={Poetry} />} />
        <Route path="/nonfiction" element={<ProtectedRoute element={Nonfiction} />} />
        <Route path="/online-content" element={<ProtectedRoute element={OnlineContent} />} />
        <Route path="/songwriting" element={<ProtectedRoute element={Songwriting} />} />
        <Route path="/stage-screen" element={<ProtectedRoute element={StageScreen} />} />
        <Route path="/:section/history" element={<ProtectedRoute element={UnifiedHistory} />} />
        
        {/* Demo routes - no authentication required */}
        <Route path="/demo" element={<DemoDashboard />} />
        <Route path="/demo/prose" element={<DemoProse />} />
        <Route path="/demo/poetry" element={<DemoPoetry />} />
        <Route path="/demo/nonfiction" element={<DemoNonfiction />} />
        <Route path="/demo/online-content" element={<DemoOnlineContent />} />
        <Route path="/demo/songwriting" element={<DemoSongwriting />} />
        <Route path="/demo/stage-screen" element={<DemoStageScreen />} />
        
        {/* Legacy redirects */}
        <Route path="/world-building" element={<Navigate to="/prose" />} />
        <Route path="/character-development" element={<Navigate to="/prose" />} />
        <Route path="/style-enhancement" element={<Navigate to="/prose" />} />
        <Route path="/story-outline" element={<Navigate to="/prose" />} />
        <Route path="/poetry-form-structure" element={<Navigate to="/poetry" />} />
        <Route path="/poetry-language-imagery" element={<Navigate to="/poetry" />} />
        <Route path="/poetry-rhyme-rhythm" element={<Navigate to="/poetry" />} />
        <Route path="/poetry-style-voice" element={<Navigate to="/poetry" />} />
        <Route path="/poetry-revision-clarity" element={<Navigate to="/poetry" />} />
        <Route path="/research-fact-checking" element={<Navigate to="/nonfiction" />} />
        <Route path="/organization-structure" element={<Navigate to="/nonfiction" />} />
        <Route path="/voice-tone-development" element={<Navigate to="/nonfiction" />} />
        <Route path="/clarity-conciseness" element={<Navigate to="/nonfiction" />} />
        <Route path="/audience-platform-strategy" element={<Navigate to="/online-content" />} />
        <Route path="/content-idea-generation" element={<Navigate to="/online-content" />} />
        <Route path="/scripting-storyboarding" element={<Navigate to="/online-content" />} />
        <Route path="/filming-production-tips" element={<Navigate to="/online-content" />} />
        <Route path="/posting-optimization-growth" element={<Navigate to="/online-content" />} />
        <Route path="/theme-concept-development" element={<Navigate to="/songwriting" />} />
        <Route path="/lyrics-wordcraft" element={<Navigate to="/songwriting" />} />
        <Route path="/melody-hook-creation" element={<Navigate to="/songwriting" />} />
        <Route path="/song-structure-arrangement" element={<Navigate to="/songwriting" />} />
        <Route path="/style-genre-performance-tips" element={<Navigate to="/songwriting" />} />
        <Route path="/scene-structure-pacing" element={<Navigate to="/stage-screen" />} />
        <Route path="/dialogue-crafting" element={<Navigate to="/stage-screen" />} />
        <Route path="/character-arcs-dynamics" element={<Navigate to="/stage-screen" />} />
        <Route path="/visual-staging-suggestions" element={<Navigate to="/stage-screen" />} />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
};

function App() {
  React.useEffect(() => {
    console.log('App component mounted');
    console.log('Environment check:', {
      hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      nodeEnv: import.meta.env.MODE,
    });
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <AuthProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
            <Toaster />
          </AuthProvider>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;