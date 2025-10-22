import React from "react";
import DemoBanner from "@/components/DemoBanner";
import DemoNavigation from "@/components/DemoNavigation";
import Footer from "@/components/ui/Footer";
import { ExternalLink } from "lucide-react";

function DemoLayout({ children, showBackButton = false }) {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <img
          className="object-cover w-full h-full fixed"
          alt="Background bookshelf with warm lighting"
          src="https://images.unsplash.com/photo-1630320778004-ffd02f18f93f"
        />
        <div className="absolute inset-0 bg-black/60 fixed"></div>
      </div>
      <div className="relative z-10">
        <div className="bg-yellow-400 text-black py-2 px-4 text-center text-sm font-medium">
          <a
            href="https://editstuffassistant.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:underline"
          >
            Need edits on existing work? Visit EditStuffAssistant.com
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <DemoBanner />
        <DemoNavigation showBackButton={showBackButton} />
      </div>
      <div className="pb-24 relative z-10">
        {children}
      </div>
      <Footer showSubscription={false} />
    </div>
  );
}

export default DemoLayout;