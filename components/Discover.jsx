"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Icons
import {
  FiCompass,
  FiSearch,
  FiMapPin,
  FiCheckCircle,
  FiDownload,
  FiZap,
  FiEye,
} from "react-icons/fi";

// Custom Components and libs
import { LandingNavbar } from "@/components/LandingNavbar";
import { LandingFooter } from "@/components/LandingFooter";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { downloadVCard } from "@/libs/vcard";
import { useToast } from "@/context/ToastContext";
import { ExchangeModal } from "@/components/ExchangeModal";
import { useProfile } from "@/context/ProfileContext";

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadedRequest, setLoadedRequest] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [exchangeOpen, setExchangeOpen] = useState(false);

  const { profile } = useProfile();

  const { success } = useToast();

  const normalizedQuery = searchQuery.trim();
  const requestKey = `${normalizedQuery}:${page}`;
  const isLoading = loading || loadedRequest !== requestKey;

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams({ q: normalizedQuery, page: String(page) });
        const response = await fetch(`/api/discover?${query}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Discovery is unavailable.");
        if (active) {
          setProfiles((current) => page === 1 ? result.profiles || [] : [...current, ...(result.profiles || [])]);
          setHasMore(result.hasMore === true);
          setLoadError("");
        }
      } catch (error) {
        if (active) {
          if (page === 1) setProfiles([]);
          setLoadError(error.message || "Discovery is unavailable.");
        }
      } finally {
        if (active) {
          setLoadedRequest(requestKey);
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [normalizedQuery, page, requestKey]);

  const handleSaveContact = (person) => {
    downloadVCard(person);

    success(`Downloaded vCard for ${person.name}!`);
  };

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
          max-w-7xl
          w-full
          mx-auto
          px-4
          md:px-6
          lg:px-8
          py-12
          space-y-10
        "
      >

        {/* Header */}
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
              bg-accent-soft
              border
              border-light
              text-accent
              text-sm
              md:text-base
              font-mono
            "
          >
            <FiCompass
              className="
                w-3.5
                h-3.5
                text-accent
              "
            />

            <span>Community Directory</span>
          </div>

          <h1
            className="
              text-3xl
              md:text-5xl
              font-black
              text-primary
              tracking-tight
            "
          >
            Discover OneMe Identities
          </h1>

          <p
            className="
              text-sm
              md:text-base
              text-secondary
            "
          >
            Find verified people who chose to publish their profile and opt into discovery.
          </p>
        </div>
        

        {/* Search & Filters */}
        <div
          className="
            space-y-4
            max-w-3xl
            mx-auto
          "
        >
          <Input
            placeholder="Search by name, skill, role, or public city..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            icon={FiSearch}
            className="
              text-base
              py-3
            "
          />

        </div>

        {/* Profiles Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-secondary animate-pulse">
            Searching published identities...
          </div>
        ) : loadError ? (
          <div role="alert" className="p-12 text-center text-sm text-danger">
            {loadError}
          </div>
        ) : profiles.length === 0 ? (
          <div
            className="
              p-12
              text-center
              rounded-3xl
              bg-glass-soft
              border
              border-subtle
              space-y-3
              max-w-md
              mx-auto
            "
          >
            <h3
              className="
                text-base
                md:text-lg
                font-bold
                text-primary
              "
            >
              No identities found
            </h3>

            <p
              className="
                text-sm
                md:text-base
                text-secondary
              "
            >
              No profiles match your current search criteria. Try a broader
              search term.
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              lg:grid-cols-3
              gap-6
            "
          >
            {profiles.map((person) => (
              <motion.div
                key={person.id}
                whileHover={{
                  y: -3,
                }}
                className="
                  p-6
                  rounded-3xl
                  bg-glass
                  border
                  border-subtle
                  backdrop-blur-xl
                  hover:border-light
                  transition-all
                  flex
                  flex-col
                  justify-between
                  space-y-5
                "
              >
                <div
                  className="
                    space-y-4
                  "
                >
                  {/* Header info */}
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3.5
                      "
                    >
                      <div
                        className="
                          relative
                          w-14
                          h-14
                          rounded-full
                          overflow-hidden
                          border-2
                          border-light
                          shrink-0
                        "
                      >
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />
                      </div>

                      <div>
                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                          "
                        >
                          <h3
                            className="
                              text-base
                              md:text-lg
                              font-bold
                              text-primary
                            "
                          >
                            {person.name}
                          </h3>

                          {person.verified && (
                            <span
                              className="
                                p-0.5
                                rounded-full
                                bg-accent
                                text-primary
                                text-xs
                              "
                            >
                              <FiCheckCircle
                                className="
                                  w-3
                                  h-3
                                "
                              />
                            </span>
                          )}
                        </div>

                        <p
                          className="
                            text-xs
                            md:text-sm
                            text-accent
                            font-medium
                          "
                        >
                          {person.title}
                        </p>

                        <p
                          className="
                            text-xs
                            md:text-sm
                            text-secondary
                            font-mono
                          "
                        >
                          @{person.username}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Tagline */}
                  <p
                    className="
                      text-xs
                      md:text-sm
                      text-secondary
                      leading-relaxed
                      italic
                    "
                  >
                    &ldquo;{person.tagline}&rdquo;
                  </p>

                  {/* Metadata */}
                  <div
                    className="
                      space-y-1.5
                      text-xs
                      md:text-sm
                      text-secondary
                      pt-1
                    "
                  >
                    {person.location && (
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <FiMapPin
                          className="
                            w-3.5
                            h-3.5
                            text-danger
                            shrink-0
                          "
                        />

                        <span className="truncate">{person.location}</span>
                      </div>
                    )}
                    {!isLoading && hasMore && (
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="md"
                          isLoading={loading}
                          onClick={() => setPage((current) => current + 1)}
                        >
                          Load more
                        </Button>
                      </div>
                    )}

                  </div>

                  {/* Skills tags */}
                  <div
                    className="
                      flex
                      flex-wrap
                      gap-1.5
                      pt-1
                    "
                  >
                    {(person.skills || []).map((s, i) => (
                      <span
                        key={i}
                        className="
                            px-2
                            py-0.5
                            rounded-md
                            bg-glass-soft
                            text-secondary
                            text-xs
                            md:text-sm
                            font-mono
                          "
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    pt-4
                    border-t
                    border-subtle
                  "
                >
                  <Link
                    href={`/@${person.username}`}
                    className="
                      flex-1
                    "
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="
                        w-full
                        text-xs
                      "
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
