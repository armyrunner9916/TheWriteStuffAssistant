import React from "react";
import DemoBanner from "@/components/DemoBanner";
import Footer from "@/components/ui/Footer";

function DemoLayout({ children }) {
  return (
    <div className="min-h-screen relative bg-black">
      <DemoBanner />
      <div className="pb-24">
        {children}
      </div>
      <Footer showSubscription={false} />
    </div>
  );
}

export default DemoLayout;