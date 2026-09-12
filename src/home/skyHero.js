// skyHero.js — full-bleed looping video sky behind a hero card's content
// (IMP-121). Renders the clip, a poster held over a cold/loading frame, and a
// bottom scrim for text legibility. It knows nothing about streaks, numerals
// or XP — `children` is laid out over it exactly as the caller composes it.
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';

export default function SkyHero({ source, poster, accent, children }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  const [ready, setReady] = useState(player.status === 'readyToPlay');

  useEffect(() => {
    const sub = player.addListener('statusChange', ({ status }) => {
      setReady(status === 'readyToPlay');
    });
    return () => sub.remove();
  }, [player]);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        nativeControls={false}
        pointerEvents="none"
      />
      {!ready && (
        <Image
          source={poster}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          pointerEvents="none"
        />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '28%' }}
      />
      {children}
    </View>
  );
}
