import React from "react";
import HeaderCTA from "@/components/HeaderCTA";
    import { useLocation } from "react-router-dom";
    import Footer from "@/components/ui/Footer";

    function Layout({ children }) {
      const location = useLocation();

      const isLandingPage = location.pathname === "/" || location.pathname === "/signin";
      const isDemoPage = location.pathname.startsWith("/demo");

      return (
        <div className="min-h-screen relative">
          {!isLandingPage && !isDemoPage && (
            <>
              <div className="absolute inset-0 z-0">
                <img
                  className="object-cover w-full h-full fixed"
                  alt="Background bookshelf with warm lighting"
                  src="https://images.unsplash.com/photo-1630320778004-ffd02f18f93f"
                />
                <div className="absolute inset-0 bg-black/60 fixed"></div>
              </div>
              <div className="relative z-10">
                <HeaderCTA />
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