/**
 * Font loader utility ensuring web fonts are ready before canvas drawing.
 * Includes a safety timeout so rendering never blocks if offline or slow connection.
 */
export async function ensureFontsLoaded() {
  if (typeof document === 'undefined' || !document.fonts) {
    return true;
  }

  try {
    const readyPromise = document.fonts.ready;
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 350));
    await Promise.race([readyPromise, timeoutPromise]);
    return true;
  } catch (err) {
    return false;
  }
}
