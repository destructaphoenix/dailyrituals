// fontEmbed.js — the 3-font @font-face subset used by every generated
// component/screen preview (never the full type-ramp set — see
// gen-design-system.js's own fontFaces() for that one). Pulled out of
// gen-design-system.js so gen-screens.js can reuse the same embed without
// requiring that generator (which self-runs main() and installs a
// conflicting require hook — see gen-screens.js's own header comment).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const FONTS = [
  ['Quicksand_700Bold', 'quicksand'],
  ['Nunito_400Regular', 'nunito'],
  ['Nunito_600SemiBold', 'nunito'],
];

let _cache = null;
function componentFonts() {
  if (_cache === null) {
    _cache = FONTS.map(([family, pkg]) => {
      const f = path.join(ROOT, 'node_modules', '@expo-google-fonts', pkg, `${family}.ttf`);
      if (!fs.existsSync(f)) return '';
      return `@font-face{font-family:'${family}';src:url(data:font/ttf;base64,${fs.readFileSync(f).toString('base64')}) format('truetype');font-display:block}`;
    }).join('\n');
  }
  return _cache;
}

module.exports = { componentFonts };
