#!/usr/bin/env node
// gen-design-system.js — builds design-system/ from the app's REAL source (IMP-078).
//
// WHY GENERATED, NEVER HAND-WRITTEN: hand-copied hex drifts the first time the
// accent palette changes; generated output cannot. Everything here is read from
// src/theme.js (makeTheme), src/data.js (SHOP_PALETTES) and src/art.js (the
// frozen celestial set) — this file owns layout and captions, never values.
//
// It emits:
//   design-system/tokens/{color,type,shape,elevation}.html
//   design-system/frozen/celestial.html  + frozen/*.png  (rasterised from art.js)
//
// The other cards (motion/, components/, screens/) are hand-written previews;
// they are not derived from source and so are not generated here.
//
// HOW IT LOADS RN SOURCE IN NODE: src/*.js is ESM + JSX importing react-native
// and react-native-svg, neither of which parses under plain node. We install a
// require hook (babel: JSX + modules-commonjs) and stub both native packages —
// react-native-svg maps to plain DOM SVG tags, react-native's View/Animated.View
// map to <g>, so a component tree renders straight into an SVG document via
// react-dom/server. Animated.Value.interpolate() returns its FIRST output value,
// i.e. the frame at t=0 — which is what "frozen" means here.
//
// Run: node scripts/gen-design-system.js

const fs = require('fs');
const path = require('path');
const Module = require('module');
const babel = require('@babel/core');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'design-system');
const SRC = path.join(ROOT, 'src');

// ── 1. require hook: transpile src/*.js (ESM + JSX) for node ──────────────────
const origJs = Module._extensions['.js'];
Module._extensions['.js'] = function (mod, filename) {
  if (!filename.startsWith(SRC)) return origJs(mod, filename);
  const code = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename,
    babelrc: false,
    configFile: false,
    plugins: [
      ['@babel/plugin-transform-react-jsx', { runtime: 'classic' }],
      '@babel/plugin-transform-modules-commonjs',
    ],
  }).code;
  mod._compile(code, filename);
};

// ── 2. stub the two native packages ───────────────────────────────────────────
const React = require('react');

// Layout containers become <g>. Only opacity survives — position/size are layout,
// not artwork, and the frozen exports are rasterised at the component's own size.
const gLike = (props) => {
  const o = props && props.style
    ? [].concat(props.style).reduce((a, s) => (s && typeof s.opacity === 'number' ? s.opacity : a), undefined)
    : undefined;
  return React.createElement('g', o === undefined ? null : { opacity: o }, props.children);
};

function AnimatedValue(v) { this._v = v; }
// The frozen frame: t=0, so an interpolation resolves to its first output value.
AnimatedValue.prototype.interpolate = function ({ outputRange }) { return outputRange[0]; };

const noopAnim = () => ({ start() {}, stop() {} });
const RN_STUB = {
  View: gLike,
  Animated: {
    View: gLike,
    Value: AnimatedValue,
    loop: noopAnim, timing: noopAnim, sequence: noopAnim, stagger: noopAnim, spring: noopAnim,
  },
  Easing: new Proxy({}, { get: () => (x) => x }),
  StyleSheet: { absoluteFill: {}, create: (o) => o, flatten: (o) => o },
  Platform: { OS: 'android', select: (o) => (o.android !== undefined ? o.android : o.default) },
};

// react-native-svg → plain DOM SVG tags. react-dom converts camelCase SVG props
// (strokeWidth, stopColor, clipPath, fillOpacity…) to dashed attributes for us.
const SVG_STUB = Object.assign(
  (props) => React.createElement('svg', props),
  {
    default: (props) => React.createElement('svg', props),
    Svg: 'svg', Circle: 'circle', Line: 'line', G: 'g', Defs: 'defs',
    RadialGradient: 'radialGradient', LinearGradient: 'linearGradient',
    Stop: 'stop', ClipPath: 'clipPath', Path: 'path', Rect: 'rect',
    Ellipse: 'ellipse', Polygon: 'polygon', Text: 'text',
  }
);

const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'react-native') return RN_STUB;
  if (request === 'react-native-svg') return SVG_STUB;
  return origLoad.apply(this, arguments);
};

// ── 3. now the real app source loads ──────────────────────────────────────────
const { renderToStaticMarkup } = require('react-dom/server');
const { Resvg } = require('@resvg/resvg-js');
const theme = require(path.join(SRC, 'theme.js'));
const data = require(path.join(SRC, 'data.js'));
const art = require(path.join(SRC, 'art.js'));

const { makeTheme, DEFAULT_SETTINGS, ThemeContext } = theme;
const { SHOP_PALETTES } = data;

// Every shipped accent set × both modes. `swatch` is [accent, deep, soft].
const THEMES = [];
for (const p of SHOP_PALETTES) {
  for (const mode of ['day', 'night']) {
    THEMES.push({
      id: `${p.id}-${mode}`,
      paletteName: p.name,
      paletteId: p.id,
      tier: p.tier,
      mode,
      t: makeTheme(mode, { ...DEFAULT_SETTINGS, accent: p.swatch }),
    });
  }
}
const DEFAULT_DAY = THEMES.find((x) => x.id === 'goldenhour-day').t;
const DEFAULT_NIGHT = THEMES.find((x) => x.id === 'goldenhour-night').t;

// ── shared page chrome ────────────────────────────────────────────────────────
// Deliberately monochrome and neutral: the page frame must never be mistaken for
// the app's own visual language, or Claude Design will copy the frame too.
const PAGE_CSS = `
  *,*::before,*::after{box-sizing:border-box}
  body{margin:0;padding:32px;font:15px/1.55 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
       color:#18181b;background:#fafafa}
  h1{font-size:24px;margin:0 0 4px;letter-spacing:-.01em}
  h2{font-size:15px;margin:36px 0 12px;text-transform:uppercase;letter-spacing:.08em;color:#71717a}
  .lede{margin:0 0 8px;color:#52525b;max-width:70ch}
  .rule{border:0;border-top:1px solid #e4e4e7;margin:28px 0}
  .note{border-left:3px solid #a1a1aa;padding:10px 14px;background:#f4f4f5;margin:16px 0;max-width:80ch}
  .note strong{color:#18181b}
  code{font:13px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;background:#f4f4f5;padding:1px 5px;border-radius:4px}
  table{border-collapse:collapse;width:100%;max-width:900px;margin:12px 0}
  th,td{text-align:left;padding:7px 10px;border-bottom:1px solid #e4e4e7;vertical-align:top}
  th{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#71717a;font-weight:600}
  td code{background:none;padding:0}
  .grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));max-width:1100px}
  .sw{border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;background:#fff}
  .sw .chip{height:56px}
  .sw .nm{font:12px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;padding:7px 8px;border-top:1px solid #e4e4e7;
          word-break:break-all;color:#3f3f46}
  .modes{display:grid;gap:22px;grid-template-columns:repeat(auto-fit,minmax(430px,1fr));max-width:1100px}
  .pane{border:1px solid #e4e4e7;border-radius:12px;padding:16px;background:#fff}
  .pane h3{margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:#71717a}
`;

const page = (title, body) =>
  `<!-- @dsCard group="${title.group}" -->
<!doctype html>
<meta charset="utf-8">
<title>${title.name}</title>
<style>${PAGE_CSS}${title.extraCss || ''}</style>
<h1>${title.name}</h1>
<p class="lede">${title.lede}</p>
${body}
`;

// A swatch names its token and NEVER prints a hex. The value reaches the browser
// only through a CSS custom property, so the readable content is token names —
// which is what makes a returned spec say `c.accentSoft` instead of "#fef3c7".
const swatch = (varName, tokenName) =>
  `<div class="sw"><div class="chip" style="background:var(${varName})"></div><div class="nm">${tokenName}</div></div>`;

const COLOR_TOKENS = [
  'cream', 'surface', 'ink', 'muted', 'border', 'dot',
  'accent', 'accentDeep', 'accentSoft', 'accentBright',
  'onAccent', 'iconAccent', 'accentBorder', 'deepBorder', 'accentMark',
  'accentHaze', 'glowSoft', 'ghostBtn', 'scrim', 'shadowColor', 'dimText',
  'green', 'greenSoft', 'red', 'redSoft', 'cancelSoft',
  'heat0', 'heat1', 'heat2', 'heat3',
  'placeholder', 'navBg',
  'plusLight', 'plusWhite', 'plusMuted',
];

function colorPage() {
  const blocks = SHOP_PALETTES.map((p) => {
    const panes = ['day', 'night'].map((mode) => {
      const entry = THEMES.find((x) => x.paletteId === p.id && x.mode === mode);
      const c = entry.t.colors;
      const vars = COLOR_TOKENS
        .map((k) => `--c-${p.id}-${mode}-${k}:${c[k]}`)
        .concat([`--g0-${p.id}-${mode}:${c.plusGradient[0]}`, `--g1-${p.id}-${mode}:${c.plusGradient[1]}`])
        .join(';');
      const chips = COLOR_TOKENS
        .map((k) => swatch(`--c-${p.id}-${mode}-${k}`, `c.${k}`))
        .join('\n      ');
      return `  <div class="pane" style="${vars}">
    <h3>mode: ${mode}</h3>
    <div class="grid">
      ${chips}
      <div class="sw"><div class="chip" style="background:linear-gradient(135deg,var(--g0-${p.id}-${mode}),var(--g1-${p.id}-${mode}))"></div><div class="nm">c.plusGradient[0→1]</div></div>
    </div>
  </div>`;
    }).join('\n');
    const tier = p.tier === 'owned' ? 'default, always owned'
      : p.tier === 'plus' ? 'Plus-only'
      : `${p.tier} embers`;
    return `<h2>${p.name} <span style="text-transform:none;letter-spacing:0;color:#a1a1aa">— <code>${p.id}</code>, ${tier}</span></h2>
<div class="modes">
${panes}
</div>`;
  }).join('\n<hr class="rule">\n');

  return page(
    {
      group: 'Tokens', name: 'Color',
      lede: 'Every colour token <code>makeTheme()</code> produces, for all eight shipped accent sets in both modes. Generated from <code>src/theme.js</code> — never hand-copied.',
    },
    `<div class="note"><strong>Return colours by token name, never by hex.</strong> Every swatch below is
labelled with the name the app uses (<code>c.accentSoft</code>), and no hex appears anywhere in this page's
readable content — the values reach the browser only as CSS custom properties. A spec that names hex codes
cannot be ported, because these values change whenever the user picks a different palette.</div>

<div class="note"><strong>Night mode is not "day, darker".</strong> <code>c.accentDeep</code> flips meaning:
on a dark canvas the <em>brighter</em> shade is what gives contrast, so night maps both accent tokens to the
same base accent, and <code>c.accentSoft</code> becomes a near-black tint rather than a pastel. Compose with
the token, not with a remembered colour.</div>
${blocks}`
  );
}

// ── type ──────────────────────────────────────────────────────────────────────
// The app ships its fonts as .ttf inside @expo-google-fonts/*; embedding those
// exact files (rather than linking Google's CDN) keeps the page self-contained
// and guarantees it shows the same cut the app renders.
const FONT_FILES = [
  ['Quicksand_500Medium', 'quicksand', 500],
  ['Quicksand_600SemiBold', 'quicksand', 600],
  ['Quicksand_700Bold', 'quicksand', 700],
  ['Nunito_400Regular', 'nunito', 400],
  ['Nunito_600SemiBold', 'nunito', 600],
  ['Nunito_700Bold', 'nunito', 700],
  ['Nunito_800ExtraBold', 'nunito', 800],
];

function fontFaces() {
  return FONT_FILES.map(([family, pkg]) => {
    const f = path.join(ROOT, 'node_modules', '@expo-google-fonts', pkg, `${family}.ttf`);
    if (!fs.existsSync(f)) return '';
    const b64 = fs.readFileSync(f).toString('base64');
    return `@font-face{font-family:'${family}';src:url(data:font/ttf;base64,${b64}) format('truetype');font-display:block}`;
  }).join('\n');
}

function typePage() {
  const t = DEFAULT_DAY;
  const ramp = [
    ['Hero streak number', 't.display(800)', t.display(800), 56],
    ['Screen title', 't.display(700)', t.display(700), 28],
    ['Card heading', 't.display(700)', t.display(700), 20],
    ['Section label', 't.display(600)', t.display(600), 15],
    ['Body', 't.body(400)', t.body(400), 15],
    ['Body emphasis', 't.body(600)', t.body(600), 15],
    ['Button label', 't.body(700)', t.body(700), 15],
    ['Caption / meta', 't.body(400)', t.body(400), 13],
  ];
  const rows = ramp.map(([role, call, fam, px]) =>
    `<tr><td>${role}</td><td><code>${call}</code></td><td><code>${fam}</code></td><td><code>${px}px</code></td></tr>`
  ).join('\n');
  const specimens = ramp.map(([role, call, fam, px]) =>
    `<div class="spec"><div class="meta"><code>${call}</code> · ${px}px · ${role}</div>
  <div style="font-family:'${fam}';font-size:${px}px;line-height:1.25">Remember the day you lived</div></div>`
  ).join('\n');

  return page(
    {
      group: 'Tokens', name: 'Type',
      lede: 'The display/body ramp, rendered in the app\'s real shipped font files.',
      extraCss: `${fontFaces()}\n.spec{padding:14px 0;border-bottom:1px solid #e4e4e7;max-width:900px}
.meta{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:#71717a;margin-bottom:6px}`,
    },
    `<div class="note"><strong>React Native cannot synthesise weights — every weight is its own family.</strong>
There is no <code>font-weight: 600</code> here. Ask for <code>t.display(600)</code> or <code>t.body(700)</code>;
a spec that says "semibold" without naming the resolver does not port.</div>

<div class="note">The headline family is user-switchable (<code>Quicksand</code> — the shipped default —
plus <code>Baloo 2</code> and <code>Fredoka</code>). <code>t.display(w)</code> resolves to whichever the
user picked, so never name a headline family directly. Body is always Nunito.</div>

<h2>The ramp</h2>
<table><tr><th>Role</th><th>Token call</th><th>Resolves to (default)</th><th>Size</th></tr>
${rows}</table>

<h2>Specimens</h2>
${specimens}`
  );
}

// ── shape ─────────────────────────────────────────────────────────────────────
function shapePage() {
  const steps = [0.6, 1, 1.4];
  const panes = steps.map((rk) => {
    const t = makeTheme('day', { ...DEFAULT_SETTINGS, roundness: rk });
    const box = (k) =>
      `<div style="width:132px;height:76px;border:1px solid #d4d4d8;background:#fff;border-radius:${t.radius[k]}px;
        display:flex;align-items:center;justify-content:center;font:12px ui-monospace,Menlo,monospace;color:#52525b">
        t.radius.${k}</div>`;
    return `<div class="pane"><h3>roundness ${rk}${rk === 1 ? ' — shipped default' : ''}</h3>
  <div style="display:flex;gap:12px;flex-wrap:wrap">${box('card')}${box('btn')}${box('sm')}</div>
  <table style="margin-top:14px"><tr><th>Token</th><th>Value</th></tr>
  ${['card', 'btn', 'sm'].map((k) => `<tr><td><code>t.radius.${k}</code></td><td><code>${t.radius[k]}px</code></td></tr>`).join('')}
  </table></div>`;
  }).join('\n');

  return page(
    {
      group: 'Tokens', name: 'Shape',
      lede: 'The radius scale, shown at the three ends of the user-adjustable roundness range.',
    },
    `<div class="note"><strong>Radius is not a constant — it is <code>base × roundness</code>, and the user
sets roundness.</strong> Card 26, button 18, small 13, each multiplied. Name
<code>t.radius.card</code> / <code>.btn</code> / <code>.sm</code>; a fixed <code>borderRadius: 26</code>
breaks for every user who moved the slider.</div>
<div class="modes">${panes}</div>`
  );
}

// ── elevation ─────────────────────────────────────────────────────────────────
function elevationPage() {
  // shadow() is Platform.select'd; Android (the shipped platform) gets a bare
  // elevation number, iOS gets the offset/radius/opacity set. Both are shown —
  // the CSS preview approximates the iOS values, which carry the real geometry.
  const rows = [2, 4, 8, 14, 20].map((e) => {
    const androidVal = DEFAULT_DAY.shadow(e).elevation;
    const off = Math.round(e * 0.55);
    return { e, androidVal, off };
  });
  const panes = [['day', DEFAULT_DAY], ['night', DEFAULT_NIGHT]].map(([mode, t]) => {
    const bg = t.colors.cream, surf = t.colors.surface, ink = t.colors.ink;
    const cards = rows.map(({ e, androidVal, off }) =>
      `<div style="background:${surf};color:${ink};border:1px solid ${t.colors.border};border-radius:${t.radius.card}px;
        padding:14px 16px;box-shadow:0 ${off}px ${e}px ${t.colors.shadowColor}24;
        font:12px ui-monospace,Menlo,monospace">t.shadow(${e}) → elevation ${androidVal}</div>`
    ).join('\n    ');
    return `<div class="pane" style="background:${bg}"><h3>mode: ${mode}</h3>
  <div style="display:flex;flex-direction:column;gap:16px">
    ${cards}
  </div></div>`;
  }).join('\n');

  const table = rows.map(({ e, androidVal, off }) =>
    `<tr><td><code>t.shadow(${e})</code></td><td><code>elevation: ${androidVal}</code></td><td><code>y ${off}, blur ${e}, opacity 0.14</code></td></tr>`
  ).join('\n');

  return page(
    {
      group: 'Tokens', name: 'Elevation',
      lede: 'Depth comes from <code>t.shadow(elevation)</code>, which is platform-split at source.',
    },
    `<div class="note"><strong>Android — the shipped platform — gets a single <code>elevation</code> number,
not an offset/blur/spread.</strong> You cannot specify a shadow the way CSS does. Name
<code>t.shadow(8)</code> and let it resolve; the preview below approximates it with the iOS geometry so the
weight is visible, but the Android column is what actually renders.</div>
<div class="note">The shadow is tinted, not black: <code>c.shadowColor</code> is a palette-derived warm tone
in day mode and pure black in night. In night mode, depth comes mostly from surface contrast and hairline
<code>c.border</code> — not from shadow.</div>

<table><tr><th>Token call</th><th>Android (shipped)</th><th>iOS</th></tr>
${table}</table>

<div class="modes">${panes}</div>`
  );
}

// ── frozen: rasterise the real components ─────────────────────────────────────
function renderArt(Component, props, t, size) {
  const el = React.createElement(
    ThemeContext.Provider,
    { value: t },
    React.createElement(Component, props)
  );
  const inner = renderToStaticMarkup(el);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${inner}</svg>`;
}

function writePng(file, svg, bg) {
  const r = new Resvg(svg, {
    fitTo: { mode: 'width', value: 600 },
    background: bg,
  });
  fs.writeFileSync(file, r.render().asPng());
}

const FROZEN = [
  { name: 'BigSun', C: art.BigSun, size: 132, mode: 'day', note: 'Celebration, day. 12 rays + radial-gradient disc.' },
  { name: 'RayFan', C: art.RayFan, size: 300, mode: 'day', note: 'Day hero backdrop. 24 spokes, one full rotation per 60s.' },
  { name: 'BigMoon', C: art.BigMoon, size: 132, mode: 'night', note: 'Celebration, night. Crescent + four stars.' },
  { name: 'NightSky', C: art.NightSky, size: 300, mode: 'night', note: 'Classic night hero. Breathing cheese-hole moon + twinkling stars.' },
  { name: 'NightRays', C: art.NightRays, size: 300, mode: 'night', note: 'Shipped night hero (DARK_THEME v2). Same 24-spoke fan on black + amber bloom.' },
];

function frozenPage() {
  fs.mkdirSync(path.join(OUT, 'frozen'), { recursive: true });
  const cards = FROZEN.map((f) => {
    const t = f.mode === 'night' ? DEFAULT_NIGHT : DEFAULT_DAY;
    const bg = t.colors.cream;
    const svg = renderArt(f.C, { size: f.size }, t, f.size);
    const png = `${f.name}-${f.mode}.png`;
    writePng(path.join(OUT, 'frozen', png), svg, bg);
    return `  <figure style="margin:0;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;background:#fff">
    <img src="${png}" alt="${f.name}" style="display:block;width:100%;background:${bg}">
    <figcaption style="padding:10px 12px;border-top:1px solid #e4e4e7">
      <code>${f.name}</code> · mode ${f.mode}<br>
      <span style="color:#52525b;font-size:13px">${f.note}</span>
    </figcaption>
  </figure>`;
  }).join('\n');

  return page(
    {
      group: 'Frozen', name: 'Celestial set',
      lede: 'The sun, the rays and the moons — rendered from the real components in <code>src/art.js</code>, at t=0.',
    },
    `<div class="note" style="border-left-color:#dc2626;background:#fef2f2">
<strong>FROZEN — reference only.</strong> These are the app's signature. Compose around them. Never redraw,
restyle, recolor, or re-time them. Designs may position them, size them, and animate their <em>container</em>
(opacity, translate, scale) — nothing inside.
</div>

<div class="note">These are not mockups or redraws: each PNG is rasterised from the shipped component with
the shipped default palette, so what you see is what renders. The two spinning heroes are captured at
rotation 0 — <code>RayFan</code> and <code>NightRays</code> turn once per 60s in the app.</div>

<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr));max-width:1180px">
${cards}
</div>`
  );
}

// ── components ────────────────────────────────────────────────────────────────
// Mirrors src/ui.js, src/ui/IconBtn.js, src/shopui.js and the nav in
// src/RitualsApp.js. Geometry is copied by hand (it lives in RN StyleSheets, not
// in a token), but every COLOUR and RADIUS is read from makeTheme() so these
// previews cannot drift from the app the way a hand-picked hex would.
// The component previews embed a 3-face subset rather than the full ramp — they
// exist to show colour and geometry, and type.html already carries the whole
// story. Embedding all seven on six pages would add ~6 MB for no extra signal.
let _compFonts = null;
function componentFonts() {
  if (_compFonts === null) {
    _compFonts = [['Quicksand_700Bold', 'quicksand'], ['Nunito_400Regular', 'nunito'], ['Nunito_600SemiBold', 'nunito']]
      .map(([family, pkg]) => {
        const f = path.join(ROOT, 'node_modules', '@expo-google-fonts', pkg, `${family}.ttf`);
        if (!fs.existsSync(f)) return '';
        return `@font-face{font-family:'${family}';src:url(data:font/ttf;base64,${fs.readFileSync(f).toString('base64')}) format('truetype');font-display:block}`;
      }).join('\n');
  }
  return _compFonts;
}

function comp(name, group, lede, notes, render) {
  const panes = [['day', DEFAULT_DAY], ['night', DEFAULT_NIGHT]].map(([mode, t]) => {
    const c = t.colors;
    return `<div class="pane" style="background:${c.cream};border-color:${c.border}">
  <h3 style="color:${c.muted}">mode: ${mode}</h3>
  ${render(t, mode)}
</div>`;
  }).join('\n');
  return page({ group, name, lede, extraCss: componentFonts() }, `${notes}\n<div class="modes">${panes}</div>`);
}

const specTable = (rows) =>
  `<h2>What is token-driven</h2><table><tr><th>Property</th><th>Token</th></tr>
${rows.map(([p, tk]) => `<tr><td>${p}</td><td><code>${tk}</code></td></tr>`).join('\n')}</table>`;

function cardPage() {
  return comp('Card', 'Components',
    'The single surface primitive — <code>Card</code> in <code>src/ui.js</code>. Almost every screen is a stack of these.',
    `<div class="note"><strong>Night mode is not day mode with a shadow.</strong> In day, depth is
<code>t.shadow(14, c.shadowColor, 0.16)</code>. In night the shadow is dropped entirely and depth comes from
surface contrast plus a 1px <code>c.border</code> hairline — plus the sheen below.</div>
<div class="note"><strong>The night-v2 <code>CARD_SHEEN</code> is a fixed 48dp top strip, not a full-height
ramp</strong> (<code>rgba(255,255,255,0.06)</code> → transparent). That is deliberate and load-bearing: the
alpha range is only ~15 of 255 steps, so stretching it over a tall card puts ~10dp between steps, which
Android's hardware draw path renders as visible bands — differently on every card, because every card is a
different height. Do not restore a full-height gradient.</div>
${specTable([
  ['background', 'c.surface'], ['border (1px)', 'c.border'], ['corner radius', 't.radius.card'],
  ['shadow (day only)', 't.shadow(14, c.shadowColor, 0.16)'], ['sheen (night-v2)', 'CARD_SHEEN — 48dp, 6% → 0% white'],
])}`,
    (t, mode) => {
      const c = t.colors;
      const sheen = mode === 'night'
        ? `<div style="position:absolute;top:0;left:0;right:0;height:48px;background:linear-gradient(to bottom,rgba(255,255,255,0.06),rgba(255,255,255,0))"></div>`
        : '';
      const shadow = mode === 'day' ? `box-shadow:0 8px 14px ${c.shadowColor}29;` : '';
      return `<div style="position:relative;overflow:hidden;background:${c.surface};border:1px solid ${c.border};
    border-radius:${t.radius.card}px;padding:18px;${shadow}">
  ${sheen}
  <div style="position:relative;font:700 20px/1.3 'Quicksand_700Bold',ui-sans-serif;color:${c.ink}">Today's reflection</div>
  <div style="position:relative;margin-top:6px;font:15px/1.5 'Nunito_400Regular',ui-sans-serif;color:${c.muted}">
    A card is padded 18 and never sets its own background colour — it takes <code style="color:${c.accentDeep}">c.surface</code>.</div>
</div>
<div style="height:14px"></div>
<div style="position:relative;overflow:hidden;background:${c.surface};border:1px solid ${c.border};
    border-radius:${t.radius.card}px;padding:18px;${shadow}">
  ${sheen}
  <div style="position:relative;font:15px/1.5 'Nunito_400Regular',ui-sans-serif;color:${c.ink}">A second card, to show the sheen reads identically regardless of height.</div>
</div>`;
    });
}

function buttonsPage() {
  return comp('Buttons', 'Components',
    '<code>PrimaryButton</code>, <code>GhostButton</code> (<code>src/ui.js</code>) and <code>IconBtn</code> (<code>src/ui/IconBtn.js</code>).',
    `<div class="note"><strong>There is exactly one filled button style, and it is a three-stop vertical
gradient</strong> — <code>c.accentBright</code> → <code>c.accent</code> → <code>c.accentDeep</code> at
0 / 0.55 / 1. Not a flat fill. A design that flattens it stops looking like this app.</div>
<div class="note">Press feedback is a scale to <b>0.99</b> — deliberately almost imperceptible. After
IMP-077 this comes from <code>usePressScale()</code>; see the Motion cards.</div>
${specTable([
  ['primary fill', 'c.accentBright → c.accent → c.accentDeep (0 / .55 / 1, vertical)'],
  ['primary label', 't.display(700), 17px, c.onAccent'],
  ['primary radius', 't.radius.btn'],
  ['primary shadow', 't.shadow(12, c.accentDeep, 0.6)'],
  ['ghost border', '1.5px c.border, radius 18'],
  ['ghost label', 't.display(700), 16px, c.accentDeep'],
  ['icon button', '38×38, radius 19, c.ghostBtn'],
])}`,
    (t) => {
      const c = t.colors;
      return `<div style="display:flex;flex-direction:column;gap:14px">
  <div style="background:linear-gradient(to bottom,${c.accentBright} 0%,${c.accent} 55%,${c.accentDeep} 100%);
       border-radius:${t.radius.btn}px;padding:16px 22px;text-align:center;box-shadow:0 7px 12px ${c.accentDeep}99;
       font:700 17px/1.2 'Quicksand_700Bold',ui-sans-serif;color:${c.onAccent}">Save today</div>
  <div style="background:linear-gradient(to bottom,${c.accentBright} 0%,${c.accent} 55%,${c.accentDeep} 100%);
       border-radius:${t.radius.btn}px;padding:16px 22px;text-align:center;opacity:.4;
       font:700 17px/1.2 'Quicksand_700Bold',ui-sans-serif;color:${c.onAccent}">Disabled — opacity 0.4</div>
  <div style="border:1.5px solid ${c.border};border-radius:18px;padding:16px;text-align:center;
       font:700 16px/1.2 'Quicksand_700Bold',ui-sans-serif;color:${c.accentDeep}">Not now</div>
  <div style="display:flex;gap:10px">
    <div style="width:38px;height:38px;border-radius:19px;background:${c.ghostBtn};display:flex;align-items:center;justify-content:center;color:${c.ink}">✕</div>
    <div style="width:38px;height:38px;border-radius:19px;background:${c.ghostBtn};display:flex;align-items:center;justify-content:center;color:${c.ink}">✎</div>
  </div>
</div>`;
    });
}

function progressPage() {
  return comp('Progress', 'Components',
    '<code>ProgressBar</code> in <code>src/ui.js</code> — the XP bar, and the app\'s only permitted infinite loop.',
    `<div class="note"><strong>This shimmer is the single exception to "nothing loops indefinitely".</strong>
It already exists, it is native-driven, and IMP-077 explicitly does not touch it. Do not propose new
looping motion by pointing at this one.</div>
<div class="note">The shimmer is an 80dp band, <code>skewX(-15deg)</code>, translating −80 → 320 over 1200ms,
then resting 5000ms before repeating. The rest interval is the point — it reads as an occasional glint, not
a barber pole.</div>
${specTable([
  ['track', 'c.accentSoft'], ['fill', 'c.accentBright → c.accent (horizontal)'],
  ['height / radius', '12dp / 999'], ['shimmer', '80dp band, skewX(-15deg), 1200ms + 5000ms rest'],
])}`,
    (t) => {
      const c = t.colors;
      const bar = (pct) => `<div style="height:12px;border-radius:999px;background:${c.accentSoft};overflow:hidden">
    <div style="width:${pct}%;height:100%;border-radius:999px;position:relative;overflow:hidden;
         background:linear-gradient(to right,${c.accentBright},${c.accent})">
      <div style="position:absolute;top:0;bottom:0;width:80px;transform:skewX(-15deg);
           background:linear-gradient(to right,rgba(255,255,255,0),rgba(255,255,255,.42),rgba(255,255,255,0));
           animation:shim 6200ms linear infinite"></div>
    </div>
  </div>`;
      return `<style>@keyframes shim{0%{transform:translateX(-80px) skewX(-15deg)}19.4%{transform:translateX(320px) skewX(-15deg)}100%{transform:translateX(320px) skewX(-15deg)}}
  @media (prefers-reduced-motion:reduce){[style*="animation:shim"]{animation:none!important;opacity:0}}</style>
<div style="display:flex;flex-direction:column;gap:16px">
  <div><div style="font:12px/1.6 ui-monospace,Menlo,monospace;color:${c.muted};margin-bottom:6px">value = 28</div>${bar(28)}</div>
  <div><div style="font:12px/1.6 ui-monospace,Menlo,monospace;color:${c.muted};margin-bottom:6px">value = 64</div>${bar(64)}</div>
  <div><div style="font:12px/1.6 ui-monospace,Menlo,monospace;color:${c.muted};margin-bottom:6px">value = 100</div>${bar(100)}</div>
</div>`;
    });
}

function chipsPage() {
  const moods = ['Grateful', 'Restless', 'Proud', 'Tender', 'Tired'];
  const emoji = { Grateful: '🙏', Restless: '🌀', Proud: '😌', Tender: '🤍', Tired: '🌙' };
  return comp('Chips & pills', 'Components',
    'Mood chips (WriteFlow), the milestone pill, and the Embers pill from <code>src/shopui.js</code>.',
    `<div class="note">A selected mood chip is <strong>filled with <code>c.accent</code></strong> and its
label flips to <code>c.onAccent</code>; an unselected one is <code>c.surface</code> with a
<code>c.border</code> hairline. Multiple moods can be selected at once (IMP-037), so selection must read
clearly at a glance across a wrapped row.</div>
${specTable([
  ['chip (idle)', 'c.surface + 1px c.border, radius 999'],
  ['chip (selected)', 'c.accent fill, c.onAccent label'],
  ['ember pill', 'c.accentSoft fill, 1px c.deepBorder, radius 999'],
  ['ember count', 't.display(800), 15px, c.accentDeep'],
  ['milestone pill', 'c.accentSoft fill, c.accentDeep label'],
])}`,
    (t) => {
      const c = t.colors;
      const chip = (m, on) => `<div style="display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:999px;
      background:${on ? c.accent : c.surface};border:1px solid ${on ? c.accent : c.border};
      font:600 14px/1.2 'Nunito_600SemiBold',ui-sans-serif;color:${on ? c.onAccent : c.ink}"><span>${emoji[m]}</span>${m}</div>`;
      return `<div style="display:flex;flex-wrap:wrap;gap:8px">
  ${moods.map((m, i) => chip(m, i === 0 || i === 3)).join('\n  ')}
</div>
<div style="height:18px"></div>
<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
  <div style="display:inline-flex;align-items:center;gap:5px;height:36px;padding:0 11px 0 9px;border-radius:999px;
       background:${c.accentSoft};border:1px solid ${c.deepBorder}">
    <span style="color:${c.accentDeep}">◆</span>
    <span style="font:800 15px/1.2 'Quicksand_700Bold',ui-sans-serif;color:${c.accentDeep}">240</span>
    <span style="width:17px;height:17px;border-radius:9px;background:${c.accent};color:${c.onAccent};
          font:800 13px/17px 'Quicksand_700Bold',ui-sans-serif;text-align:center">+</span>
  </div>
  <div style="display:inline-flex;align-items:center;padding:6px 12px;border-radius:999px;background:${c.accentSoft};
       font:800 13px/1.2 'Quicksand_700Bold',ui-sans-serif;color:${c.accentDeep}">30-day streak</div>
</div>`;
    });
}

function navPage() {
  return comp('Bottom nav', 'Components',
    'The 4-tab bar plus the centre write FAB — <code>src/RitualsApp.js</code>. There is no navigation library.',
    `<div class="note"><strong>The FAB overlaps the bar by 26dp and has a 6dp border in
<code>c.cream</code></strong>, so it punches a hole through the bar rather than sitting on it. That cut-out
is the strongest single piece of brand in the chrome — keep it.</div>
<div class="note">The bar background is <code>c.navBg</code>, which is deliberately <em>translucent</em>
(92% white in day, 88% black in night) so content shows through as it scrolls under. Tab order is fixed:
Today · Insights · <em>Write</em> · Reflections · You.</div>
${specTable([
  ['bar background', 'c.navBg (translucent)'], ['top border', '1px c.border'],
  ['active tab', 'c.accentDeep'], ['inactive tab', 'c.muted'],
  ['FAB', '64×64, radius 32, c.accent, 6dp c.cream border, marginTop −26'],
  ['FAB shadow', 't.shadow(14, c.accentDeep, 0.9)'],
  ['bar height', 'minHeight 78, paddingTop 10 + safe-area inset'],
])}`,
    (t) => {
      const c = t.colors;
      const tab = (label, glyph, on) => `<div style="flex:1;text-align:center;color:${on ? c.accentDeep : c.muted}">
      <div style="font-size:21px;line-height:1">${glyph}</div>
      <div style="font:800 10px/1.4 'Quicksand_700Bold',ui-sans-serif;margin-top:5px">${label}</div></div>`;
      return `<div style="background:${c.cream};padding-top:26px;border-radius:12px;overflow:hidden">
  <div style="display:flex;align-items:flex-start;justify-content:space-around;border-top:1px solid ${c.border};
       background:${c.navBg};padding-top:10px;min-height:78px">
    ${tab('Today', '⌂', true)}
    ${tab('Insights', '◴', false)}
    <div style="width:72px;text-align:center">
      <div style="width:64px;height:64px;border-radius:32px;margin:-26px auto 0;background:${c.accent};
           border:6px solid ${c.cream};box-shadow:0 8px 14px ${c.accentDeep}e6;color:${c.onAccent};
           display:flex;align-items:center;justify-content:center;font-size:24px">✎</div>
      <div style="font:800 10px/1.4 'Quicksand_700Bold',ui-sans-serif;margin-top:5px;color:${c.accentDeep}">Write</div>
    </div>
    ${tab('Reflections', '❏', false)}
    ${tab('You', '☺', false)}
  </div>
</div>`;
    });
}

function plusPage() {
  return comp('Plus surfaces', 'Components',
    '<code>PlusBanner</code>, <code>PalTag</code> and <code>SkyPreview</code> from <code>src/shopui.js</code> — the least-designed part of the product, and the first redesign target.',
    `<div class="note"><strong>The Plus banner is the app's one dark surface in both modes.</strong> It uses
its own gradient pair <code>c.plusGradient[0→1]</code> and its own text tokens
(<code>c.plusWhite</code> headline, <code>c.plusMuted</code> body, <code>c.plusLight</code> label) —
these exist precisely so the banner stays legible on any palette. Do not substitute <code>c.ink</code>.</div>
<div class="note bad" style="border-left:3px solid #dc2626;background:#fef2f2"><strong>Design only —
<code>PLUS_ENABLED</code> is <code>false</code> and stays false.</strong> Redesigning these screens does
not enable them. <code>PLUS_PERKS</code> copy in <code>src/data.js</code>, the entitlement state and
everything under <code>src/billing/</code> are untouched by any design work.</div>
${specTable([
  ['banner fill', 'c.plusGradient[0] → c.plusGradient[1]'],
  ['banner headline', 'c.plusWhite, t.display(800)'],
  ['banner body', 'c.plusMuted'], ['banner label / icon', 'c.plusLight'],
  ['member card', 'c.surface + 1px c.accentBorder'],
  ['locked price tag', 'c.accentSoft fill, c.accentDeep label'],
])}`,
    (t) => {
      const c = t.colors;
      return `<div style="background:linear-gradient(135deg,${c.plusGradient[0]},${c.plusGradient[1]});
     border-radius:${t.radius.card}px;padding:17px 18px">
  <div style="font:800 11px/1.2 'Quicksand_700Bold',ui-sans-serif;letter-spacing:.09em;text-transform:uppercase;color:${c.plusLight}">Daily Rituals Plus</div>
  <div style="font:800 19px/1.3 'Quicksand_700Bold',ui-sans-serif;color:${c.plusWhite};margin-top:5px">Keep every day you write</div>
  <div style="font:15px/1.5 'Nunito_400Regular',ui-sans-serif;color:${c.plusMuted};margin-top:4px">Deeper insights, unlimited restores, and every palette.</div>
</div>
<div style="height:14px"></div>
<div style="display:flex;align-items:center;gap:13px;padding:15px;border-radius:${t.radius.card}px;
     background:${c.surface};border:1px solid ${c.accentBorder}">
  <div style="width:40px;height:40px;border-radius:20px;background:${c.accent};color:${c.onAccent};
       display:flex;align-items:center;justify-content:center;box-shadow:0 4px 8px ${c.accentDeep}cc">☀</div>
  <div style="flex:1">
    <div style="font:800 16px/1.3 'Quicksand_700Bold',ui-sans-serif;color:${c.ink}">Daily Rituals Plus</div>
    <div style="font:600 12.5px/1.4 'Nunito_600SemiBold',ui-sans-serif;color:${c.muted};margin-top:1px">Member · renews soon</div>
  </div>
  <div style="font:800 12.5px/1.2 'Quicksand_700Bold',ui-sans-serif;color:${c.accentDeep}">Manage ›</div>
</div>
<div style="height:14px"></div>
<div style="display:flex;gap:8px;flex-wrap:wrap">
  <div style="padding:6px 12px;border-radius:999px;background:${c.accentSoft};border:1px solid ${c.deepBorder};
       font:800 13px/1.2 'Quicksand_700Bold',ui-sans-serif;color:${c.accentDeep}">◆ 420</div>
  <div style="padding:6px 12px;border-radius:999px;background:${c.accentSoft};border:1px solid ${c.deepBorder};
       font:800 13px/1.2 'Quicksand_700Bold',ui-sans-serif;color:${c.accentDeep}">🔒 Plus</div>
  <div style="padding:6px 12px;border-radius:999px;background:${c.accent};
       font:800 13px/1.2 'Quicksand_700Bold',ui-sans-serif;color:${c.onAccent}">✓ Owned</div>
</div>`;
    });
}

// ── screens ───────────────────────────────────────────────────────────────────
// Real device captures, not mockups — taken through the existing `npm run shots`
// path (scripts/shots.sh → Maestro + adb) against the storeShots dev scenario, so
// the data is the same 210-day fixture the Play assets use and the status bar is
// in demo mode. This page only frames whatever PNGs are present; capturing them
// is a separate, manual step.
const SCREEN_TITLES = {
  '01-today': 'Today — the home screen: streak hero, rites, level',
  '02-write': 'Write — step 1 of the entry flow',
  '03-moods': 'Write — the mood step (multi-select)',
  '04-reflections': 'Reflections — search, filters, the lifetime heatmap',
  '05-insights': 'Insights — the record, consistency grid',
  '06-achievements': 'Achievements / Keepsakes',
  '07-shop': 'Shop — palettes, skies, embers',
};

function baselinePages() {
  const dir = path.join(OUT, 'screens');
  fs.mkdirSync(dir, { recursive: true });
  const out = [];
  for (const mode of ['day', 'night']) {
    const shots = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => f.startsWith(`${mode}-`) && f.endsWith('.png')).sort()
      : [];
    if (!shots.length) continue;
    const figs = shots.map((f) => {
      const key = f.replace(`${mode}-`, '').replace('.png', '');
      return `  <figure style="margin:0">
    <img src="${f}" alt="${key}" style="display:block;width:100%;border:1px solid #e4e4e7;border-radius:10px">
    <figcaption style="padding:8px 2px;font-size:13px;color:#52525b"><code>${key}</code> — ${SCREEN_TITLES[key] || ''}</figcaption>
  </figure>`;
    }).join('\n');

    const nightNote = mode === 'day'
      ? `<div class="note" style="border-left-color:#d97706;background:#fffbeb">
<strong>Night baselines are not in this project yet — treat that as a gap, not as "night looks like this".</strong>
The app's day/night mode is <em>its own setting</em> (<code>App.js</code> holds <code>mode</code>, the header
toggle drives it, it persists in settings) — it does <strong>not</strong> follow the OS dark-mode setting, so
flipping the emulator's <code>uimode</code> produces day screenshots again. Capturing night needs the in-app
toggle driven inside the Maestro flow. Until then, use the <em>Tokens → Color</em> card for night: every
night value is there, generated from source.</div>`
      : '';

    out.push([`screens/baseline-${mode}.html`, page(
      {
        group: 'Screens', name: `Baseline — ${mode}`,
        lede: `The app as it actually is today, ${mode} mode. Real captures, not mockups.`,
      },
      `<div class="note"><strong>Design <em>from</em> these, not from a description.</strong> This is the
single biggest lever on whether output reads as the next version of Daily Rituals rather than a generic
wellness app. Match the density, the card rhythm and the amount of breathing room you see here.</div>
${nightNote}
<div class="note">Captured through <code>npm run shots</code> (Maestro + adb) against the
<code>storeShots</code> dev scenario — a 210-day streak, "Sam", 2,400 embers — with the status bar in demo
mode (12:00, full battery). The fixture is deliberately a heavy account: designs must survive big numbers.</div>

<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr));max-width:1180px;gap:16px">
${figs}
</div>`
    )]);
  }
  return out;
}

// ── write ─────────────────────────────────────────────────────────────────────
function main() {
  fs.mkdirSync(path.join(OUT, 'tokens'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'components'), { recursive: true });
  const files = [
    ['tokens/color.html', colorPage()],
    ['tokens/type.html', typePage()],
    ['tokens/shape.html', shapePage()],
    ['tokens/elevation.html', elevationPage()],
    ['frozen/celestial.html', frozenPage()],
    ['components/card.html', cardPage()],
    ['components/buttons.html', buttonsPage()],
    ['components/progress.html', progressPage()],
    ['components/chips.html', chipsPage()],
    ['components/nav.html', navPage()],
    ['components/plus.html', plusPage()],
    ...baselinePages(),
  ];
  for (const [rel, html] of files) {
    fs.writeFileSync(path.join(OUT, rel), html);
    console.log(`gen(design-system): ${rel} (${(html.length / 1024).toFixed(0)} kB)`);
  }
  console.log(`gen(design-system): ${FROZEN.length} frozen PNGs from the real components`);
  console.log(`gen(design-system): ${THEMES.length} themes = ${SHOP_PALETTES.length} accent sets x 2 modes`);
}

main();
