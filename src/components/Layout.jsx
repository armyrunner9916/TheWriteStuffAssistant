import React from "react";
import HeaderCTA from "@/components/HeaderCTA";
    import { useLocation } from "react-router-dom";
    import Footer from "@/components/ui/Footer";

    function Layout({ children }) {
      const location = useLocation();

      const isLandingPage = location.pathname === "/" || location.pathname === "/signin";

      return (
        <div className="min-h-screen relative">
          {!isLandingPage && (
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
          <div className={`pb-24 ${!isLandingPage ? 'relative z-10' : ''}`}>
            {children}
          </div>
          <Footer showSubscription={false} />
        </div>
      );
    }

    export default Layout;