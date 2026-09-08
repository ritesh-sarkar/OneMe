"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiCompass,
  FiSearch,
  FiFilter,
  FiMapPin,
  FiBookOpen,
  FiCheckCircle,
  FiDownload,
  FiZap,
  FiExternalLink,
  FiEye,
} from "react-icons/fi";
import { LandingNavbar } from "@/components/LandingNavbar";
import { LandingFooter } from "@/components/LandingFooter";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Badge } from "@/components/Badge";
import { DISCOVER_PROFILES } from "@/libs/mock-data";
import { downloadVCard } from "@/libs/vcard";
import { useToast } from "@/context/ToastContext";
import { ExchangeModal } from "@/components/ExchangeModal";
import { useProfile } from "@/context/ProfileContext";

const CATEGORIES = [
  "All",
  "Developers",
  "Designers",
  "Founders",
  "Creators",
  "Students",
];

export default function DiscoverPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [selectedPeerForExchange, setSelectedPeerForExchange] = useState(null);

  const { profile } = useProfile();
  const { success } = useToast();

  const filteredProfiles = DISCOVER_PROFILES.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.university?.toLowerCase().includes(q) ||
      (item.skills || []).some((s) => s.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const handleSaveContact = (person) => {
    downloadVCard(person);
    success(`Downloaded vCard for ${person.name}!`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-page text-primary selection:bg-accent-soft selection:text-primary">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-soft border border-light text-accent text-xs font-mono">
            <FiCompass className="w-3.5 h-3.5 text-accent" />
            <span>Community Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-primary tracking-tight">
            Discover OneMe Identities
          </h1>
          <p className="text-sm sm:text-base text-secondary">
            Explore verified creators, full-stack developers, design leaders,
            and startup founders.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <Input
            placeholder="Search by name, skill (e.g. React, WebGL), university, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={FiSearch}
            className="text-sm py-3"
          />

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-accent text-primary shadow-md glow-indigo"
                    : "bg-surface-panel border border-subtle text-secondary hover:text-primary hover:bg-surface-panel"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Profiles Grid */}
        {filteredProfiles.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-glass-soft border border-subtle space-y-3 max-w-md mx-auto">
            <h3 className="text-base font-bold text-primary">
              No identities found
            </h3>
            <p className="text-xs text-secondary">
              No profiles match your current search criteria. Try a broader
              search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((person) => (
              <motion.div
                key={person.id}
                whileHover={{ y: -3 }}
                className="p-6 rounded-3xl bg-glass border border-subtle backdrop-blur-xl hover:border-light transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-light shrink-0">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-primary">
                            {person.name}
                          </h3>
                          {person.verified && (
                            <span className="p-0.5 rounded-full bg-accent text-primary text-[10px]">
                              <FiCheckCircle className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-accent font-medium">
                          {person.title}
                        </p>
                        <p className="text-[11px] text-muted font-mono">
                          @{person.username}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      size="sm"
                      className="text-[10px] uppercase font-mono"
                    >
                      {person.category}
                    </Badge>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-secondary leading-relaxed italic">
                    &ldquo;{person.tagline}&rdquo;
                  </p>

                  {/* Metadata */}
                  <div className="space-y-1.5 text-xs text-secondary pt-1">
                    {person.location && (
                      <div className="flex items-center gap-2">
                        <FiMapPin className="w-3.5 h-3.5 text-danger shrink-0" />
                        <span className="truncate">{person.location}</span>
                      </div>
                    )}
                    {person.university && (
                      <div className="flex items-center gap-2">
                        <FiBookOpen className="w-3.5 h-3.5 text-warning shrink-0" />
                        <span className="truncate">{person.university}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(person.skills || []).map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-glass-soft text-secondary text-[10px] font-mono"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-subtle">
                  <Link href={`/@${person.username}`} className="flex-1">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs"
                      icon={FiEye}
                    >
                      View OneMe
                    </Button>
                  </Link>

                  <Button
                    onClick={() => handleSaveContact(person)}
                    variant="outline"
                    size="sm"
                    icon={FiDownload}
                    title="Save vCard"
                  >
                    .vcf
                  </Button>

                  <Button
                    onClick={() => {
                      setSelectedPeerForExchange(person);
                      setExchangeOpen(true);
                    }}
                    variant="glow"
                    size="sm"
                    icon={FiZap}
                    title="OneMe Flow Connect"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <LandingFooter />

      {/* OneMe Flow Exchange Modal */}
      <ExchangeModal
        isOpen={exchangeOpen}
        onClose={() => setExchangeOpen(false)}
        currentUser={profile}
      />
    </div>
  );
}
