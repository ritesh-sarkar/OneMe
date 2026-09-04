'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/libs/storage';
import { DEMO_USER } from '@/libs/mock-data';

const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = {
  email: 'demo@oneme.app',
  password: 'OneMe123!',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount
    const savedUser = storage.get('auth_user', null);
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600)); // Smooth realistic latency

    if (
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase() &&
      password === DEMO_CREDENTIALS.password
    ) {
      const authUser = {
        ...DEMO_USER,
        lastLogin: new Date().toISOString(),
      };
      setUser(authUser);
      storage.set('auth_user', authUser);
      setIsLoading(false);
      return { success: true };
    }

    // Allow quick custom login with email format for demo flexibility if needed
    if (email.includes('@') && password.length >= 6) {
      const customUser = {
        ...DEMO_USER,
        email: email.trim().toLowerCase(),
        lastLogin: new Date().toISOString(),
      };
      setUser(customUser);
      storage.set('auth_user', customUser);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Invalid credentials. Use demo@oneme.app and OneMe123!',
    };
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const authUser = {
      ...DEMO_USER,
      name: 'Ritesh Sarkar (Google)',
      lastLogin: new Date().toISOString(),
    };
    setUser(authUser);
    storage.set('auth_user', authUser);
    setIsLoading(false);
    return { success: true };
  };

  const signup = async (name, email, password) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const newUser = {
      ...DEMO_USER,
      name: name || DEMO_USER.name,
      email: email || DEMO_USER.email,
      username: (name || 'user').toLowerCase().replace(/\s+/g, ''),
      lastLogin: new Date().toISOString(),
    };
    setUser(newUser);
    storage.set('auth_user', newUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    storage.remove('auth_user');
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
        demoCredentials: DEMO_CREDENTIALS,
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
