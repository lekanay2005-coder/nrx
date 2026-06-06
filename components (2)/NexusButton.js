import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  useDerivedValue,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useHaptics } from '../hooks/useHaptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function NexusButton({
  onPress,
  label,
  children,
  type = 'primary', // 'primary' | 'secondary' | 'success' | 'danger'
  style,
  textStyle,
  disabled = false,
  iconComponent, // Custom icon if provided fallback
  morphToStar = true, // Force star shape morphing
  testID,
}) {
  const haptic = useHaptics();

  // Animation shared values
  const scale = useSharedValue(1.0);
  const borderRadius = useSharedValue(12);
  const starMorphProgress = useSharedValue(0.0);
  const colorProgress = useSharedValue(0.0);

  // Ripple effect shared values
  const rippleX = useSharedValue(0);
  const rippleY = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  // Trigger when disabled state changes
  useEffect(() => {
    if (disabled) {
      starMorphProgress.value = withTiming(0, { duration: 150 });
      borderRadius.value = withTiming(12, { duration: 150 });
    }
  }, [disabled]);

  const handlePressIn = (event) => {
    if (disabled) return;
    haptic('LIGHT');

    // Capture click coordinates to center visual ripple
    const locationX = event?.nativeEvent?.locationX ?? 120;
    const locationY = event?.nativeEvent?.locationY ?? 24;
    rippleX.value = locationX;
    rippleY.value = locationY;
    rippleScale.value = 0;
    rippleOpacity.value = 0.55;

    // Expand ripple visual wave
    rippleScale.value = withTiming(1.0, {
      duration: 350,
      easing: Easing.out(Easing.quad),
    });
    rippleOpacity.value = withTiming(0, {
      duration: 350,
      easing: Easing.out(Easing.quad),
    });

    // 1. Scale down to 0.94 on press
    scale.value = withTiming(0.94, {
      duration: 80,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });

    // 2. Morph border radius from 12px to 20px
    borderRadius.value = withTiming(20, {
      duration: 100,
    });

    // Reset star shape to clean default circle before triggering action morph on release
    if (morphToStar && (type === 'primary' || type === 'success')) {
      starMorphProgress.value = withTiming(0, { duration: 50 });
    }

    colorProgress.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled) return;

    // 4. Spring-based bounce on release
    scale.value = withSequence(
      withTiming(1.05, { duration: 100, easing: Easing.out(Easing.quad) }),
      withSpring(1.0, { damping: 10, stiffness: 200 })
    );

    // Revert border radius morphing
    borderRadius.value = withTiming(12, {
      duration: 180,
    });

    // 5. Morph Star Shape ON RELEASE (Primary Action)
    if (morphToStar && (type === 'primary' || type === 'success')) {
      starMorphProgress.value = withSequence(
        withTiming(1, {
          duration: 250,
          easing: Easing.out(Easing.back(1.5)),
        }),
        withDelay(
          1200,
          withTiming(0, {
            duration: 350,
            easing: Easing.out(Easing.quad),
          })
        )
      );
    }

    colorProgress.value = withTiming(0, { duration: 150 });
  };

  const handlePress = () => {
    if (disabled) return;
    haptic('SUCCESS');
    if (onPress) onPress();
  };

  // Reanimated style for the button body
  const buttonStyle = useAnimatedStyle(() => {
    // Pick base and pressed colors matching cosmic design scheme
    let baseBg = '#7F77DD';
    let pressedBg = '#645CBF';

    if (type === 'secondary') {
      baseBg = '#141426';
      pressedBg = '#1D1D35';
    } else if (type === 'success') {
      baseBg = '#1D9E75';
      pressedBg = '#157D5C';
    } else if (type === 'danger') {
      baseBg = '#F0997B';
      pressedBg = '#D17C60';
    }

    const bg = interpolateColor(
      colorProgress.value,
      [0, 1],
      [baseBg, pressedBg]
    );

    return {
      transform: [{ scale: scale.value }],
      borderRadius: borderRadius.value,
      backgroundColor: bg,
      borderColor: type === 'secondary' ? '#3B3B66' : 'transparent',
      borderWidth: type === 'secondary' ? 1.5 : 0,
      opacity: disabled ? 0.5 : 1.0,
    };
  });

  // Reanimated style for interactive ripple layer
  const rippleStyle = useAnimatedStyle(() => {
    const radius = 250;
    return {
      position: 'absolute',
      left: rippleX.value - radius,
      top: rippleY.value - radius,
      width: radius * 2,
      height: radius * 2,
      borderRadius: radius,
      backgroundColor: type === 'secondary' ? 'rgba(127, 119, 221, 0.2)' : 'rgba(255, 255, 255, 0.3)',
      opacity: rippleOpacity.value,
      transform: [{ scale: rippleScale.value }],
    };
  });

  // Dynamic Skia Vector Path generation for Star Morphing
  const starPath = useDerivedValue(() => {
    const path = Skia.Path.make();
    const cx = 12;
    const cy = 12;
    const spikes = 5;
    const outerRadius = 10.5;

    // Morph the inner radius: progress = 0 is close to outerRadius, making it a circle/regular polygon.
    // progress = 1 is standard star inner radius ratio.
    const progress = starMorphProgress.value;
    const innerRadius = outerRadius * (1.0 - progress * 0.62);

    const pointsCount = spikes * 2;
    for (let i = 0; i < pointsCount; i++) {
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      if (i === 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    return path;
  });

  // Star color morphs from ambient silver/light-purple to glowing golden-yellow
  const starColor = useDerivedValue(() => {
    return interpolateColor(
      starMorphProgress.value,
      [0, 1],
      ['#AFA9EC', '#FAC775']
    );
  });

  const isPrimaryOrSpecial = type === 'primary' || type === 'success';
  const shouldShowStar = morphToStar && isPrimaryOrSpecial;

  return (
    <View style={styles.shadowContainer}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        testID={testID || 'nexus_button'}
        style={[styles.button, buttonStyle, style]}
      >
        <Animated.View pointerEvents="none" style={rippleStyle} />
        <View style={styles.contentRow}>
          {/* Morphing Skia Star Icon on the left */}
          {shouldShowStar && (
            <Canvas style={styles.skiaCanvas}>
              <Path path={starPath} color={starColor} />
            </Canvas>
          )}

          {/* Simple non-morphing fallback icon if supplied */}
          {!shouldShowStar && iconComponent && (
            <View style={styles.iconBox}>{iconComponent}</View>
          )}

          {/* Label or direct content */}
          {label ? (
            <Text
              style={[
                styles.label,
                type === 'secondary' ? styles.labelSecondary : styles.labelPrimary,
                textStyle,
              ]}
            >
              {label}
            </Text>
          ) : (
            children
          )}
        </View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: '#131324',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    alignSelf: 'stretch',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
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
  },
  skiaCanvas: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  iconBox: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  labelPrimary: {
    color: '#FFFFFF',
  },
  labelSecondary: {
    color: '#AFA9EC',
  },
});
