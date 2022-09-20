import { Themes } from "config/theme";


export function themeDetect() {
  const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");

  return darkThemeMq.matches ? Themes.Dark : Themes.Light;
}
