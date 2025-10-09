import React from "react";
import HeaderCTA from "@/components/HeaderCTA";
    import { useLocation } from "react-router-dom";
    import { useBackgroundImage } from "@/lib/hooks/useBackgroundImage";
    import Footer from "@/components/ui/Footer";

    function Layout({ children }) {
      const { isBackgroundLoaded, backgroundImageUrl } = useBackgroundImage();
      const location = useLocation();

      const isLandingPage = location.pathname === "/" || location.pathname === "/signin";

      const defaultPageStyle = {
        backgroundImage: isBackgroundLoaded && !isLandingPage
          ? `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${backgroundImageUrl})`
          : 'linear-gradient(to bottom right, #000000, #1a1a1a)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        transition: 'background-image 0.5s ease-in-out',
      };

      return (
        <div
          className="min-h-screen relative bg-black"
          style={isLandingPage ? {} : defaultPageStyle}
        >
          {!isLandingPage && <HeaderCTA />}
          <div className="pb-24"> {/* Added padding-bottom to ensure space above the fixed footer */}
            {children}
          </div>
          <Footer showSubscription={false} />
        </div>
      );
    }

    export default Layout;