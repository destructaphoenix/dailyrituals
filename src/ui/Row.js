// Row.js — shared settings-row primitive (IMP-030). Extracted from YouScreen
// (PlusFlow.js had a byte-identical copy — fixing one and not the other is how
// the layout blowout recurred). Auto-stacks label-over-value when the estimated
// content width won't fit, instead of collapsing the label to one char per line.
import React from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';
import { Chevron } from '../icons';
import { shouldStackRow } from './rowFit';

// screen padding 40 + card padding 32 + icon 36 + gaps 22 + chevron 18
const CHROME_DP = 148;

export default function Row({ icon, label, labelColor, value, right, onPress, onLongPress }) {
  const t = useTheme();
  const c = t.colors;
  const { width, fontScale } = useWindowDimensions();
  const availableDp = width - CHROME_DP;
  const stacked = !right && shouldStackRow({ label, value, availableDp, fontScale });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!onPress && !onLongPress}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: stacked ? 'flex-start' : 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 15, opacity: pressed && onPress ? 0.6 : 1 }]}
    >
      <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      {stacked ? (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <T w={700} color={labelColor || c.ink} numberOfLines={2} style={{ fontSize: 15.5 }}>{label}</T>
            <T w={700} color={c.muted} numberOfLines={1} style={{ fontSize: 14, marginTop: 3 }}>{value}</T>
          </View>
          {onPress ? <Chevron dir="right" size={18} color={c.muted} /> : null}
        </View>
      ) : (
        <>
          <T w={700} color={labelColor || c.ink} numberOfLines={2} style={{ flex: 1, fontSize: 15.5 }}>{label}</T>
          {right || (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 }}>
              {value ? <T w={700} color={c.muted} numberOfLines={1} style={{ fontSize: 14, flexShrink: 1 }}>{value}</T> : null}
              {onPress ? <Chevron dir="right" size={18} color={c.muted} /> : null}
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}
