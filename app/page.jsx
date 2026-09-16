"use client";

import React from "react";

//Custom Components and libs
import { LandingNavbar } from "@/components/LandingNavbar";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { FeaturesGrid } from '@/components/FeaturesGrid';
import { ThemeShowcase } from "@/components/ThemeShowcase";
import { FlowDemo } from "@/components/FlowDemo";
import { AnalyticsTeaser } from "@/components/AnalyticsTeaser";
import { FinalCta } from "@/components/FinalCta";
import { LandingFooter } from "@/components/LandingFooter";

export default function LandingPage() {
  return (
    <div
      className="
        flex
        flex-col
        min-h-screen
        bg-surface-page
        text-primary
        selection:bg-cyan-soft
        selection:text-primary
      "
    >
      {/* Navbar section */}
      <LandingNavbar />

      {/* Main content section */}
      <main
        className="
          flex-1
        "
      >
        <Hero />
        <HowItWorks />
        <FeaturesGrid />
        <ThemeShowcase />
        <FlowDemo />
        <AnalyticsTeaser />
        <FinalCta />
      </main>

      {/* Footer section */}
      <LandingFooter />
    </div>
  );
}
