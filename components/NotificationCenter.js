"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiUserCheck,
  FiTrendingUp,
  FiDownload,
  FiGrid,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { DEMO_NOTIFICATIONS } from "@/libs/mock-data";
import { formatTimeAgo } from "@/libs/utils";
import { useToast } from "@/context/ToastContext";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const { success } = useToast();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    success("All notifications marked as read.");
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "connection":
        return <FiUserCheck className="w-4 h-4 text-success" />;
      case "milestone":
        return <FiTrendingUp className="w-4 h-4 text-accent" />;
      case "download":
        return <FiDownload className="w-4 h-4 text-warning" />;
      case "qr":
        return <FiGrid className="w-4 h-4 text-cyan" />;
      default:
        return <FiBell className="w-4 h-4 text-accent" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-subtle bg-surface-panel hover:bg-surface-panel text-secondary hover:text-primary transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <FiBell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[10px] font-bold text-primary flex items-center justify-center border-2 border-subtle">
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
              className="fixed inset-0 z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface-panel border border-subtle shadow-2xl backdrop-blur-xl z-50 p-4 space-y-3"
            >
              <div className="flex items-center justify-between pb-3 border-b border-subtle">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-primary">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-accent-soft text-accent text-[10px] font-mono font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-accent hover:text-accent transition-colors font-medium flex items-center gap-1"
                  >
                    <FiCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        n.read
                          ? "bg-surface-deep/50 border-subtle opacity-70"
                          : "bg-surface-panel/80 border-light"
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-surface-dark/80 shrink-0 mt-0.5">
                        {getIcon(n.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-bold text-primary truncate">
                            {n.title}
                          </h5>
                          <span className="text-[10px] text-muted font-mono shrink-0">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-secondary leading-snug mt-0.5">
                          {n.message}
                        </p>
                      </div>

                      <button
                        onClick={() => removeNotification(n.id)}
                        className="text-muted hover:text-secondary p-1"
                      >
                        <FiX className="w-3 h-3" />
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
