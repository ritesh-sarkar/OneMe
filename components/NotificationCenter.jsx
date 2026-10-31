"use client";

import React, { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

//icons
import {
  FiBell,
  FiUserCheck,
  FiTrendingUp,
  FiDownload,
  FiGrid,
  FiCheck,
  FiX,
} from "react-icons/fi";
import Link from "next/link";

//Custom Components and libs
import { formatTimeAgo } from "@/libs/utils";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

async function requestNotifications() {
  const response = await fetch("/api/notifications", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Notifications could not be loaded.");
  return result.notifications || [];
}

export function NotificationCenter() {
  const { user } = useAuth();
  const userId = user?.id;
  const [isOpen, setIsOpen] = useState(false);
  const [storedNotifications, setStoredNotifications] = useState([]);
  const [loadedFor, setLoadedFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { success, error: toastError } = useToast();
  const notifications = loadedFor === userId ? storedNotifications : [];
  const isLoading = Boolean(userId && (loadedFor !== userId || loading));
  const visibleError = loadedFor === userId ? loadError : "";

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    requestNotifications()
      .then((items) => {
        if (active) {
          setStoredNotifications(items);
          setLoadedFor(userId);
          setLoadError("");
        }
      })
      .catch((error) => {
        if (active) {
          setStoredNotifications([]);
          setLoadedFor(userId);
          setLoadError(error.message || "Notifications could not be loaded.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Notifications could not be updated.");
      setStoredNotifications((current) => current.map((item) => ({ ...item, read: true })));
      success("All notifications marked as read.");
    } catch (error) {
      toastError(error.message || "Notifications could not be updated.");
    }
  };

  const markAsRead = async (notification) => {
    if (notification.read) return;
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id, event: notification.event }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Notification could not be updated.");
      setStoredNotifications((current) =>
        current.map((item) =>
          item.id === notification.id && item.event === notification.event
            ? { ...item, read: true }
            : item,
        ),
      );
    } catch (error) {
      toastError(error.message || "Notification could not be updated.");
    }
  };

  const removeNotification = async (notification) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id, event: notification.event }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Notification could not be dismissed.");
      setStoredNotifications((current) =>
        current.filter((item) => item.id !== notification.id || item.event !== notification.event),
      );
    } catch (error) {
      toastError(error.message || "Notification could not be dismissed.");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "connection":
        return (
          <FiUserCheck
            className="
              w-4
              h-4
              text-success
            "
          />
        );

      case "milestone":
        return (
          <FiTrendingUp
            className="
              w-4
              h-4
              text-accent
            "
          />
        );

      case "download":
        return (
          <FiDownload
            className="
              w-4
              h-4
              text-warning
            "
          />
        );

      case "qr":
        return (
          <FiGrid
            className="
              w-4
              h-4
              text-cyan
            "
          />
        );

      default:
        return (
          <FiBell
            className="
              w-4
              h-4
              text-accent
            "
          />
        );
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          relative
          p-2
          rounded-xl
          border
          border-subtle
          bg-bg-primary
          text-text-secondary
          transition-all
          duration-200
          ease-in-out
          hover:bg-bg-secondary
          hover:text-text-primary
          hover:scale-105
          active:scale-95
          cursor-pointer
        "
        title="Notifications"
        aria-label="Notifications"
      >
        <FiBell
          className="
            w-4
            h-4
          "
        />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -top-1
              -right-1
              w-4
              h-4
              rounded-full
              bg-accent
              text-xs
              font-bold
              text-primary
              flex
              items-center
              justify-center
              border-2
              border-subtle
            "
          >
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile closing */}

            <div
              onClick={() => setIsOpen(false)}
              className="
                fixed
                inset-0
                z-40
              "
            />

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.95,
              }}
              transition={{
                duration: 0.2,
              }}
              className="
                absolute
                right-0
                mt-2
                w-80
                md:w-96
                rounded-2xl
                bg-surface-panel
                border
                border-subtle
                shadow-2xl
                backdrop-blur-xl
                z-50
                p-4
                space-y-3
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  pb-3
                  border-b
                  border-subtle
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <h4
                    className="
                      text-base
                      md:text-lg
                      font-bold
                      text-text-primary
                    "
                  >
                    Notifications
                  </h4>

                  {unreadCount > 0 && (
                    <span
                      className="
                        px-2
                        py-0.5
                        rounded-full
                        bg-accent-soft
                        text-accent
                        text-xs
                        md:text-sm
                        font-mono
                        font-semibold
                      "
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="
                      text-xs
                      md:text-sm
                      text-accent
                      hover:text-accent
                      transition-all
                      duration-200
                      ease-in-out
                      font-medium
                      flex
                      items-center
                      gap-1
                      hover:gap-1.5
                    "
                  >
                    <FiCheck
                      className="
                        w-3
                        h-3
                      "
                    />

                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div
                className="
                  space-y-2
                  max-h-72
                  overflow-y-auto
                  pr-1
                "
              >
                {visibleError ? (
                  <p
                    role="alert"
                    className="py-4 text-center text-sm text-danger"
                  >
                    {visibleError}
                  </p>
                ) : isLoading && notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-tertiary">
                    Loading notifications…
                  </div>
                ) : notifications.length === 0 ? (
                  <div
                    className="
                      py-8
                      text-center
                      text-sm
                      md:text-base
                      text-tertiary
                    "
                  >
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={`${n.id}-${n.event}`}
                      className={`
                        p-3
                        rounded-xl
                        border
                        transition-all
                        duration-200
                        ease-in-out
                        flex
                        items-start
                        gap-3
                        ${
                          n.read
                            ? "bg-surface-deep/50 border-subtle opacity-70"
                            : "bg-surface-panel/80 border-light"
                        }
                      `}
                    >
                      <div
                        className="
                          p-2
                          rounded-lg
                          bg-surface-dark/80
                          shrink-0
                          mt-0.5
                        "
                      >
                        {getIcon(n.type)}
                      </div>

                      <Link
                        href="/dashboard/connections"
                        onClick={() => markAsRead(n)}
                        className="
                          flex-1
                          min-w-0
                          rounded-md
                          focus:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-accent
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-1
                          "
                        >
                          <h5
                            className="
                              text-sm
                              md:text-base
                              font-bold
                              text-text-primary
                              truncate
                            "
                          >
                            {n.title}
                          </h5>

                          <span
                            className="
                              text-xs
                              md:text-sm
                              text-tertiary
                              font-mono
                              shrink-0
                            "
                          >
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>

                        <p
                          className="
                            text-xs
                            md:text-sm
                            text-secondary
                            leading-snug
                            mt-0.5
                          "
                        >
                          {n.message}
                        </p>
                      </Link>

                      <button
                        onClick={() => removeNotification(n)}
                        className="
                          text-tertiary
                          hover:text-secondary
                          p-1
                          transition-all
                          duration-200
                          ease-in-out
                          hover:scale-105
                          active:scale-95
                        "
                        title="Remove notification"
                        aria-label="Remove notification"
                      >
                        <FiX
                          className="
                            w-3
                            h-3
                          "
                        />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
