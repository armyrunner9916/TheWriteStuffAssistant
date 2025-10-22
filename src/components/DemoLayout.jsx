import React from "react";
import DemoBanner from "@/components/DemoBanner";
import Footer from "@/components/ui/Footer";

function DemoLayout({ children }) {
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
      <DemoBanner />
      <div className="pb-24 relative z-10">
        {children}
      </div>
      <Footer showSubscription={false} />
    </div>
  );
}

export default DemoLayout;