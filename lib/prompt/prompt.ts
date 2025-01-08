import { Runtime } from "lib/runtime";
import { POPUP_HEIGHT, POPUP_WIDTH, PROMT_PAGE } from "config/common";

export class PromptService {
  readonly #height = POPUP_HEIGHT;
  readonly #width = POPUP_WIDTH;
  readonly #type = "popup";

  #id?: number;
  #enabled = true;

  get enabled() {
    return this.#enabled;
  }

  constructor(enabled: boolean) {
    this.#enabled = enabled;
  }

  openTab() {
    Runtime.tabs.create({
      url: String(PROMT_PAGE),
    });
  }

  async open(): Promise<void> {
    if (!this.#enabled) return;

    const createData: object = {
      type: this.#type,
      url: `${PROMT_PAGE}?type=${this.#type}`,
      width: this.#width,
      height: this.#height,
      focused: true,
    };
    try {
      const lastPopups = await this.#getPopup();

      if (lastPopups && lastPopups.length > 0) {
        for (let index = 0; index < lastPopups.length; index++) {
          const popup = lastPopups[index];

          Runtime.windows.remove(Number(popup.id), console.error);
        }
      }

      Runtime.windows.create(createData, (tab: any) => {
        if (tab) {
          this.#id = Number(tab.id);
        }
      });
    } catch (err) {
      console.warn(err);
    }
  }

  #getPopup(): Promise<chrome.windows.Window[]> {
    return new Promise((resolve) => {
      Runtime.windows.getAll({}, (tabs: any[]) => {
        const list = tabs.filter((tab) => tab.type === this.#type);
        resolve(list);
      });
    });
  }
}
