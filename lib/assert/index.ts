export function assert(expressions: boolean, msg: string) {
  if (!expressions) {
    throw new Error(msg);
  }
}
