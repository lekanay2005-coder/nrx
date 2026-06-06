import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Particle = ({ delay, moodColor }) => {
  const startX = Math.random() * width;
  const startY = height + 50;
  const endY = -50;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 10000 + Math.random() * 8000,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const currentY = startY - progress.value * (startY - endY);
    const wobble = Math.sin(progress.value * Math.PI * 4) * 20;

    return {
      transform: [
        { translateX: startX + wobble },
        { translateY: currentY },
      ],
      opacity: progress.value < 0.2 ? progress.value * 5 : 1 - progress.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { backgroundColor: moodColor || '#7F77DD' },
        animatedStyle,
      ]}
    />
  );
};

export default function LivingParticleBackground({ moodColor }) {
  const count = 12;
  const particles = Array.from({ length: count });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((_, i) => (
        <Particle key={i} delay={i * 900} moodColor={moodColor} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
