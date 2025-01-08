import type { ReqBody } from "types";

type Listener = (...args: ReqBody[]) => void;

export class Subject {
  readonly #events: Listener[] = [];

  public on(listener: Listener): () => void {
    this.#events.push(listener);
    return () => this.removeListener(listener);
  }

  public removeListener(listener: Listener): void {
    const idx: number = this.#events.indexOf(listener);
    if (idx > -1) this.#events.splice(idx, 1);
  }

  public removeAllListeners(): void {
    this.#events.splice(0, this.#events.length);
  }

  public emit(...args: ReqBody[]): void {
    this.#events.forEach((listener) => listener.apply(this, args));
  }

  public once(listener: Listener): void {
    const remove: () => void = this.on((...args: ReqBody[]) => {
      remove();
      listener.apply(this, args);
    });
  }
}
