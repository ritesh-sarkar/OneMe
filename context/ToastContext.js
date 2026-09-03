'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiCheck } from 'react-icons/fi';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = {
      id,
      title: toast.title || '',
      message: toast.message || '',
      type: toast.type || 'info', // 'success' | 'error' | 'info' | 'warning'
      duration: toast.duration || 4000,
      action: toast.action || null,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message, title = 'Success') => {
    addToast({ title, message, type: 'success' });
  }, [addToast]);

  const error = useCallback((message, title = 'Error') => {
    addToast({ title, message, type: 'error' });
  }, [addToast]);

  const info = useCallback((message, title = 'Information') => {
    addToast({ title, message, type: 'info' });
  }, [addToast]);

  const warning = useCallback((message, title = 'Attention') => {
    addToast({ title, message, type: 'warning' });
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{ addToast, removeToast, success, error, info, warning }}
    >
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${
                toast.type === 'success'
                  ? 'bg-zinc-900/95 border-emerald-500/30 text-zinc-100 shadow-emerald-500/10'
                  : toast.type === 'error'
                  ? 'bg-zinc-900/95 border-rose-500/30 text-zinc-100 shadow-rose-500/10'
                  : toast.type === 'warning'
                  ? 'bg-zinc-900/95 border-amber-500/30 text-zinc-100 shadow-amber-500/10'
                  : 'bg-zinc-900/95 border-indigo-500/30 text-zinc-100 shadow-indigo-500/10'
              }`}
            >
              <div className="mt-0.5 shrink-0 text-lg">
                {toast.type === 'success' && <FiCheckCircle className="text-emerald-400" />}
                {toast.type === 'error' && <FiAlertCircle className="text-rose-400" />}
                {toast.type === 'warning' && <FiAlertCircle className="text-amber-400" />}
                {toast.type === 'info' && <FiInfo className="text-indigo-400" />}
              </div>
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-sm font-semibold text-white leading-tight">
                    {toast.title}
                  </h4>
                )}
                {toast.message && (
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                )}
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action.onClick();
                      removeToast(toast.id);
                    }}
                    className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                aria-label="Close notification"
              >
                <FiX className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
