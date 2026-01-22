import React from "react";
import HeaderCTA from "@/components/HeaderCTA";
import TrialStatusHeader from "@/components/TrialStatusHeader";
    import { useLocation } from "react-router-dom";
    import { useAuth } from "@/lib/hooks/useAuth";
    import Footer from "@/components/ui/Footer";

    function Layout({ children }) {
      const location = useLocation();
      const { isAuthenticated } = useAuth();

      const isLandingPage = location.pathname === "/" || location.pathname === "/signin";
      const isDemoPage = location.pathname.startsWith("/demo");
      const isAuthPage = location.pathname === "/auth" || location.pathname === "/signup" || location.pathname === "/signin";

      return (
        <div className="min-h-screen relative">
          {!isLandingPage && !isDemoPage && !isAuthPage && (
            <>
              <div className="absolute inset-0 z-0">
                <img
                  className="object-cover w-full h-full fixed"
                  alt=""
                  role="presentation"
                  src="https://images.unsplash.com/photo-1630320778004-ffd02f18f93f"
                />
                <div className="absolute inset-0 bg-black/60 fixed"></div>
              </div>
              <div className="relative z-10">
                {isAuthenticated ? <TrialStatusHeader /> : <HeaderCTA />}
              </div>
            </>
          )}
          <div className={`pb-24 ${!isLandingPage && !isDemoPage ? 'relative z-10' : ''}`}>
            {children}
          </div>
          {!isDemoPage && <Footer showSubscription={false} />}
        </div>
      );
    }

    export default Layout;