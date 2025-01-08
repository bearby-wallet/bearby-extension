export class BaseError extends Error {
  public code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }

  serialize() {
    return {
      message: this.message,
      name: this.name,
      code: this.code,
      stack: this.stack,
    };
  }
}
