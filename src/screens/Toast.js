// screens/Toast.js — small economy-feedback pill, mirrored from the web
// `.ra-toast`. Pops up bottom-center, then fades; the host clears it on a timer.

import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';

export default function Toast({ message, bottom = 8 }) {
  const t = useTheme();
  const c = t.colors;
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(v, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 8 }).start();
  }, [v]);

  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 96 + bottom, alignItems: 'center', zIndex: 60,
        opacity: v, transform: [{ translateY }],
      }}
    >
      <Animated.View style={[{ backgroundColor: c.ink, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999 }, t.shadow(16, '#000', 0.4)]}>
        <T d w={800} color={c.cream} style={{ fontSize: 14 }}>{message}</T>
      </Animated.View>
    </Animated.View>
  );
}
