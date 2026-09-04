"use client";

import React from "react";

//Custom Components and libs
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";

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
      <main
        className="
          flex-1
        "
      >
        <Hero />
        <HowItWorks />
      </main>
    </div>
  );
}
