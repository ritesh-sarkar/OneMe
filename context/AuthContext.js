'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

const AuthContext = createContext(null);

async function getSessionUser() {
  const response = await fetch('/api/auth/session', {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Unable to load the account session.');
  const session = await response.json();
  return session?.user || null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { error: toastError } = useToast();

  const refreshSession = useCallback(async () => {
    const sessionUser = await getSessionUser();
    setUser(sessionUser);
    return sessionUser;
  }, []);

  useEffect(() => {
    let active = true;
    getSessionUser()
      .then((sessionUser) => {
        if (active) setUser(sessionUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error || !result?.ok) {
        return {
          success: false,
          error: 'Unable to sign in with those details. Check your credentials and email verification.',
        };
      }

      const sessionUser = await refreshSession();
      if (!sessionUser) {
        return { success: false, error: 'Unable to establish a secure session. Please try again.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Sign-in is temporarily unavailable. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name, username, email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.error || 'Unable to create an account.' };
      }
      return { success: true, message: result.message };
    } catch {
      return { success: false, error: 'Registration is temporarily unavailable. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      setUser(null);
      router.push('/login');
    } catch {
      toastError('Unable to end the session right now. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
