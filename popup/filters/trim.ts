export function trim(value = "", length = 6) {
  if (!value) {
    return "";
  }

  const part0 = value.slice(0, length);
  const part1 = value.slice(value.length - length);

  return `${part0}...${part1}`;
}
