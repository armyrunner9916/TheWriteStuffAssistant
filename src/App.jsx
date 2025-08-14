import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/hooks/useAuth";
import { HelmetProvider } from "react-helmet-async";
import Layout from "@/components/Layout";

import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import PasswordResetForm from "@/components/PasswordResetForm";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";

import Prose from "@/pages/Prose";
import Poetry from "@/pages/Poetry";
import Nonfiction from "@/pages/Nonfiction";
import OnlineContent from "@/pages/OnlineContent";
import Songwriting from "@/pages/Songwriting";
import StageScreen from "@/pages/StageScreen";

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
        <Route path="/history/:section" element={<ProtectedRoute element={History} />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
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