#!/usr/bin/env node
// scripts/shots.js — the compositor. Raw emulator capture -> framed Play asset.
//
// The output contract is frozen: every phone screenshot is exactly 1080 x 1920,
// 24-bit RGB, no alpha. The emulator's resolution changes what the *inner* phone
// picture looks like and nothing else. A 1440x3120, a 1080x2400 and a 1080x1920
// capture all produce the identical 1080x1920 asset -- only the phone drawn
// inside it is taller or shorter.
//
// Nothing here is bundled: node runs this file directly, it is never imported
// by the app. Driven by `npm run shots` (see scripts/shots.sh).

const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const { PNG } = require('pngjs');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = require('./shots.config');

// Geometry constants, checked against a 1440x3120 source: it lands 660 x 1430
// at y 400-1830, bezel bottom 1844, clear of the 1880 limit.
const LAYOUT = {
  top: 400,
  maxW: 660,
  bezel: 14,
  bottomLimit: 1880,
  radiusOuter: 46,
  radiusInner: 34,
  headlineY: 180,
  headlineSize: 62,
  subY: 258,
  subSize: 40,
};

// ---------------------------------------------------------------- geometry --

// Fit a raw capture (any phone aspect) into the canvas as a bezelled phone.
// Returns the SCREEN rect; the bezel is drawn `bezel` px outside it.
// Guarantees: horizontally centred, never wider than maxW, and the bezel's
// bottom edge never passes `bottomLimit`.
function fitRect({ srcW, srcH, canvasW, top, maxW, bezel, bottomLimit }) {
  const aspect = srcH / srcW;
  let w = maxW;
  let h = w * aspect;

  // A source tall enough to breach the bottom margin is scaled down, never cropped.
  const maxH = bottomLimit - bezel - top;
  if (h > maxH) {
    h = maxH;
    w = h / aspect;
  }

  return { x: (canvasW - w) / 2, y: top, w, h };
}

// ------------------------------------------------------------------- pixels --

function parseHeader(buf) {
  const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 26 || !buf.subarray(0, 8).equals(SIG)) return null;
  if (buf.toString('ascii', 12, 16) !== 'IHDR') return null;
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    bitDepth: buf[24],
    colorType: buf[25],
  };
}

function hexToRgb(hex) {
  const s = hex.replace('#', '');
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16),
  };
}

// resvg emits 32-bit RGBA; Play's documented screenshot format is 24-bit PNG
// *without* alpha. Composite over the real background first, so any antialiased
// edge resolves against the page colour rather than black.
function stripAlpha(buffer, bgHex = CONFIG.colors.bg) {
  const src = PNG.sync.read(buffer);
  const bg = hexToRgb(bgHex);
  const out = new PNG({ width: src.width, height: src.height });

  for (let i = 0; i < src.data.length; i += 4) {
    const a = src.data[i + 3] / 255;
    out.data[i] = Math.round(src.data[i] * a + bg.r * (1 - a));
    out.data[i + 1] = Math.round(src.data[i + 1] * a + bg.g * (1 - a));
    out.data[i + 2] = Math.round(src.data[i + 2] * a + bg.b * (1 - a));
    out.data[i + 3] = 255;
  }

  return PNG.sync.write(out, { colorType: 2, inputHasAlpha: true });
}

// The guard that means a wrong-sized asset can never silently reach Play Console:
// a rejectable asset must fail the build here, not at upload.
function assertPlayLegal(filePath, canvas = CONFIG.canvas) {
  const name = path.basename(filePath);
  const head = parseHeader(fs.readFileSync(filePath));
  if (!head) throw new Error(`${name}: not a readable PNG`);
  if (head.width !== canvas.w || head.height !== canvas.h) {
    throw new Error(`${name}: is ${head.width}x${head.height}, must be ${canvas.w}x${canvas.h}`);
  }
  if (head.colorType !== 2) {
    throw new Error(`${name}: colour type ${head.colorType}, must be 2 (truecolour, no alpha)`);
  }
  return head;
}

// ---------------------------------------------------------------------- svg --

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSvg({ shot, srcBuffer, config = CONFIG }) {
  const { canvas, colors } = config;
  const head = parseHeader(srcBuffer);
  if (!head) throw new Error(`${shot.id}: raw capture is not a readable PNG`);

  const r = fitRect({
    srcW: head.width,
    srcH: head.height,
    canvasW: canvas.w,
    top: LAYOUT.top,
    maxW: LAYOUT.maxW,
    bezel: LAYOUT.bezel,
    bottomLimit: LAYOUT.bottomLimit,
  });

  const b = {
    x: r.x - LAYOUT.bezel,
    y: r.y - LAYOUT.bezel,
    w: r.w + LAYOUT.bezel * 2,
    h: r.h + LAYOUT.bezel * 2,
  };
  const mid = canvas.w / 2;
  const data = `data:image/png;base64,${srcBuffer.toString('base64')}`;

  // Flat and front-on by decision: a rounded rect, a hairline stroke and a
  // punch-hole camera circle. No tilt, no perspective, no shadow, no gloss.
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.w}" height="${canvas.h}" viewBox="0 0 ${canvas.w} ${canvas.h}">
  <defs>
    <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${colors.accent}" stop-opacity="0"/>
      <stop offset="1" stop-color="${colors.accent}" stop-opacity="0.06"/>
    </linearGradient>
    <clipPath id="screen">
      <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${LAYOUT.radiusInner}" ry="${LAYOUT.radiusInner}"/>
    </clipPath>
  </defs>

  <rect x="0" y="0" width="${canvas.w}" height="${canvas.h}" fill="${colors.bg}"/>
  <rect x="0" y="0" width="${canvas.w}" height="${canvas.h}" fill="url(#wash)"/>

  <text x="${mid}" y="${LAYOUT.headlineY}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="${LAYOUT.headlineSize}" fill="${colors.ink}">${esc(shot.headline)}</text>
  <text x="${mid}" y="${LAYOUT.subY}" text-anchor="middle" font-family="Baloo 2" font-weight="500" font-size="${LAYOUT.subSize}" fill="${colors.ink}" fill-opacity="0.62">${esc(shot.sub)}</text>

  <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${LAYOUT.radiusOuter}" ry="${LAYOUT.radiusOuter}" fill="${colors.ink}" stroke="${colors.accentDeep}" stroke-opacity="0.35" stroke-width="1"/>
  <image xlink:href="${data}" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" preserveAspectRatio="none" clip-path="url(#screen)"/>
  <circle cx="${mid}" cy="${r.y + 22}" r="7" fill="${colors.ink}" fill-opacity="0.85"/>
</svg>`;
}

// ------------------------------------------------------------------ render --

function fontFiles(config = CONFIG) {
  return Object.values(config.fonts).map((p) => path.resolve(ROOT, p));
}

// The write path is fixed, in this order: rasterize -> strip alpha -> write ->
// re-read the file we just wrote and prove it is Play-legal.
function renderShot({ shot, srcBuffer, outPath, config = CONFIG }) {
  const svg = buildSvg({ shot, srcBuffer, config });

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: config.canvas.w },
    // Deliberate: rendering is identical on every machine instead of silently
    // substituting whatever font the host happens to have installed.
    font: { fontFiles: fontFiles(config), loadSystemFonts: false },
  }).render().asPng();

  const rgb = stripAlpha(png, config.colors.bg);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rgb);
  return assertPlayLegal(outPath, config.canvas);
}

function buildAll({ config = CONFIG, rawDir, outDir } = {}) {
  const raw = rawDir || path.join(ROOT, 'store', 'raw');
  const out = outDir || path.join(ROOT, 'store', 'play');

  return config.shots.map((shot) => {
    const src = path.join(raw, `${shot.id}.png`);
    // A silently-skipped shot is how a listing ends up with five screenshots
    // when it should have seven.
    if (!fs.existsSync(src)) {
      throw new Error(`missing raw capture for "${shot.id}" — expected ${path.relative(ROOT, src)}`);
    }
    const outPath = path.join(out, `${shot.id}.png`);
    const head = renderShot({ shot, srcBuffer: fs.readFileSync(src), outPath, config });
    return { id: shot.id, path: outPath, ...head };
  });
}

module.exports = { fitRect, stripAlpha, assertPlayLegal, buildSvg, renderShot, buildAll, LAYOUT };

if (require.main === module) {
  try {
    const results = buildAll();
    for (const r of results) {
      console.log(`  ${r.id}.png  ${r.width}x${r.height}  colourType ${r.colorType}`);
    }
    console.log(`\n${results.length} Play screenshots written to store/play/`);
  } catch (err) {
    console.error(`\nshots: ${err.message}\n`);
    process.exit(1);
  }
}
