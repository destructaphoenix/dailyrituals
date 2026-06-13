// io.js — the ONLY file that touches native file/share/pick modules. Keeps the
// backup core pure and testable. No business logic lives here.

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const UTF8 = { encoding: FileSystem.EncodingType.UTF8 };

// Write text to a temp file and open the OS share sheet (the off-device step).
// Returns true if the share sheet was presented.
export async function exportFile(filename, text) {
  const uri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, text, UTF8);
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Save your journal backup' });
  return true;
}

// Let the user pick a backup file; return its text, or null if they cancelled.
export async function pickFile() {
  const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (res.canceled || !res.assets || !res.assets[0]) return null;
  return FileSystem.readAsStringAsync(res.assets[0].uri, UTF8);
}

// Silent on-device safety copy written before a destructive import. Returns the filename.
export async function writeRecovery(text, now = new Date()) {
  const name = `daily-rituals-recovery-${now.toISOString().replace(/[:.]/g, '-')}.json`;
  await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + name, text, UTF8);
  return name;
}
