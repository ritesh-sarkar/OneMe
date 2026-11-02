import { getThemeById } from "./themes.js";

export function getCursorTheme(themeId, customAccent) {
  const theme = getThemeById(themeId);
  const accent = customAccent || theme.accentColor;

  return {
    accent,
    secondary: theme.secondaryColor || accent,
  };
}
