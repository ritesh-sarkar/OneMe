'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/libs/storage';
import { DEMO_CONNECTIONS } from '@/libs/mock-data';

const ConnectionsContext = createContext(null);

export function ConnectionsProvider({ children }) {
  const [connections, setConnections] = useState(DEMO_CONNECTIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.get('user_connections', null);
    if (saved) {
      setConnections(saved);
    }
    setIsLoaded(true);
  }, []);

  const addConnection = (peer, method = 'OneMe Flow Radar') => {
    const newConn = {
      id: `conn_${Date.now()}`,
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
      storage.set('user_connections', updated);
      return updated;
    });

    return newConn;
  };

  const removeConnection = (id) => {
    setConnections((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      storage.set('user_connections', updated);
      return updated;
    });
  };

  const clearAllConnections = () => {
    setConnections([]);
    storage.set('user_connections', []);
  };

  const resetConnections = () => {
    setConnections(DEMO_CONNECTIONS);
    storage.set('user_connections', DEMO_CONNECTIONS);
  };

  return (
    <ConnectionsContext.Provider
      value={{
        connections,
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
