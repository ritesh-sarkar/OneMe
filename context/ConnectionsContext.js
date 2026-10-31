'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const ConnectionsContext = createContext(null);

function normalizeConnection(connection) {
  const peer = connection.peer || {};
  const contact = connection.contact || {};
  return {
    id: connection.id,
    name: peer.name || 'OneMe contact',
    username: peer.username || '',
    title: peer.title || '',
    company: '',
    location: '',
    avatar: peer.avatar || '',
    dateConnected: connection.dateConnected,
    exchangeMethod: connection.exchangeMethod,
    email: contact.email || '',
    phone: contact.phone || '',
    socials: contact.socials || [],
    resume: contact.resume || null,
    notes: 'Shared with your consent using OneMe Flow.',
  };
}

export function ConnectionsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [connections, setConnections] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedFor, setLoadedFor] = useState(null);
  const [loadError, setLoadError] = useState('');

  const refreshConnections = useCallback(async () => {
    if (!userId) {
      setConnections([]);
      setIsLoaded(true);
      setLoadedFor(null);
      setLoadError('');
      return [];
    }

    const response = await fetch('/api/connections', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Connections could not be loaded.');

    const nextConnections = result.connections.map(normalizeConnection);
    setConnections(nextConnections);
    setLoadedFor(userId);
    setLoadError('');
    setIsLoaded(true);
    return nextConnections;
  }, [userId]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      return () => {
        active = false;
      };
    }

    fetch('/api/connections', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Connections could not be loaded.');
        if (active) {
          setConnections(result.connections.map(normalizeConnection));
          setLoadedFor(userId);
          setLoadError('');
        }
      })
      .catch((error) => {
        if (active) {
          setConnections([]);
          setLoadedFor(userId);
          setLoadError(error.message || 'Connections could not be loaded.');
        }
      })
      .finally(() => {
        if (active) setIsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const removeConnection = async (id) => {
    const response = await fetch('/api/connections', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Connection could not be removed.');
    await refreshConnections();
  };

  const clearAllConnections = async () => {
    const response = await fetch('/api/connections', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Connections could not be removed.');
    await refreshConnections();
  };

  return (
    <ConnectionsContext.Provider
      value={{
        connections: loadedFor === userId ? connections : [],
        isLoaded: !userId || (loadedFor === userId && isLoaded),
        loadError: loadedFor === userId ? loadError : '',
        refreshConnections,
        removeConnection,
        clearAllConnections,
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
