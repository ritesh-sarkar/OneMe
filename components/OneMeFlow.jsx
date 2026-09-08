"use client";

import React, { useState } from "react";

//Custom Components and libs
import { LandingNavbar } from "@/components/LandingNavbar";
import { LandingFooter } from "@/components/LandingFooter";
import { RadarScan } from "@/components/RadarScan";
import { PeerCard } from "@/components/PeerCard";
import { ExchangeModal } from "@/components/ExchangeModal";
import { Button } from "@/components/Button";
import { DEMO_USER } from "@/libs/mock-data";

//icons
import { FiRadio, FiZap, FiCheckCircle } from "react-icons/fi";

//demo data
//TODO: replace with real data
const NEARBY_PEERS = [
  {
    id: "peer_1",
    name: "Sarah Khan",
    username: "sarahk",
    title: "Lead Product Designer",
    company: "Starlight Studio",
    location: "Singapore",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    email: "sarah@starlight.design",
    phone: "+65 9123 4567",
  },
  {
    id: "peer_2",
    name: "John Doe",
    username: "johndoe",
    title: "Senior Software Engineer",
    company: "Stripe",
    location: "San Francisco, CA",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    email: "john.doe@stripe.dev",
    phone: "+1 (415) 880-9214",
  },
  {
    id: "peer_3",
    name: "Alex Rivera",
    username: "alexrivera",
    title: "Founder & CTO",
    company: "HyperScale AI",
    location: "Austin, TX",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    email: "alex@hyperscale.ai",
    phone: "+1 (512) 640-1129",
  },
];

export default function PublicExchangePage() {
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div
      className="
        flex
        flex-col
        min-h-screen
        bg-surface-page
        text-primary
        selection:bg-accent-soft
        selection:text-primary
      "
    >
      <LandingNavbar />

      <main
        className="
          flex-1
          max-w-4xl
          w-full
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-12
          space-y-10
        "
      >
        <div
          className="
            text-center
            max-w-2xl
            mx-auto
            space-y-3
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-3.5
              py-1
              rounded-full
              bg-cyan-soft
              border
              border-light
              text-cyan
              text-xs
              font-mono
            "
          >
            <FiRadio
              className="
                w-3.5
                h-3.5
                animate-pulse
                text-cyan
              "
            />

            <span>OneMe Flow Radar Active</span>
          </div>

          <h1
            className="
              text-3xl
              sm:text-5xl
              font-black
              text-primary
              tracking-tight
            "
          >
            OneMe Flow Protocol
          </h1>

          <p
            className="
              text-sm
              sm:text-base
              text-secondary
            "
          >
            Discovered nearby OneMe members. Tap on any peer to initiate a
            secure mutual exchange session.
          </p>
        </div>

        <div
          className="
            p-8
            sm:p-12
            rounded-3xl
            bg-glass
            border
            border-subtle
            backdrop-blur-xl
            shadow-2xl
            space-y-8
          "
        >
          <RadarScan
            isSearching={true}
            peers={NEARBY_PEERS}
            selectedPeer={selectedPeer}
            onSelectPeer={(p) => {
              setSelectedPeer(p);
              setModalOpen(true);
            }}
          />

          <div
            className="
              space-y-3
              max-w-lg
              mx-auto
            "
          >
            <h3
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-secondary
                font-mono
                text-center
              "
            >
              Nearby Active Identity Beacons
            </h3>

            <div
              className="
                space-y-2
              "
            >
              {NEARBY_PEERS.map((peer) => (
                <PeerCard
                  key={peer.id}
                  peer={peer}
                  isSelected={selectedPeer?.id === peer.id}
                  onSelect={(p) => {
                    setSelectedPeer(p);
                    setModalOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />

      <ExchangeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentUser={DEMO_USER}
      />
    </div>
  );
}
