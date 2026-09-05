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
      <LandingNavbar />
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
    </div>
  );
}
