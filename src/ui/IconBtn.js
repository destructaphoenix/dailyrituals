// IconBtn.js — shared icon-only button (IMP-059). WriteFlow.js and
// ReadingSheet.js carried byte-identical copies with no accessible name;
// extracting once means the next icon-only button gets a label for free.
import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../theme';

export default function IconBtn({ onPress, label, children }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.ghostBtn }}
    >
      {children}
    </Pressable>
  );
}
