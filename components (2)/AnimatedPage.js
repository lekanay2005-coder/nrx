import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AnimatedPage({
  children,
  type = 'slide-overshoot', // 'slide-overshoot' | '3d-fold' | 'circular-reveal' | 'particle-dissolve'
  isActive = true,
  avatarX = SCREEN_WIDTH / 2,
  avatarY = 100,
}) {
  const enteringProgress = useSharedValue(0);

  useEffect(() => {
    // Standard transition duration in line with guidelines (under 400-500ms)
    enteringProgress.value = withTiming(1, {
      duration: type === 'particle-dissolve' ? 500 : type === '3d-fold' ? 400 : 350,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [type]);

  const animatedStyle = useAnimatedStyle(() => {
    if (type === '3d-fold') {
      // 3D perspective flip (folding back like a booklet)
      const rotateY = interpolate(enteringProgress.value, [0, 1], [-90, 0]);
      const opacity = interpolate(enteringProgress.value, [0, 0.5, 1], [0, 0.5, 1]);
      return {
        transform: [
          { perspective: 1200 },
          { rotateY: `${rotateY}deg` },
          { scale: interpolate(enteringProgress.value, [0, 1], [0.93, 1.0]) },
        ],
        opacity,
      };
    }

    if (type === 'particle-dissolve') {
      // Dissolve/reassemble transition utilizing opacity & slight scale/upward travel
      const opacity = interpolate(enteringProgress.value, [0, 1], [0, 1]);
      const translateY = interpolate(enteringProgress.value, [0, 1], [40, 0]);
      return {
        opacity,
        transform: [{ translateY }],
      };
    }

    if (type === 'circular-reveal') {
      // Expand bleeding-in circle from the avatar tap point
      const scale = interpolate(enteringProgress.value, [0, 1], [0.05, 1.0]);
      const opacity = interpolate(enteringProgress.value, [0, 0.2, 1], [0, 0.6, 1]);
      return {
        transform: [
          { translateX: avatarX - SCREEN_WIDTH / 2 },
          { translateY: avatarY - SCREEN_HEIGHT / 2 },
          { scale },
          { translateX: -(avatarX - SCREEN_WIDTH / 2) },
          { translateY: -(avatarY - SCREEN_HEIGHT / 2) },
        ],
        opacity,
      };
    }

    // Default: 'slide-overshoot' back transition with subtle elastic spring properties
    const translateX = interpolate(enteringProgress.value, [0, 1], [SCREEN_WIDTH, 0]);
    const scale = interpolate(enteringProgress.value, [0, 1], [0.92, 1.0]);

    return {
      transform: [
        { translateX: withSpring(translateX, { damping: 15, stiffness: 120 }).value || translateX },
        { scale },
      ],
    };
  });

  return (
    <Animated.View style={[styles.page, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#131324',
  },
});
