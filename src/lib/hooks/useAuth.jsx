import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const AuthContext = createContext(null);

const clearLocalUserData = () => {
  localStorage.setItem("isAuthenticated", "false");
  localStorage.removeItem('userId');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('isSubscribed');
  localStorage.removeItem('queriesRemaining');
  localStorage.removeItem("apiKey");
  sessionStorage.removeItem('conversationHistory');
};

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetUserSession = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        if (error) console.error("Error getting session:", error.message);
        if (!session && isAuthenticated) { 
          console.log("No active session found, but was previously authenticated. Signing out.");
        }
        
        setUser(null);
        setIsAuthenticated(false);
        clearLocalUserData();
        
        if (error && error.message.includes("session_not_found")) {
          await supabase.auth.signOut();
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          });
        } else if (error && error.message.includes("refresh_token_not_found")) {
          await supabase.auth.signOut();
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          });
        } else if (error) {
           toast({
            title: "Session Issue",
            description: "Could not retrieve your session. Please try signing in.",
            variant: "destructive",
          });
        }
      } else {
        const currentUser = session.user ?? null;
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        localStorage.setItem("isAuthenticated", !!currentUser ? "true" : "false");
        if (currentUser) {
          localStorage.setItem('userId', currentUser.id);
        } else {
          clearLocalUserData();
        }
      }
    } catch (catchError) {
      console.error("Unexpected error during session check:", catchError);
      setUser(null);
      setIsAuthenticated(false);
      clearLocalUserData();
      toast({
        title: "Error",
        description: "An unexpected error occurred while checking your session.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, isAuthenticated]);

  useEffect(() => {
    fetchAndSetUserSession(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true); 
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        const authenticated = !!currentUser;
        setIsAuthenticated(authenticated);
        localStorage.setItem("isAuthenticated", authenticated ? "true" : "false");

        if (authenticated) {
          localStorage.setItem('userId', currentUser.id);
        } else {
          clearLocalUserData();
        }

        if (event === 'SIGNED_OUT') {
            navigate('/');
        }

        if (event === 'SIGNED_OUT' || !session) {
            setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            setLoading(false);
        } else {
             setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchAndSetUserSession, navigate]);

  const signIn = useCallback(async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);
  
  const signUp = useCallback(async (email, password) => {
    return supabase.auth.signUp({ email, password });
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Error",
        description: error.message || "Failed to sign out.",
        variant: "destructive",
      });
      setLoading(false);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      clearLocalUserData();
      navigate('/', { replace: true });
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      setLoading(false);
    }
  }, [toast, navigate]);

  const value = {
    isAuthenticated,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    fetchAndSetUserSession 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};