import AsyncStorage from '@react-native-async-storage/async-storage';
import { serialize, deserialize } from './state';

const KEY = 'dailyrituals:v1:state';
const PENDING_RESTORE_KEY = 'dailyrituals:v1:pendingRestore';

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return deserialize(raw);
  } catch (e) {
    console.warn('loadState failed; starting fresh', e);
    return null;
  }
}

// The raw, undeserialized payload string — IMP-033's quarantine stashes this
// exactly, so a forward-migration never mutates what a decline later restores.
export async function readRawState() {
  try {
    return await AsyncStorage.getItem(KEY);
  } catch (e) {
    console.warn('readRawState failed', e);
    return null;
  }
}

export async function writePendingRestore(raw) {
  try {
    await AsyncStorage.setItem(PENDING_RESTORE_KEY, raw);
    return true;
  } catch (e) {
    console.warn('writePendingRestore failed', e);
    return false;
  }
}

export async function readPendingRestore() {
  try {
    return await AsyncStorage.getItem(PENDING_RESTORE_KEY);
  } catch (e) {
    console.warn('readPendingRestore failed', e);
    return null;
  }
}

export async function clearPendingRestore() {
  try { await AsyncStorage.removeItem(PENDING_RESTORE_KEY); return true; }
  catch (e) { console.warn('clearPendingRestore failed', e); return false; }
}

export async function saveState(slice) {
  try {
    await AsyncStorage.setItem(KEY, serialize(slice));
    return true;
  } catch (e) {
    console.warn('saveState failed', e);
    return false;
  }
}

export async function clearState() {
  try { await AsyncStorage.removeItem(KEY); return true; }
  catch (e) { console.warn('clearState failed', e); return false; }
}
