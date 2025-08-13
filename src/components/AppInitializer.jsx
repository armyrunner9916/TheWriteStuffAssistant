import React from "react";
    import AppRoutes from "@/components/AppRoutes";
    import { useAuth } from "@/lib/hooks/useAuth.jsx";
    import { Loader2 } from "lucide-react";

    const AppInitializer = () => {
      const { loading: authLoading } = useAuth();

      if (authLoading) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400">
            <Loader2 className="h-12 w-12 animate-spin" />
          </div>
        );
      }

      return <AppRoutes />;
    };

    export default AppInitializer;