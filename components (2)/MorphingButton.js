import React, { useEffect } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MorphingButton({ onPress, children, active = false }) {
  const scale = useSharedValue(1);
  const morphProgress = useSharedValue(0);

  useEffect(() => {
    morphProgress.value = withSpring(active ? 1 : 0, { damping: 15 });
  }, [active]);

  const animatedStyles = useAnimatedStyle(() => {
    const borderRadius = 12 + morphProgress.value * 12;
    const backgroundColor = interpolateColor(
      morphProgress.value,
      [0, 1],
      ['#362D8C', '#1D9E75']
    );

    return {
      transform: [{ scale: scale.value }],
      borderRadius,
      backgroundColor,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.button, animatedStyles]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7F77DD',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
