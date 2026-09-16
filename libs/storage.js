/**
 * Safe localStorage wrapper that works in Next.js SSR and client environments.
 */
export const storage = {
  get: (key, defaultValue = null) => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(`oneme_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "oneme_${key}":`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`oneme_${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing localStorage key "oneme_${key}":`, error);
    }
  },

  remove: (key) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(`oneme_${key}`);
    } catch (error) {
      console.warn(`Error removing localStorage key "oneme_${key}":`, error);
    }
  },

  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith('oneme_'))
        .forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
      console.warn('Error clearing oneme localStorage keys:', error);
    }
  },
};
