import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { routeConfig } from "@/config/routeConfig";
import SignIn from "@/pages/SignIn";
import { useAuth } from "@/lib/hooks/useAuth.jsx";

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

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {routeConfig.map((route, index) => {
        const PageComponent = route.element;
        if (route.isProtected) {
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute
                  element={PageComponent}
                />
              }
            />
          );
        }
        if (route.isPublic) {
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <PublicRoute
                  element={PageComponent}
                />
              }
            />
          );
        }
        return null; 
      })}
      <Route
        path="/signin"
        element={<Navigate to="/" />} 
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
    </Routes>
  );
}

export default AppRoutes;