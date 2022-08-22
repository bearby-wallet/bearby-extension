
export function tohexString(hex: string) {
  return String(hex).toLowerCase().replace('0x', '');
}

export const isByteString = (str: string, len: number) => {
  return Boolean(tohexString(str).match(`^[0-9a-fA-F]{${len}}$`));
};
