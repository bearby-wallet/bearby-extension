import { Fields } from 'config/fields';
import { Themes } from 'config/theme';
import { assert } from 'lib/assert';
import { BrowserStorage, buildObject } from 'lib/storage';
import { INVALID_THEME, SettingsError } from './errors';


export class ThemeSettings {
  #theme = Themes.System;

  public get theme() {
    return this.#theme;
  }

  public async setTheme(newTheme: Themes) {
    assert(
      newTheme === Themes.Dark || newTheme === Themes.System || newTheme === Themes.Light,
      INVALID_THEME,
      SettingsError
    );
    this.#theme = newTheme;

    await BrowserStorage.set(
      buildObject(Fields.UI_THEME, this.theme)
    );
  }

  public async syncTheme(content?: string | Themes| null) {
    if (!content) {
      return this.resetTheme();
    }

    this.#theme = content as Themes;
  }

  public async resetTheme() {
    this.#theme = Themes.System;

    await BrowserStorage.set(
      buildObject(Fields.UI_THEME, this.theme)
    );
  }
}
