"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Icons
import {
  FiHome,
  FiUser,
  FiSliders,
  FiFolder,
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiRadio,
  FiCpu,
  FiSettings,
  FiExternalLink,
  FiLogOut,
  FiCompass,
} from "react-icons/fi";
import { RiToolsFill } from "react-icons/ri";

// Custom Libs
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: FiHome,
  },
  {
    label: "Profile Editor",
    href: "/dashboard/profile",
    icon: FiUser,
  },
  {
    label: "Appearance",
    href: "/dashboard/appearance",
    icon: FiSliders,
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: FiFolder,
  },
  {
    label: "Resume & Career",
    href: "/dashboard/resume",
    icon: FiFileText,
  },
  {
    label: "Connections",
    href: "/dashboard/connections",
    icon: FiUsers,
  },
  {
    label: "OneMe Flow",
    href: "/dashboard/exchange",
    icon: FiRadio,
    highlight: true,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: FiBarChart2,
  },
  {
    label: "AI Assistant",
    href: "/dashboard/ai-assistant",
    icon: FiCpu,
  },
  {
    label: "Discover",
    href: "/discover",
    icon: FiCompass,
  },
  {
    label: "Tools (Upcoming)",
    href: "/dashboard/tools",
    icon: RiToolsFill,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: FiSettings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { profile } = useProfile();

  const activeUser = profile || user;

  return (
    <aside
      className="
        sticky
        top-0
        z-30
        hidden
        h-screen
        min-h-screen
        w-64
        shrink-0
        flex-col
        overflow-y-auto
        border-r
        border-subtle
        bg-surface-page
        scrollbar-none
        lg:flex
      "
    >
      {/* Brand Header */}
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-subtle
          p-5
        "
      >
        <Link
          href="/dashboard"
          className="
            group
            flex
            items-center
            gap-2.5
          "
        >
          <div
            className="
              glow-cyan
              h-8
              w-8
              rounded-xl
              bg-gradient-to-tr
              gradient-brand
              p-0.5
              shadow-md
              transition-transform
              group-hover:scale-105
            "
          >
            <div
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
                rounded-[10px]
                bg-surface-page
              "
            >
              <span
                className="
                  text-xs
                  font-extrabold
                  text-primary
                "
              >
                1M
              </span>
            </div>
          </div>

          <div
            className="
              flex
              flex-col
            "
          >
            <span
              className="
                flex
                items-center
                gap-1
                text-base
                font-extrabold
                tracking-tight
                text-primary
              "
            >
              OneMe
              <span
                className="
                  inline-block
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-cyan
                "
              />
            </span>
          </div>
        </Link>
      </div>

      {/* Profile Mini Card */}
      <div
        className="
          mx-3
          my-3
          flex
          items-center
          gap-3
          rounded-2xl
          border
          border-subtle
          bg-glass
          p-4
        "
      >
        <div
          className="
            relative
            h-10
            w-10
            shrink-0
            overflow-hidden
            rounded-full
            border
            border-light
          "
        >
          <img
            src={
              activeUser?.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
            }
            alt={activeUser?.name || "Ritesh"}
            className="
              h-full
              w-full
              object-cover
            "
          />
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <h4
            className="
              truncate
              text-xs
              font-bold
              text-primary
            "
          >
            {activeUser?.name || "Ritesh Sarkar"}
          </h4>

          <p
            className="
              truncate
              font-mono
              text-[11px]
              text-secondary
            "
          >
            @{activeUser?.username || "ritesh"}
          </p>
        </div>

        <Link
          href={`/@${activeUser?.username || "ritesh"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="
            rounded-lg
            p-1.5
            text-secondary
            transition-colors
            hover:bg-glass-soft
            hover:text-cyan
          "
          title="View Public Profile"
          aria-label="View public profile"
        >
          <FiExternalLink
            className="
              h-3.5
              w-3.5
            "
          />
        </Link>
      </div>

      {/* Navigation List */}
      <nav
        className="
          flex-1
          space-y-1
          px-3
        "
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex
                items-center
                justify-between
                rounded-xl
                px-3.5
                py-2.5
                text-xs
                font-medium
                transition-all
                ${
                  isActive
                    ? "btn-primary font-semibold glow-indigo"
                    : "text-secondary hover:bg-surface-deep hover:text-primary"
                }
              `}
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <Icon
                  className={`
                    h-4
                    w-4
                    ${
                      isActive
                        ? "text-primary"
                        : item.highlight
                          ? "text-cyan"
                          : "text-secondary"
                    }
                  `}
                />

                <span>{item.label}</span>
              </div>

              {item.highlight && !isActive && (
                <span
                  className="
                    h-2
                    w-2
                    animate-pulse
                    rounded-full
                    bg-cyan
                  "
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div
        className="
          mt-auto
          border-t
          border-subtle
          p-4
        "
      >
        <button
          onClick={logout}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3.5
            py-2.5
            text-xs
            font-medium
            text-secondary
            transition-colors
            hover:bg-danger-soft
            hover:text-danger
          "
        >
          <FiLogOut
            className="
              h-4
              w-4
            "
          />

          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
