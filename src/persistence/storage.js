import AsyncStorage from '@react-native-async-storage/async-storage';
import { serialize, deserialize } from './state';

const KEY = 'dailyrituals:v1:state';

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return deserialize(raw);
  } catch (e) {
    console.warn('loadState failed; starting fresh', e);
    return null;
  }
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
