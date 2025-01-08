import { Runtime } from "lib/runtime";
import { getExtensionURL } from "lib/runtime/get-url";

export class NotificationController {
  readonly #url: string;
  readonly #title: string;
  readonly #message: string;

  constructor(url: string, title: string, message: string) {
    this.#url = url;
    this.#title = title;
    this.#message = message;
  }

  create() {
    try {
      const data: chrome.notifications.NotificationOptions<true> = {
        type: "basic",
        title: this.#title,
        iconUrl: getExtensionURL("/icons/128.png"),
        message: this.#message,
      };
      Runtime.notifications.create(this.#url, data);

      this.#notificationClicked();
    } catch (err) {
      console.error(err);
    }
  }

  #notificationClicked() {
    if (
      !Runtime.notifications.onClicked.hasListener(this.#viewOnBlockExplorer)
    ) {
      Runtime.notifications.onClicked.addListener(this.#viewOnBlockExplorer);
    }
  }

  #viewOnBlockExplorer(url: string) {
    Runtime.tabs.create({ url });
  }
}
