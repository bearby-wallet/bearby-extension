import { Themes } from "config/theme";

export function themeDetect() {
  const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
  const isDark = Boolean(darkThemeMq.matches);

  return isDark ? Themes.Dark : Themes.Light;
}
