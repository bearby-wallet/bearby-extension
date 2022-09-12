import type { SendResponseParams } from 'types/stream';


export function warpMessage<T>(msg: SendResponseParams): T | null {
  if (!msg) {
    throw new Error('msg is null');
  }

  if (msg.reject) {
    if (msg.reject.name) {
      throw new Error(
        `${msg.reject.name}: ${msg.reject.message}`
      );
    }

    throw new Error(String(msg.reject));
  }

  return msg.resolve as T;
}
