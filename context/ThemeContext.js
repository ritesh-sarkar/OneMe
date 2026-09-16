"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "@/libs/storage";
import { THEMES, getThemeById } from "@/libs/themes";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [currentThemeId, setCurrentThemeId] = useState("cyberpunk");
  const [customOptions, setCustomOptions] = useState({
    accentColor: "#00f2fe",
    cardStyle: "glass",
    fontFamily: "font-mono",
    borderRadius: "16px",
    glowIntensity: "medium",
  });

  useEffect(() => {
    const savedTheme = storage.get("active_theme_id", "cyberpunk");
    const savedCustom = storage.get("custom_theme_options", null);
    if (savedTheme) setCurrentThemeId(savedTheme);
    if (savedCustom) setCustomOptions(savedCustom);
  }, []);

  const setTheme = (themeId) => {
    setCurrentThemeId(themeId);
    storage.set("active_theme_id", themeId);
    const themeObj = getThemeById(themeId);
    if (themeObj) {
      setCustomOptions((prev) => {
        const updated = {
          ...prev,
          accentColor: themeObj.accentColor,
          fontFamily: themeObj.fontFamily,
        };
        storage.set("custom_theme_options", updated);
        return updated;
      });
    }
  };

  const updateCustomOptions = (newOptions) => {
    setCustomOptions((prev) => {
      const updated = { ...prev, ...newOptions };
      storage.set("custom_theme_options", updated);
      return updated;
    });
  };

  const currentTheme = getThemeById(currentThemeId);

  return (
    <ThemeContext.Provider
      value={{
        currentThemeId,
        currentTheme,
        themes: THEMES,
        setTheme,
        customOptions,
        updateCustomOptions,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
