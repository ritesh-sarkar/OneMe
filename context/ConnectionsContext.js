'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/libs/storage';
import { DEMO_CONNECTIONS } from '@/libs/mock-data';
import { useAuth } from '@/context/AuthContext';

const ConnectionsContext = createContext(null);

export function ConnectionsProvider({ children }) {
  const { user } = useAuth();
  const storageKey = (key) => user ? `${key}_account_${user.id}` : key;
  const [connections, setConnections] = useState(DEMO_CONNECTIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.get(storageKey('user_connections'), null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConnections(saved || (user ? [] : DEMO_CONNECTIONS));
    setIsLoaded(true);
  }, [user]);

  const visibleConnections = user
    ? connections.filter((connection) => connection.ownerId === user.id)
    : connections.filter((connection) => !connection.ownerId);

  const addConnection = (peer, method = 'OneMe Flow Radar') => {
    const newConn = {
      id: `conn_${Date.now()}`,
      ownerId: user?.id || null,
      name: peer.name || 'New Contact',
      username: peer.username || 'contact',
      title: peer.title || 'Professional',
      company: peer.company || 'Tech Pioneer',
      location: peer.location || 'Global',
      avatar: peer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      dateConnected: new Date().toISOString(),
      exchangeMethod: method,
      email: peer.email || `${peer.username || 'contact'}@demo.app`,
      phone: peer.phone || '+1 (555) 019-2831',
      notes: peer.notes || 'Connected via OneMe Contact Exchange.',
    };

    setConnections((prev) => {
      // Check if already connected by username
      const filtered = prev.filter((c) => c.username !== newConn.username);
      const updated = [newConn, ...filtered];
      storage.set(storageKey('user_connections'), updated);
      return updated;
    });

    return newConn;
  };

  const removeConnection = (id) => {
    setConnections((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      storage.set(storageKey('user_connections'), updated);
      return updated;
    });
  };

  const clearAllConnections = () => {
    setConnections([]);
    storage.set(storageKey('user_connections'), []);
  };

  const resetConnections = () => {
    const resetConnections = user ? [] : DEMO_CONNECTIONS;
    setConnections(resetConnections);
    storage.set(storageKey('user_connections'), resetConnections);
  };

  return (
    <ConnectionsContext.Provider
      value={{
        connections: visibleConnections,
        isLoaded,
        addConnection,
        removeConnection,
        clearAllConnections,
        resetConnections,
      }}
    >
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections() {
  const context = useContext(ConnectionsContext);
  if (!context) {
    throw new Error('useConnections must be used within a ConnectionsProvider');
  }
  return context;
}
