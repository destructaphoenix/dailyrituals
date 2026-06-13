// io.js — the ONLY file that touches native file/share/pick modules. Keeps the
// backup core pure and testable. No business logic lives here.
//
// Lazy require inside each function: expo-sharing/expo-document-picker register
// native modules that crash Expo Go at import time. Requiring on first use lets
// the app boot normally; the backup UI is gated by a dev build anyway.

// Write text to a temp file and open the OS share sheet (the off-device step).
// Returns true if the share sheet was presented.
export async function exportFile(filename, text) {
  const FileSystem = require('expo-file-system');
  const Sharing = require('expo-sharing');
  const UTF8 = { encoding: FileSystem.EncodingType.UTF8 };
  const uri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, text, UTF8);
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Save your journal backup' });
  return true;
}

// Let the user pick a backup file; return its text, or null if they cancelled.
export async function pickFile() {
  const FileSystem = require('expo-file-system');
  const DocumentPicker = require('expo-document-picker');
  const UTF8 = { encoding: FileSystem.EncodingType.UTF8 };
  const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (res.canceled || !res.assets || !res.assets[0]) return null;
  return FileSystem.readAsStringAsync(res.assets[0].uri, UTF8);
}

// Silent on-device safety copy written before a destructive import. Returns the filename.
export async function writeRecovery(text, now = new Date()) {
  const FileSystem = require('expo-file-system');
  const UTF8 = { encoding: FileSystem.EncodingType.UTF8 };
  const name = `daily-rituals-recovery-${now.toISOString().replace(/[:.]/g, '-')}.json`;
  await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + name, text, UTF8);
  return name;
}
