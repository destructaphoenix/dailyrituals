// scripts/shots.config.js — what gets captured, and what each shot says.
// Order IS the Play listing order: Play shows the first 3–4 most prominently.
module.exports = {
  canvas: { w: 1080, h: 1920 },
  // Straight from theme.js day palette + the splash background.
  colors: { bg: '#f9f7f4', ink: '#292524', accent: '#f59e0b', accentDeep: '#d97706' },
  fonts: {
    headline: 'node_modules/@expo-google-fonts/fredoka/Fredoka_600SemiBold.ttf',
    body:     'node_modules/@expo-google-fonts/baloo-2/Baloo2_500Medium.ttf',
  },
  shots: [
    { id: '01-today',       headline: 'One question a day.',          sub: "That's the whole ritual." },
    { id: '02-write',       headline: 'What you did.',                sub: 'What you wished for.' },
    { id: '03-moods',       headline: 'Name how it felt —',           sub: 'in your own words.' },
    { id: '04-reflections', headline: 'Every day you kept,',          sub: 'searchable.' },
    { id: '05-insights',    headline: 'Your year,',                   sub: 'one square at a time.' },
    { id: '06-achievements',headline: 'Proof you kept going.',        sub: 'Even the days you almost didn\'t.' },
    { id: '07-shop',        headline: 'A garden that grows',          sub: 'as your record does.' },
  ],
};
