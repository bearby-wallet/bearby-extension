import { createIcon } from '@download/blockies';


export function generateBlockies(address: string, element: HTMLElement) {
  const icon = createIcon({
    seed: address,
    color: '#ac59ff',
    bgcolor: '#000000',
    size: 13,
    scale: 3
  });

  icon.style.borderRadius = '100%';

  element.appendChild(icon);
}
