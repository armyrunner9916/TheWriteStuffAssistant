
import React from "react";
import { BrowserRouter as Router, useNavigate, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/hooks/useAuth";
import AppInitializer from "@/components/AppInitializer";
import { HelmetProvider } from "react-helmet-async";
import Layout from "@/components/Layout";

import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import PasswordResetForm from "@/components/PasswordResetForm";
import Dashboard from "@/pages/Dashboard";

import Prose from "@/pages/Prose";
import Poetry from "@/pages/Poetry";
import Nonfiction from "@/pages/Nonfiction";
import OnlineContent from "@/pages/OnlineContent";
import Songwriting from "@/pages/Songwriting";
import StageScreen from "@/pages/StageScreen";

const AppContent = () => {
  const { signOut: authSignOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authSignOut();
    navigate('/', { replace: true });
    window.location.reload();
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/password-reset" element={<PasswordResetForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prose" element={<Prose />} />
        <Route path="/poetry" element={<Poetry />} />
        <Route path="/nonfiction" element={<Nonfiction />} />
        <Route path="/online-content" element={<OnlineContent />} />
        <Route path="/songwriting" element={<Songwriting />} />
        <Route path="/stage-screen" element={<StageScreen />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
