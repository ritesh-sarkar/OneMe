
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiSearch,
  FiDownload,
  FiMail,
  FiPhone,
  FiTrash2,
  FiExternalLink,
  FiRadio,
  FiRefreshCw,
} from "react-icons/fi";

// Custom Components and libs
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { downloadVCard, generateVCard } from "@/libs/vcard";
import { formatDate } from "@/libs/utils";

// Contexts
import { useConnections } from "@/context/ConnectionsContext";
import { useToast } from "@/context/ToastContext";

// Custom Components
import { ExchangeModal } from "@/components/ExchangeModal";
import FlowInbox from "@/components/FlowInbox";

export default function ConnectionsPage() {
  const {
    connections,
    isLoaded,
    loadError,
    refreshConnections,
    removeConnection,
    clearAllConnections,
  } = useConnections();

  const {
    success,
    info,
    error: toastError,
  } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [exchangeOpen, setExchangeOpen] = useState(false);

  const filteredConnections = connections.filter((conn) => {
    const query = searchQuery.toLowerCase();

    return (
      conn.name?.toLowerCase().includes(query) ||
      conn.title?.toLowerCase().includes(query) ||
      conn.company?.toLowerCase().includes(query) ||
      conn.location?.toLowerCase().includes(query)
    );
  });

  const handleExportSingle = (conn) => {
    downloadVCard(conn);

    success(`Downloaded vCard for ${conn.name}!`);
  };

  const handleExportAll = () => {
    const bulkVcards = connections
      .map((conn) => generateVCard(conn))
      .join("\r\n\r\n");

    const blob = new Blob(
      [bulkVcards],
      {
        type: "text/vcard;charset=utf-8;",
      }
    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "oneme_all_connections.vcf";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success(`Exported ${connections.length} contacts to bulk vCard file!`);
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
          md:flex-row
          md:items-center
          justify-between
          gap-4
        "
      >
        <div
          className="
            space-y-1
          "
        >
          <h1
            className="
              text-2xl
              md:text-3xl
              font-black
              text-text-primary
              tracking-tight
            "
          >
            My Connections
          </h1>

          <p
            className="
              text-sm
              md:text-base
              text-secondary
            "
          >
            Contacts exchanged with mutual consent and securely saved to your account.
          </p>
        </div>

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >
          <Button
            onClick={async () => {
              try {
                await refreshConnections();
                success("Connections refreshed.");
              } catch (error) {
                toastError(error.message || "Connections could not be refreshed.");
              }
            }}
            variant="outline"
            size="sm"
            icon={FiRefreshCw}
            className="transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
          >
            Refresh
          </Button>

          <Button
            onClick={() => setExchangeOpen(true)}
            variant="glow"
            size="sm"
            icon={FiRadio}
            className="
              transition-all
              duration-200
              ease-in-out
              hover:scale-105
              active:scale-95
            "
          >
            Start OneMe Flow
          </Button>

          {connections.length > 0 && (
            <Button
              onClick={handleExportAll}
              variant="outline"
              size="sm"
              icon={FiDownload}
              className="
                transition-all
                duration-200
                ease-in-out
                hover:scale-105
                active:scale-95
              "
            >
              Export All (.vcf)
            </Button>
          )}

          {connections.length > 0 && (
            <Button
              onClick={async () => {
                if (!window.confirm("Remove all saved connections from your account?")) return;
                try {
                  await clearAllConnections();
                  success("All saved connections were removed.");
                } catch (error) {
                  toastError(error.message || "Connections could not be removed.");
                }
              }}
              variant="outline"
              size="sm"
              icon={FiRefreshCw}
              title="Remove all saved connections"
              className="transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      <FlowInbox />

      {loadError && (
        <p role="alert" className="rounded-2xl border border-light bg-danger-soft p-4 text-sm text-danger">
          {loadError}
        </p>
      )}

      {/* Search Bar */}
      <div
        className="
          max-w-md
        "
      >
        <Input
          placeholder="Search by name, company, or role..."
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          icon={FiSearch}
        />
      </div>

      {/* Connections List */}
      {!isLoaded ? (
        <p className="rounded-2xl border border-subtle bg-glass p-6 text-sm text-secondary">
          Loading your saved connections…
        </p>
      ) : filteredConnections.length === 0 ? (
        <div
          className="
            p-8
            md:p-12
            text-center
            rounded-3xl
            bg-glass-soft
            border
            border-subtle
            space-y-4
          "
        >
          <div
            className="
              w-12
              h-12
              rounded-2xl
              bg-surface-panel
              text-secondary
              flex
              items-center
              justify-center
              mx-auto
            "
          >
            <FiUsers
              className="
                w-6
                h-6
              "
            />
          </div>

          <div
            className="
              space-y-1
            "
          >
            <h3
              className="
                text-base
                md:text-lg
                font-bold
                text-text-primary
              "
            >
              No connections found
            </h3>

            <p
              className="
                text-sm
                md:text-base
                text-secondary
              "
            >
              Try another search or start a consent-based OneMe Flow request.
            </p>
          </div>

          <Button
            onClick={() => setExchangeOpen(true)}
            variant="primary"
            size="sm"
            icon={FiRadio}
            className="
              transition-all
              duration-200
              ease-in-out
              hover:scale-105
              active:scale-95
            "
          >
            Start OneMe Flow
          </Button>
        </div>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-5
          "
        >
          {filteredConnections.map((conn) => (
            <motion.div
              key={conn.id}
              whileHover={{
                y: -2,
              }}
              className="
                p-5
                rounded-3xl
                bg-glass
                border
                border-subtle
                backdrop-blur-xl
                hover:border-light
                transition-all
                duration-200
                ease-in-out
                flex
                flex-col
                justify-between
                space-y-4
              "
            >
              {/* Connection Header */}
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
                    gap-3
                    min-w-0
                  "
                >
                  <div
                    className="
                      relative
                      w-12
                      h-12
                      rounded-full
                      overflow-hidden
                      border
                      border-light
                      shrink-0
                    "
                  >
                    {conn.avatar ? (
                      <img src={conn.avatar} alt={conn.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-surface-panel font-bold text-accent">
                        {conn.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div
                    className="
                      min-w-0
                    "
                  >
                    <h3
                      className="
                        text-sm
                        md:text-base
                        font-bold
                        text-text-primary
                        truncate
                      "
                    >
                      {conn.name}
                    </h3>

                    {conn.title && <p
                      className="
                        text-sm
                        md:text-base
                        text-cyan
                        font-medium
                        truncate
                      "
                    >
                      {conn.title}
                    </p>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await removeConnection(conn.id);
                      info(`Removed ${conn.name} from your connections.`);
                    } catch (error) {
                      toastError(error.message || "Connection could not be removed.");
                    }
                  }}
                  className="
                    p-1.5
                    rounded-lg
                    text-tertiary
                    hover:text-danger
                    hover:bg-danger-soft
                    transition-all
                    duration-200
                    ease-in-out
                    hover:scale-105
                    active:scale-95
                    shrink-0
                  "
                  title="Remove Connection"
                  aria-label={`Remove ${conn.name} from connections`}
                >
                  <FiTrash2
                    className="
                      w-3.5
                      h-3.5
                    "
                  />
                </button>
              </div>

              {/* Contact Information */}
              <div
                className="
                  p-3
                  rounded-2xl
                  bg-surface-dark/70
                  border
                  border-subtle
                  space-y-2
                  text-sm
                  md:text-base
                  text-secondary
                "
              >
                {conn.email && (
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      min-w-0
                    "
                  >
                    <FiMail
                      className="
                        w-3.5
                        h-3.5
                        text-cyan
                        shrink-0
                      "
                    />

                    <span
                      className="
                        truncate
                      "
                    >
                      {conn.email}
                    </span>
                  </div>
                )}

                {conn.phone && (
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      min-w-0
                    "
                  >
                    <FiPhone
                      className="
                        w-3.5
                        h-3.5
                        text-success
                        shrink-0
                      "
                    />

                    <span
                      className="
                        font-mono
                        text-xs
                        md:text-sm
                        truncate
                      "
                    >
                      {conn.phone}
                    </span>
                  </div>
                )}

                {conn.socials?.map((social) => (
                  <a
                    key={`${social.platform}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center gap-2 truncate text-accent hover:underline"
                  >
                    <FiExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{social.label || social.platform}</span>
                  </a>
                ))}

                {conn.resume?.fileUrl && (
                  <a
                    href={conn.resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-accent hover:underline"
                  >
                    <FiDownload className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{conn.resume.fileName || "Shared resume"}</span>
                  </a>
                )}

                {conn.exchangeMethod && (
                  <div
                    className="
                      text-xs
                      md:text-sm
                      text-tertiary
                      pt-2
                      border-t
                      border-subtle
                      font-mono
                      flex
                      flex-wrap
                      items-center
                      justify-between
                      gap-2
                    "
                  >
                    <span>
                      Via {conn.exchangeMethod}
                    </span>

                    <span>
                      {formatDate(conn.dateConnected)}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Action Buttons */}
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Button
                  onClick={() => handleExportSingle(conn)}
                  variant="primary"
                  size="sm"
                  icon={FiDownload}
                  className="
                    flex-1
                    text-sm
                    md:text-base
                    transition-all
                    duration-200
                    ease-in-out
                    hover:scale-105
                    active:scale-95
                  "
                >
                  Save .vcf
                </Button>

                <Link
                  href={`/@${conn.username || "user"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    p-2
                    rounded-xl
                    bg-surface-dark
                    hover:bg-surface-panel
                    text-secondary
                    hover:text-text-primary
                    transition-all
                    duration-200
                    ease-in-out
                    hover:scale-105
                    active:scale-95
                  "
                  title="View OneMe Profile"
                  aria-label={`View ${conn.name}'s OneMe profile`}
                >
                  <FiExternalLink
                    className="
                      w-4
                      h-4
                    "
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* OneMe Flow Exchange Modal */}
      <ExchangeModal
        isOpen={exchangeOpen}
        onClose={() => setExchangeOpen(false)}
      />
    </div>
  );
}
