import { Fields } from "config/fields";
import { Themes } from "config/theme";
import { assert } from "lib/assert";
import { BrowserStorage, buildObject } from "lib/storage";
import { INVALID_THEME, SettingsError } from "./errors";

export class ThemeSettings {
  #selected = Themes.System;

  public get selected() {
    return this.#selected;
  }

  public async setTheme(newTheme: Themes) {
    assert(
      newTheme === Themes.Dark ||
        newTheme === Themes.System ||
        newTheme === Themes.Light,
      INVALID_THEME,
      SettingsError,
    );
    this.#selected = newTheme;

    await BrowserStorage.set(buildObject(Fields.UI_THEME, this.selected));
  }

  public async sync(content?: string | Themes | null) {
    if (!content) {
      return this.reset();
    } else if (
      String(content) !== Themes.Dark &&
      String(content) !== Themes.System &&
      String(content) !== Themes.Light
    ) {
      return this.reset();
    }

    this.#selected = content as Themes;
  }

  public async reset() {
    this.#selected = Themes.System;

    await BrowserStorage.set(buildObject(Fields.UI_THEME, this.selected));
  }
}
