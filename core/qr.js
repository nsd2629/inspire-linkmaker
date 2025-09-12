
// Optional QR helper. Requires a QRCode library to be loaded separately if used.
// Ensures error correction level H, margin 4, and integer scaling.
export function renderQR(el, text){
  if (!window.QRCode) {
    console.warn('QRCode lib not found. Skipping QR render.');
    return;
  }
  const size = 600; // render big, then scale down on print (ensure integer ratio)
  const opts = {
    text, width:size, height:size, margin:4,
    correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.H : undefined
  };
  // Clear previous
  el.innerHTML = '';
  new window.QRCode(el, opts);
}
