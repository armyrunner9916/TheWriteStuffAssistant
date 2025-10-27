import React from "react";
    import { useLocation } from "react-router-dom";

    function Footer({ showSubscription = true }) {
      const location = useLocation();

      // Footer is now shown on all pages including sign-in
      // Only hide if explicitly needed (none for now)

      return (
        <div className="fixed bottom-0 left-0 right-0 p-4 text-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-4">
            <span className="text-yellow-400 text-sm">
              © - 2025 <a
                href="https://armyrunner-studios.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 hover:underline transition-colors"
              >
                Armyrunner Studios, LLC
              </a>
            </span>
            <a
              href="mailto:support@armyrunner-studios.com"
              className="text-yellow-400 text-sm hover:underline"
            >
              Contact Us
            </a>
          </div>
        </div>
      );
    }

    export default Footer;