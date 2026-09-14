#!/usr/bin/env node
// gen-screens.js — renders real screens from the app's shipped source, as
// react-native-web layout (IMP-135).
//
// WHY THIS EXISTS. Claude Design had two ways to reach a screen: a baseline
// PNG (deleted 2026-09-14 — the app had outrun all 14 of them) or source
// pasted by hand into a request. Neither is current by construction. This
// generates the screen straight from src/screens/HomeScreen.js, so there is
// nothing to go stale — regenerate and it is today's screen.
//
// A GENERATED CARD IS NOT A PHOTOGRAPH. react-native-web is a faithful
// LAYOUT, not a device: shadows, real font metrics and video playback all
// differ, and each screen card says so. Device captures remain the ground
// truth for the Play listing (WALK-25); the two coexist on purpose.
//
// TWO GENERATORS, TWO REQUIRE HOOKS, ONE OUTPUT DIRECTORY. gen-design-system.js
// maps every RN `View` to an SVG `<g>` and deliberately drops position/size —
// correct for rasterising art, fatal for a screen's layout. This script
// installs its OWN hook instead of extending that one: react-native itself
// maps to react-native-web, so real Views, real Text and real layout come out.
//
// Run: node scripts/gen-screens.js

const fs = require('fs');
const path = require('path');
const Module = require('module');
const babel = require('@babel/core');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'design-system', 'screens');
const SRC = path.join(ROOT, 'src');

// ── 1. require hook: transpile src/*.js (ESM + JSX) for node ──────────────────
// Verbatim from gen-design-system.js:36 — the two generators cannot share a
// hook installation (their native-package mappings conflict), but the babel
// config itself is identical.
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

// ── 2. resolve react-native-svg's web build for its OWN internal requires ─────
// require("./elements") inside ReactNativeSVG.web.js (and xmlTags.js, which it
// pulls in) resolves to the NATIVE elements.js under plain node — there is no
// bundler here to prefer the sibling elements.web.js by platform convention.
// Redirect that one relative request, from any file inside the package, to
// the web file that already exists for exactly this purpose.
const RNSVG_DIR = `${path.sep}react-native-svg${path.sep}lib${path.sep}commonjs${path.sep}`;
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request === './elements' && parent && parent.filename && parent.filename.includes(RNSVG_DIR)) {
    return origResolve.call(this, './elements.web.js', parent, ...rest);
  }
  return origResolve.call(this, request, parent, ...rest);
};

// ── 3. stub the native-only packages the spec's own audit found ──────────────
const React = require('react');

const EXPO_VIDEO_STUB = {
  // SkyHero holds its poster over any frame that isn't readyToPlay — 'idle'
  // here means the generated card always shows the poster, which IS the
  // right picture: a still of a video sky, not a frozen mid-frame guess.
  useVideoPlayer: () => ({
    status: 'idle', loop: false, muted: true, play() {}, addListener: () => ({ remove() {} }),
  }),
  VideoView: () => null,
};

const LINEAR_GRADIENT_STUB = {
  LinearGradient: ({ colors, style, children, ...rest }) => {
    const { View } = require('react-native-web/dist/cjs');
    const stops = (colors || ['transparent', 'transparent']).join(',');
    return React.createElement(
      View,
      { ...rest, style: [].concat(style || []).concat([{ backgroundImage: `linear-gradient(180deg, ${stops})` }]) },
      children
    );
  },
};

const SAFE_AREA_STUB = {
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
};

// No-op identity stub: six of eight motion.js exports have no consumer and
// the live one (usePressScale) is a 0.99 press scale — nothing here is worth
// animating for a static render (see motion.js and IMP-128). Effects never
// run under renderToStaticMarkup anyway, so every shared value simply stays
// at its initial frame — the same "t=0" idea gen-design-system.js uses for
// the frozen rays.
const REANIMATED_STUB = {
  Easing: {
    bezier: () => (t) => t, out: (fn) => fn, in: (fn) => fn, inOut: (fn) => fn,
    linear: (t) => t, cubic: (t) => t, quad: (t) => t, ease: (t) => t,
  },
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: (fn) => fn(),
  withTiming: (toValue) => toValue,
  withSpring: (toValue) => toValue,
  withDelay: (delay, anim) => anim,
  cancelAnimation: () => {},
  // ui.js's PrimaryButton wraps in `RNAnimated.View` (the default export) —
  // an ordinary View renders the same static frame.
  View: (props) => React.createElement(require('react-native-web/dist/cjs').View, props),
};

const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'react-native') return require('react-native-web/dist/cjs');
  if (request === 'react-native-svg') return require('react-native-svg/lib/commonjs/ReactNativeSVG.web.js');
  if (request === 'expo-video') return EXPO_VIDEO_STUB;
  if (request === 'expo-linear-gradient') return LINEAR_GRADIENT_STUB;
  if (request === 'react-native-safe-area-context') return SAFE_AREA_STUB;
  if (request === 'react-native-reanimated') return REANIMATED_STUB;
  return origLoad.apply(this, arguments);
};

// ── 4. now the real app source (and react-native-web) can load ───────────────
const { renderToStaticMarkup } = require('react-dom/server');
const AppRegistry = require('react-native-web/dist/cjs/exports/AppRegistry');
const RNWeb = require('react-native-web/dist/cjs');
const { page } = require('./dsCard');
const { componentFonts } = require('./fontEmbed');
const { homePropsFromState } = require('./screenFixtures');
const { buildScenario } = require(path.join(SRC, 'dev', 'scenarios.js'));
const { makeTheme } = require(path.join(SRC, 'theme.js'));
const { ThemeContext } = require(path.join(SRC, 'theme.js'));
const { HERO_HEIGHT } = require(path.join(SRC, 'home', 'heroFrame.js'));
const HomeScreen = require(path.join(SRC, 'screens', 'HomeScreen.js')).default;

// react-native-web's own Platform.select ignores `.OS` and only ever reads a
// `web` key off the object passed to it (see its source) — so without this,
// theme.js's shadow() falls through to `default: {}` and every Card in the
// generated screen loses its shadow. The shipped platform is Android; make
// Platform.select answer as Android would, exactly like gen-design-system.js
// already treats it for the same reason.
RNWeb.Platform.select = (o) => (o.android !== undefined ? o.android : o.default);

// react-native-web's <Image> only paints a background for a URI it has
// already loaded (checked via ImageLoader.has(), populated by a real browser
// fetch) — under a one-shot SSR render there is no fetch, so the video sky's
// poster would otherwise render as nothing. This is the one deliberate
// exception to "layout only, no network": the URL is real and public
// (SHOP_SKIES' own CDN asset), so let it stand in as loaded.
require('react-native-web/dist/cjs/modules/ImageLoader').default.has = () => true;

// A fixed phone width, matching the frozen card's own convention
// (gen-design-system.js's frozenPage() reaches heroReach(360) too) — so the
// same reach numbers describe both cards.
const PHONE_WIDTH = 360;
RNWeb.Dimensions.set({ window: { width: PHONE_WIDTH, height: 780, scale: 1, fontScale: 1 } });

// Pinned so regenerating the card twice in the same day — or a year from
// now — produces the same bytes. The date has no other significance.
const FIXED_TODAY = '2026-01-01';

function renderHome(mode, activeSky) {
  const state = buildScenario('storeShots', FIXED_TODAY);
  const props = { ...homePropsFromState({ ...state, mode }), activeSky };
  const theme = makeTheme(mode, state.settings);
  const el = React.createElement(
    ThemeContext.Provider,
    { value: theme },
    React.createElement(HomeScreen, props)
  );
  AppRegistry.registerComponent('Screen', () => () => el);
  const { element } = AppRegistry.getApplication('Screen');
  const bg = theme.colors.cream;
  const html = renderToStaticMarkup(element);
  return { html, bg };
}

function phoneFrame(label, mode, activeSky) {
  const { html, bg } = renderHome(mode, activeSky);
  return `<figure style="margin:0">
  <figcaption style="font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:#71717a;margin-bottom:8px">${label}</figcaption>
  <div style="width:${PHONE_WIDTH}px;max-width:100%;border:1px solid #e4e4e7;border-radius:20px;overflow:hidden;background:${bg}">
    ${html}
  </div>
</figure>`;
}

function screenPage(mode) {
  // Both grounds, side by side: the classic RayFan/NightRays hero and the
  // video hero on its poster (activeSky 'meteor', owned by storeShots' ownAll
  // knob) — D-15 turns on exactly this difference.
  const classic = phoneFrame('Ground: classic (RayFan/NightRays)', mode, 'classic');
  const video = phoneFrame('Ground: video sky, poster frame (Meteor Shower)', mode, 'meteor');
  const styleEl = AppRegistry.getApplication('Screen').getStyleElement();
  const rnwCss = styleEl.props.dangerouslySetInnerHTML.__html;

  return page(
    {
      group: 'Screens', name: `Home — ${mode}`,
      lede: `Rendered from <code>src/screens/HomeScreen.js</code> with react-native-web, fed the <code>storeShots</code> dev fixture (128 streak, 210 entries, "Sam", 2,400 embers, owns everything). Regenerate any time the screen changes — there is nothing to go stale.`,
      extraCss: `${componentFonts()}\n${rnwCss}\n.grid2{display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start}`,
    },
    `<div class="note"><strong>This is a layout render, not a device capture.</strong> react-native-web lays
out the real component tree, but it is not the device: shadows render as CSS box-shadow rather than Android
elevation, font metrics differ slightly from the shipped .ttf rasterisation, and the video never plays — the
poster frame stands in for it, which is the correct picture for a cold hero anyway. For pixel-true reference,
see the device captures behind <a href="../../docs/walk-open.md#walk-25--recapture-the-shot-set">WALK-25</a>.</div>
<div class="note">Every interaction is a no-op (this card is never clicked) and the streak hero's geometry
(<code>HERO_HEIGHT</code> = ${HERO_HEIGHT}) comes from <code>src/home/heroFrame.js</code>, imported — never
retyped — the same rule IMP-134 set for the frozen rays card.</div>
<div class="grid2">
${classic}
${video}
</div>`
  );
}

// ── write ─────────────────────────────────────────────────────────────────────
function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const mode of ['day', 'night']) {
    const rel = `home-${mode}.html`;
    fs.writeFileSync(path.join(OUT, rel), screenPage(mode));
    console.log(`gen(screens): design-system/screens/${rel}`);
  }
}

main();
