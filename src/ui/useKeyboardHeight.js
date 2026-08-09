// ui/useKeyboardHeight.js — the on-screen keyboard's own height, spent as
// padding by any screen that can't rely on the OS resizing the window for it
// (a Modal's dialog window, or edge-to-edge under API 36 — see IMP-051).
// Android only ever emits keyboardDidShow/Hide; keyboardWillShow/Hide there
// silently never fire.

import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => setHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}
