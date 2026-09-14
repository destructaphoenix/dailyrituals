// dsCard.js — the shared, deliberately neutral chrome every design-system
// preview page is wrapped in (Tokens, Frozen, Components, and — as of
// IMP-135 — Screens). Pulled out of gen-design-system.js so gen-screens.js
// can reuse the exact same page frame and card marker without requiring
// that generator (which self-runs on require — see gen-screens.js's header).
//
// Deliberately monochrome and neutral: the page frame must never be mistaken
// for the app's own visual language, or Claude Design will copy the frame too.
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

module.exports = { PAGE_CSS, page };
