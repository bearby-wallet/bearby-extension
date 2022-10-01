import { Runtime } from 'lib/runtime';


export async function closePopup() {
  try {
    window.close();
  } catch {
    ////
  }

  try {
    const { id } = await Runtime.windows.getCurrent();

    if (String(id)) {
      Runtime.windows.remove(Number(id), console.error);
    }
  } catch {
    ////
  }
}
