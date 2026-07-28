// Utility to export front and back images side‑by‑side as a printable PNG.
// The resulting image will be 7 cm × 9.5 cm per side (≈300 DPI) in print size.

/**
 * Export two images (front & back) side‑by‑side into a single PNG.
 * @param {string} frontSrc - Source URL, data URL, or blob URL for the front side.
 * @param {string} backSrc  - Source URL, data URL, or blob URL for the back side.
 * @param {Object} [options] - Optional configuration.
 * @param {number} [options.dpi=300] - Desired DPI for print quality.
 * @param {number} [options.printWidthCm=7] - Width of a single side in centimeters.
 * @param {number} [options.printHeightCm=9.5] - Height of a single side in centimeters.
 * @param {boolean} [options.autoDownload=true] - If true, triggers a download automatically.
 * @param {string} [options.filename='front_back.png'] - Filename for the downloaded PNG.
 * @returns {Promise<Blob>} Resolves with the generated PNG Blob.
 */
export async function exportFrontBackPNG(frontSrc, backSrc, options = {}) {
  const {
    dpi = 300,
    printWidthCm = 7.0,   // Default to 7 cm width per side as requested by the user
    printHeightCm = 9.8,   // Default to 9.8 cm height to match 5:7 aspect ratio
    autoDownload = true,
    filename = 'front_back.png',
  } = options;

  // Convert cm to inches, then to pixels.
  const inchesW = printWidthCm / 2.54; // per side
  const inchesH = printHeightCm / 2.54;
  const pxW = Math.round(inchesW * dpi);
  const pxH = Math.round(inchesH * dpi);

  // Helper to load an image.
  const loadImg = src =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image: ' + src));
      img.src = src;
    });

  const [frontImg, backImg] = await Promise.all([loadImg(frontSrc), loadImg(backSrc)]);

  // Create canvas sized for two images side‑by‑side.
  const canvas = document.createElement('canvas');
  canvas.width = pxW * 2; // two sides side-by-side
  canvas.height = pxH;
  const ctx = canvas.getContext('2d');

  // Fill background (transparent/clear)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the images, scaling to the target dimensions.
  ctx.drawImage(frontImg, 0, 0, pxW, pxH);
  ctx.drawImage(backImg, pxW, 0, pxW, pxH);

  // Convert canvas to Blob (PNG).
  const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));

  if (autoDownload && blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return blob;
}
