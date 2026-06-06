import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AnimatedButton({
  onPress,
  onLongPress,
  children,
  type = 'primary', // 'primary' | 'danger' | 'success' | 'icon'
  style,
  textStyle,
  label,
  successCompleted = false,
  iconComponent,
  disabled = false,
}) {
  const scale = useSharedValue(1);
  const borderRadius = useSharedValue(12);
  const colorProgress = useSharedValue(0); // 0 normal, 1 pressed, 2 success state
  const shakeX = useSharedValue(0);
  const successWave = useSharedValue(0);
  const longPressProgress = useSharedValue(0);

  const [isSuccessAnimated, setIsSuccessAnimated] = useState(successCompleted);

  // Trigger success wave animation when successCompleted shifts
  useEffect(() => {
    if (successCompleted && !isSuccessAnimated) {
      successWave.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
      setIsSuccessAnimated(true);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    } else if (!successCompleted) {
      successWave.value = 0;
      setIsSuccessAnimated(false);
    }
  }, [successCompleted]);

  const handlePressIn = (e) => {
    if (disabled) return;

    // Elastic curve for press down (80ms)
    scale.value = withTiming(0.94, { duration: 80, easing: Easing.bezier(0.25, 1, 0.5, 1) });
    borderRadius.value = withTiming(20, { duration: 80 });
    colorProgress.value = withTiming(1, { duration: 80 });

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  };

  const handlePressOut = () => {
    if (disabled) return;

    // Bounce back to 1.04 then 1.0
    scale.value = withSequence(
      withTiming(1.04, { duration: 100 }),
      withSpring(1.0, { damping: 12, stiffness: 200 })
    );

    borderRadius.value = withTiming(12, { duration: 200 });
    colorProgress.value = withTiming(0, { duration: 150 });
  };

  const handlePress = () => {
    if (disabled) return;

    if (type === 'danger') {
      // Danger button shake horizontal (3 times over 300ms)
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {}

      // Pause briefly for warning and then call press
      setTimeout(() => {
        if (onPress) onPress();
      }, 350);
    } else {
      if (onPress) onPress();
    }
  };

  const handleLongPress = () => {
    if (disabled) return;

    // Expand on long press
    scale.value = withTiming(1.08, { duration: 200 });
    borderRadius.value = withTiming(25, { duration: 200 }); // pill shape
    longPressProgress.value = withRepeat(
      withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    if (onLongPress) onLongPress();
  };

  // Animated styles for button body
  const animatedStyle = useAnimatedStyle(() => {
    const baseColor =
      type === 'danger'
        ? '#F0997B'
        : type === 'success'
        ? '#1D9E75'
        : '#7F77DD';

    const pressedColor =
      type === 'danger'
        ? '#D17C60'
        : type === 'success'
        ? '#167D5C'
        : '#645CBF';

    const bg = interpolateColor(
      colorProgress.value,
      [0, 1],
      [baseColor, pressedColor]
    );

    return {
      transform: [
        { scale: scale.value },
        { translateX: shakeX.value },
      ],
      borderRadius: borderRadius.value,
      backgroundColor: bg,
    };
  });

  const waveStyle = useAnimatedStyle(() => {
    const waveWidth = interpolate(successWave.value, [0, 1], [0, 100]);
    return {
      width: `${waveWidth}%`,
      opacity: successWave.value < 0.9 ? 1 : withTiming(0, { duration: 300 }),
    };
  });

  const checkmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: successWave.value,
      transform: [{ scale: successWave.value }],
    };
  });

  return (
    <View style={styles.shadowContainer}>
      {/* Pulse ring animation during Long Press holds */}
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={[styles.button, animatedStyle, style]}
      >
        {/* Success Teal Wave overlay */}
        <Animated.View style={[styles.successWaveFill, waveStyle]} />

        <View style={styles.contentRow}>
          {iconComponent && <View style={styles.iconBox}>{iconComponent}</View>}
          {label && (
            <Text style={[styles.label, textStyle]}>
              {label}
            </Text>
          )}
          {children}

          {/* Morphing success checkmark dynamically fading-in */}
          {isSuccessAnimated && (
            <Animated.Text style={[styles.successCheck, checkmarkStyle]}>
              ✓
            </Animated.Text>
          )}
        </View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: '#131324',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    alignSelf: 'stretch',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    minHeight: 48,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconBox: {
    marginRight: 8,
  },
  successWaveFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#1D9E75',
    zIndex: 1,
  },
  successCheck: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 8,
  },
});
