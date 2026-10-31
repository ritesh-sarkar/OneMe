
"use client";

import { useState } from "react";
import { FiRadio, FiGrid, FiZap } from "react-icons/fi";

// Custom Components and libs
import { Button } from "@/components/Button";
import { RadarScan } from "@/components/RadarScan";
import { PeerCard } from "@/components/PeerCard";
import { QrGenerator } from "@/components/QrGenerator";
import { ExchangeModal } from "@/components/ExchangeModal";

// Contexts
import { useProfile } from "@/context/ProfileContext";

const DEMO_NEARBY = [
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
    notes: "Exchanged at OneMe Live Radar Meetup.",
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
    notes: "Exchanged via OneMe Flow Web Radar.",
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
    notes: "Exchanged at AI Meetup via OneMe Flow.",
  },
  {
    id: "peer_4",
    name: "Maya Patel",
    username: "mayapatel",
    title: "Developer Relations Engineer",
    company: "Vercel",
    location: "London, UK",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    email: "maya@vercel.dev",
    phone: "+44 7700 900341",
    notes: "Connected via OneMe Flow Radar.",
  },
];

export default function ExchangeStudioPage() {
  const { profile } = useProfile();

  const [activeTab, setActiveTab] = useState("radar");
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const username = profile?.username || "ritesh";

  const exchangeUrl = `https://oneme.app/exchange?preview=1&from=${encodeURIComponent(username)}`;

  const handleSelectPeer = (peer) => {
    setSelectedPeer(peer);
    setModalOpen(true);
  };

  return (
    <div
      className="
        space-y-8
      "
    >
      {/* Header */}
      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-4
        "
      >
        <div>
          <h1
            className="
              text-2xl
              sm:text-3xl
              font-black
              text-primary
              tracking-tight
            "
          >
            OneMe Flow Protocol
          </h1>

          <p
            className="
              text-xs
              sm:text-sm
              text-secondary
              mt-1
            "
          >
            Proximity radar discovery and dynamic mutual contact exchange
            session generator.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          variant="glow"
          size="md"
          icon={FiZap}
        >
          Launch OneMe Flow
        </Button>
      </div>

      {/* Mode Selector */}
      <div
        className="
          flex
          items-center
          gap-2
          p-1.5
          rounded-2xl
          bg-glass
          border
          border-subtle
          max-w-sm
          w-full
        "
      >
        <button
          type="button"
          onClick={() => setActiveTab("radar")}
          aria-pressed={activeTab === "radar"}
          className={`
            flex-1
            py-2
            px-2
            rounded-xl
            text-xs
            font-semibold
            flex
            items-center
            justify-center
            gap-2
            transition-all
            duration-200
            ${
              activeTab === "radar"
                ? "bg-cyan text-surface-dark font-bold shadow-md"
                : "text-secondary hover:text-primary"
            }
          `}
        >
          <FiRadio
            className="
              w-3.5
              h-3.5
              shrink-0
            "
          />

          <span>OneMe Flow Radar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("qr")}
          aria-pressed={activeTab === "qr"}
          className={`
            flex-1
            py-2
            px-2
            rounded-xl
            text-xs
            font-semibold
            flex
            items-center
            justify-center
            gap-2
            transition-all
            duration-200
            ${
              activeTab === "qr"
                ? "bg-cyan text-surface-dark font-bold shadow-md"
                : "text-secondary hover:text-primary"
            }
          `}
        >
          <FiGrid
            className="
              w-3.5
              h-3.5
              shrink-0
            "
          />

          <span>Exchange QR Code</span>
        </button>
      </div>

      {/* Main Studio */}
      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-12
          gap-6
          lg:gap-8
          items-start
        "
      >
        {/* Radar / QR Panel */}
        <div
          className="
            lg:col-span-7
            p-5
            sm:p-8
            rounded-3xl
            bg-glass
            border
            border-subtle
            backdrop-blur-xl
            shadow-xl
            space-y-6
            min-w-0
          "
        >
          {activeTab === "radar" ? (
            <div
              className="
                space-y-6
              "
            >
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  justify-between
                  gap-2
                  border-b
                  border-subtle
                  pb-3
                "
              >
                <span
                  className="
                    text-xs
                    font-mono
                    text-cyan
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span
                    className="
                      w-2
                      h-2
                      rounded-full
                      bg-cyan
                      animate-pulse
                      shrink-0
                    "
                  />

                  Demo radar preview (4 sample profiles)
                </span>

                <span
                  className="
                    text-xs
                    text-muted
                    font-mono
                  "
                >
                  Simulation
                </span>
              </div>

              <RadarScan
                isSearching={true}
                peers={DEMO_NEARBY}
                selectedPeer={selectedPeer}
                onSelectPeer={handleSelectPeer}
              />

              <p
                className="
                  text-xs
                  sm:text-sm
                  text-center
                  text-secondary
                  leading-relaxed
                  max-w-md
                  mx-auto
                "
              >
                Click on any nearby avatar or tap{" "}
                <strong>Launch OneMe Flow</strong> to experience the mutual
                handshake simulation.
              </p>
            </div>
          ) : (
            <div
              className="
                space-y-6
              "
            >
              <QrGenerator
                url={exchangeUrl}
                username={username}
                title="OneMe Flow Preview QR"
              />

              <p
                className="
                  text-xs
                  sm:text-sm
                  text-center
                  text-secondary
                  leading-relaxed
                  max-w-md
                  mx-auto
                "
              >
                Preview only: this code opens the demo exchange page and does
                not create a secure, participant-bound session.
              </p>
            </div>
          )}
        </div>

        {/* Discovered Peers */}
        <div
          className="
            lg:col-span-5
            p-5
            sm:p-6
            rounded-3xl
            bg-glass
            border
            border-subtle
            backdrop-blur-xl
            space-y-4
            min-w-0
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              border-b
              border-subtle
              pb-3
            "
          >
            <h3
              className="
                text-sm
                sm:text-base
                font-bold
                text-primary
              "
            >
              Sample Demo Profiles
            </h3>

            <span
              className="
                text-xs
                text-cyan
                font-mono
                font-bold
                whitespace-nowrap
              "
            >
              Preview Data
            </span>
          </div>

          <div
            className="
              space-y-2.5
            "
          >
            {DEMO_NEARBY.map((peer) => (
              <PeerCard
                key={peer.id}
                peer={peer}
                isSelected={selectedPeer?.id === peer.id}
                onSelect={handleSelectPeer}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Exchange Modal */}
      <ExchangeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentUser={profile}
      />
    </div>
  );
}
