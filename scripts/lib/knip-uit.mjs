/**
 * Knipt de witte studio-achtergrond uit een foto en geeft een sharp-instantie
 * terug met alleen het onderwerp (doorzichtig eromheen, bijgesneden).
 *
 * Werkt met een flood fill vanaf de randen, zodat lichte vlakken bínnen het
 * onderwerp (monitor, naambordje) blijven staan.
 */
import sharp from "sharp";

const WORK_WIDTH = 2400; // 2x de eindbreedte, zodat de rand na verkleinen zacht wordt

export async function knipUit(bron, { outWidth = 1200 } = {}) {
  const { data, info } = await sharp(bron)
    .resize({ width: WORK_WIDTH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  /** Bijna wit en vrijwel kleurloos: de studio-achtergrond. */
  function isBackground(i, minBrightness) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return min >= minBrightness && max - min <= 14;
  }

  const transparent = new Uint8Array(width * height);
  const stack = new Int32Array(width * height);
  let top = 0;

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (transparent[p]) return;
    if (!isBackground(p * channels, 232)) return;
    transparent[p] = 1;
    stack[top++] = p;
  };

  const drain = () => {
    const filled = [];
    while (top > 0) {
      const p = stack[--top];
      filled.push(p);
      const x = p % width;
      const y = (p - x) / width;
      push(x - 1, y);
      push(x + 1, y);
      push(x, y - 1);
      push(x, y + 1);
    }
    return filled;
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  drain();

  // De teal lijn sluit een paar witte vlakken volledig in; die worden hierboven
  // niet bereikt. Alleen grote vlakken weghalen, zodat kleine lichte details in
  // het onderwerp (tanden, opschriften) blijven staan.
  const ENCLOSED_MIN_AREA = Math.round(width * height * 0.001);
  for (let p = 0; p < transparent.length; p++) {
    if (transparent[p] || !isBackground(p * channels, 232)) continue;
    push(p % width, (p - (p % width)) / width);
    const region = drain();
    if (region.length < ENCLOSED_MIN_AREA) for (const q of region) transparent[q] = 2;
  }
  for (let p = 0; p < transparent.length; p++) if (transparent[p] === 2) transparent[p] = 0;

  // Twee erosiepassages met een lossere drempel halen de lichte halo rond
  // het onderwerp weg die anders als witte rand zichtbaar blijft.
  for (let pass = 0; pass < 2; pass++) {
    const edge = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        if (transparent[p]) continue;
        const neighbourTransparent =
          (x > 0 && transparent[p - 1]) ||
          (x < width - 1 && transparent[p + 1]) ||
          (y > 0 && transparent[p - width]) ||
          (y < height - 1 && transparent[p + width]);
        if (neighbourTransparent && isBackground(p * channels, 215)) edge.push(p);
      }
    }
    for (const p of edge) transparent[p] = 1;
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (transparent[p]) {
        data[p * channels + 3] = 0;
        continue;
      }
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;

  return {
    cutout: sharp(data, { raw: { width, height, channels } })
      .extract({ left: minX, top: minY, width: cropWidth, height: cropHeight })
      .resize({ width: outWidth }),
    cropWidth,
    cropHeight,
    width,
    height,
  };
}

/**
 * Variant voor beelden op een effen magenta achtergrond (chroma key). Werkt ook
 * bij witte kleding, waar de witte-achtergrondmethode gaten in slaat.
 */
export async function knipUitChroma(bron, { outWidth = 1200 } = {}) {
  const { data, info } = await sharp(bron)
    .resize({ width: WORK_WIDTH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Magenta-heid: rood en blauw hoog, groen laag. Achtergrond scoort ~255.
      const magenta = Math.min(r, b) - g;
      // Vloeiend van doorzichtig (>= 170) naar dekkend (<= 90).
      const alpha = Math.max(0, Math.min(1, (170 - magenta) / 80));
      if (alpha === 0) {
        data[i + 3] = 0;
        continue;
      }
      // Ontspillen: aan de rand kleurt het onderwerp wat magenta mee.
      if (magenta > 20 && alpha < 1) {
        const doel = g;
        data[i] = Math.round(r * alpha + doel * (1 - alpha));
        data[i + 2] = Math.round(b * alpha + doel * (1 - alpha));
      }
      data[i + 3] = Math.round(alpha * 255);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  return {
    cutout: sharp(data, { raw: { width, height, channels } })
      .extract({ left: minX, top: minY, width: cropWidth, height: cropHeight })
      .resize({ width: outWidth }),
    cropWidth,
    cropHeight,
    width,
    height,
  };
}
