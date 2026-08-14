// __tests__/shots.test.js — the store screenshot compositor (IMP-061).
//
// Node-only: no emulator, no maestro. A build chat proves the COMPOSITOR —
// that any capture shape produces one frozen 1080x1920 Play-legal asset. The
// end-to-end capture run is WALK-15.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { PNG } = require('pngjs');

const config = require('../scripts/shots.config');
const { fitRect, stripAlpha, assertPlayLegal, renderShot, LAYOUT } = require('../scripts/shots');

const GEO = {
  canvasW: config.canvas.w,
  top: LAYOUT.top,
  maxW: LAYOUT.maxW,
  bezel: LAYOUT.bezel,
  bottomLimit: LAYOUT.bottomLimit,
};

// A flat solid-colour PNG standing in for an emulator capture.
function synthetic(w, h) {
  const png = new PNG({ width: w, height: h });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 120;
    png.data[i + 1] = 140;
    png.data[i + 2] = 180;
    png.data[i + 3] = 255;
  }
  return PNG.sync.write(png);
}

function header(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), colorType: buf[25] };
}

let tmp;
beforeAll(() => { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shots-')); });
afterAll(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

describe('fitRect — the phone never stretches and never breaches the margin', () => {
  test('a 1440x3120 capture lands inside the bezel budget, centred', () => {
    const r = fitRect({ srcW: 1440, srcH: 3120, ...GEO });
    expect(r.w).toBeLessThanOrEqual(LAYOUT.maxW);
    expect(r.x + r.w / 2).toBeCloseTo(config.canvas.w / 2, 5); // horizontally centred
    expect(r.y + r.h + LAYOUT.bezel).toBeLessThanOrEqual(LAYOUT.bottomLimit);
    // The spec's layout contract, to the pixel.
    expect(r).toEqual({ x: 210, y: 400, w: 660, h: 1430 });
  });

  test.each([
    [1440, 3120],
    [1080, 1920],
    [1080, 2340],
  ])('preserves the source aspect of %ix%i', (srcW, srcH) => {
    const r = fitRect({ srcW, srcH, ...GEO });
    // width is capped, height is derived — nothing is ever stretched
    expect(r.w * (srcH / srcW)).toBeCloseTo(r.h, 1);
    expect(Math.abs(r.h - r.w * (srcH / srcW))).toBeLessThan(0.5);
  });

  test('an absurdly tall source scales down rather than breaching bottomLimit', () => {
    const r = fitRect({ srcW: 1000, srcH: 4000, ...GEO });
    expect(r.y + r.h + LAYOUT.bezel).toBeLessThanOrEqual(LAYOUT.bottomLimit);
    expect(r.w).toBeLessThan(LAYOUT.maxW); // scaled down, not cropped
    expect(r.h / r.w).toBeCloseTo(4, 3);   // aspect still intact
  });
});

describe('the manifest', () => {
  test('every row has an id, a headline and a sub', () => {
    for (const s of config.shots) {
      expect(typeof s.id).toBe('string');
      expect(s.id.length).toBeGreaterThan(0);
      expect(typeof s.headline).toBe('string');
      expect(s.headline.length).toBeGreaterThan(0);
      expect(typeof s.sub).toBe('string');
      expect(s.sub.length).toBeGreaterThan(0);
    }
  });

  test('ids are unique', () => {
    const ids = config.shots.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('shot count stays inside the Play bounds (4-8)', () => {
    // Play allows 2-8; 4+ is the floor for promotional-placement eligibility.
    // Asserted so a future edit cannot quietly drop the set below it.
    expect(config.shots.length).toBeGreaterThanOrEqual(4);
    expect(config.shots.length).toBeLessThanOrEqual(8);
  });

  test('the canvas is 1080x1920 and its aspect is under Play\'s 2:1 ceiling', () => {
    expect(config.canvas).toEqual({ w: 1080, h: 1920 });
    expect(config.canvas.h / config.canvas.w).toBeLessThan(2);
    expect(Math.min(config.canvas.w, config.canvas.h)).toBeGreaterThanOrEqual(1080);
  });
});

describe('the output contract — one canvas, whatever the input', () => {
  // The test that answers "will I get weird sizes". Three input shapes, one
  // output shape.
  test.each([
    [1440, 3120],
    [1080, 2400],
    [1080, 1920],
  ])('a %ix%i capture still produces a 1080x1920 24-bit asset', (srcW, srcH) => {
    const out = path.join(tmp, `res-${srcW}x${srcH}.png`);
    const head = renderShot({
      shot: { id: 'test', headline: 'One question a day.', sub: "That's the whole ritual." },
      srcBuffer: synthetic(srcW, srcH),
      outPath: out,
    });
    expect(head).toMatchObject({ width: 1080, height: 1920, colorType: 2 });
    expect(header(fs.readFileSync(out))).toEqual({ width: 1080, height: 1920, colorType: 2 });
  }, 30000);

  test('an absurdly tall source still yields 1080x1920 rather than throwing or cropping', () => {
    const out = path.join(tmp, 'tall.png');
    const head = renderShot({
      shot: { id: 'tall', headline: 'Tall.', sub: 'Very.' },
      srcBuffer: synthetic(1000, 4000),
      outPath: out,
    });
    expect(head).toMatchObject({ width: 1080, height: 1920, colorType: 2 });
  }, 30000);
});

describe('stripAlpha', () => {
  test('emits colour type 2 with no alpha channel', () => {
    const withAlpha = new PNG({ width: 4, height: 4 });
    for (let i = 0; i < withAlpha.data.length; i += 4) {
      withAlpha.data[i] = 255;
      withAlpha.data[i + 1] = 0;
      withAlpha.data[i + 2] = 0;
      withAlpha.data[i + 3] = 128; // half transparent — must resolve against bg
    }
    const out = stripAlpha(PNG.sync.write(withAlpha));
    expect(header(out).colorType).toBe(2);

    const decoded = PNG.sync.read(out);
    // pngjs always hands back RGBA buffers; what matters is that every alpha
    // byte is opaque and the colour was composited over the page background,
    // not over black.
    for (let i = 3; i < decoded.data.length; i += 4) expect(decoded.data[i]).toBe(255);
    expect(decoded.data[0]).toBeGreaterThan(200); // red, blended toward the cream bg
    expect(decoded.data[1]).toBeGreaterThan(100); // green lifted by the bg, not 0
  });
});

describe('assertPlayLegal — the guard that stops a rejectable asset reaching Play', () => {
  test('throws on a mis-sized PNG, naming the file', () => {
    const bad = path.join(tmp, 'wrong-size.png');
    fs.writeFileSync(bad, synthetic(500, 500));
    expect(() => assertPlayLegal(bad)).toThrow(/wrong-size\.png/);
    expect(() => assertPlayLegal(bad)).toThrow(/500x500/);
  });

  test('accepts a correctly sized 24-bit asset', () => {
    const good = path.join(tmp, 'good.png');
    const rgb = stripAlpha(synthetic(config.canvas.w, config.canvas.h));
    fs.writeFileSync(good, rgb);
    expect(assertPlayLegal(good)).toMatchObject({ width: 1080, height: 1920, colorType: 2 });
  });
});
