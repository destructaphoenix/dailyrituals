// io.js — the ONLY file that touches native file/share/pick modules. Keeps the
// backup core pure and testable. No business logic lives here.
//
// expo-sharing and expo-document-picker throw "Cannot find native module" in
// Expo Go. Each function wraps its require() calls in try/catch and re-throws a
// typed sentinel (nativeUnavailable: true) so RitualsApp can show a clear toast
// instead of propagating the raw Hermes error. Metro requires static string
// literals in require() — no dynamic require(variable) allowed.

export async function exportFile(filename, text) {
  let FileSystem, Sharing;
  try {
    FileSystem = require('expo-file-system');
    Sharing = require('expo-sharing');
  } catch {
    throw Object.assign(new Error('BACKUP_NATIVE_UNAVAILABLE'), { nativeUnavailable: true });
  }
  const UTF8 = { encoding: FileSystem.EncodingType.UTF8 };
  const uri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, text, UTF8);
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Save your journal backup' });
  return true;
}

export async function pickFile() {
  let FileSystem, DocumentPicker;
  try {
    FileSystem = require('expo-file-system');
    DocumentPicker = require('expo-document-picker');
  } catch {
    throw Object.assign(new Error('BACKUP_NATIVE_UNAVAILABLE'), { nativeUnavailable: true });
  }
  const UTF8 = { encoding: FileSystem.EncodingType.UTF8 };
  const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (res.canceled || !res.assets || !res.assets[0]) return null;
  return FileSystem.readAsStringAsync(res.assets[0].uri, UTF8);
}

export async function writeRecovery(text, now = new Date()) {
  let FileSystem;
  try {
    FileSystem = require('expo-file-system');
  } catch {
    throw Object.assign(new Error('BACKUP_NATIVE_UNAVAILABLE'), { nativeUnavailable: true });
  }
  const UTF8 = { encoding: FileSystem.EncodingType.UTF8 };
  const name = `daily-rituals-recovery-${now.toISOString().replace(/[:.]/g, '-')}.json`;
  await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + name, text, UTF8);
  return name;
}
