import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Home, Compass, Users, Target, Inbox } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 5 Icons representing the core Nexus navigation tabs
const TabIcons = {
  Home,
  Discover: Compass,
  Connect: Users,
  Mission: Target,
  Inbox,
};

export default function NexusNavBar({ state, descriptors, navigation }) {
  // Filter routes to exactly the 5 requested core sections
  const routes = state.routes.filter(r => ['Home', 'Discover', 'Connect', 'Mission', 'Inbox'].includes(r.name));
  const activeIndex = routes.findIndex(r => r.name === state.routes[state.index].name);

  // Fallback index to first tab if the current active route is not in the navbar
  const resolvedIndex = activeIndex !== -1 ? activeIndex : 0;

  const tabWidth = SCREEN_WIDTH / routes.length;

  // Reanimated shared values for organic blob
  const blobX = useSharedValue(0);
  const blobY = useSharedValue(0);
  const blobScaleX = useSharedValue(1.0);
  const blobScaleY = useSharedValue(1.0);
  const blobRotate = useSharedValue(0);
  const blobMorph = useSharedValue(0);

  // Tracking index changes to calculate jump velocity/direction
  const prevIndexRef = useRef(resolvedIndex);

  // Notifications simulation state
  const [notifState, setNotifState] = useState([false, true, false, false, false]);

  useEffect(() => {
    // 60fps Continuous morph animation for local asset breathing shape-shift
    blobMorph.value = withRepeat(
      withTiming(1.0, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    const targetX = resolvedIndex * tabWidth + tabWidth / 2 - 28; // Center 56px blob in the tab width

    // Compute jump direction and scale based on movement size
    const indexDelta = Math.abs(resolvedIndex - prevIndexRef.current);
    const direction = resolvedIndex > prevIndexRef.current ? 1 : -1;

    if (indexDelta > 0) {
      // 1. Upward Arc sequence as blob bounds across tabs
      const arcHeight = -16 - Math.min(20, indexDelta * 6);
      blobY.value = withSequence(
        withTiming(arcHeight, { duration: 160, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) })
      );

      // 2. Squash and stretch deformation during motion
      const stretchAmount = 1.0 + Math.min(0.5, indexDelta * 0.15);
      const squashAmount = 1.0 - Math.min(0.3, indexDelta * 0.1);

      blobScaleX.value = withSequence(
        withTiming(stretchAmount, { duration: 160, easing: Easing.out(Easing.quad) }),
        withSpring(1.0, { damping: 9, stiffness: 120 })
      );
      blobScaleY.value = withSequence(
        withTiming(squashAmount, { duration: 160, easing: Easing.out(Easing.quad) }),
        withSpring(1.0, { damping: 9, stiffness: 120 })
      );

      // 3. Directional rotation lean
      const maxTilt = direction * Math.min(15, indexDelta * 5);
      blobRotate.value = withSequence(
        withTiming(maxTilt, { duration: 160, easing: Easing.out(Easing.quad) }),
        withSpring(0, { damping: 9, stiffness: 120 })
      );
    }

    // 4. Smooth spring translation across GPU thread
    blobX.value = withSpring(targetX, {
      damping: 15,
      stiffness: 110,
    });

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    prevIndexRef.current = resolvedIndex;
  }, [resolvedIndex, tabWidth]);

  // Morphing blob style based on bezier control weights
  const blobStyle = useAnimatedStyle(() => {
    // Generate organic, rounded blob corners that slowly pulse over time
    const rLeftTop = interpolate(blobMorph.value, [0, 0.5, 1], [18, 30, 14]);
    const rRightTop = interpolate(blobMorph.value, [0, 0.5, 1], [26, 16, 32]);
    const rLeftBot = interpolate(blobMorph.value, [0, 0.5, 1], [22, 26, 18]);
    const rRightBot = interpolate(blobMorph.value, [0, 0.5, 1], [15, 24, 26]);

    return {
      transform: [
        { translateX: blobX.value },
        { translateY: blobY.value },
        { scaleX: blobScaleX.value },
        { scaleY: blobScaleY.value },
        { rotate: `${blobRotate.value}deg` },
      ],
      borderTopLeftRadius: rLeftTop,
      borderTopRightRadius: rRightTop,
      borderBottomLeftRadius: rLeftBot,
      borderBottomRightRadius: rRightBot,
    };
  });

  return (
    <View style={styles.tabContainer}>
      {/* Dynamic 60fps Organic Blob Indicator */}
      <Animated.View style={[styles.blob, blobStyle]} />

      {routes.map((route, index) => {
        const isFocused = resolvedIndex === index;
        const IconComponent = TabIcons[route.name] || Home;

        const onPress = () => {
          const matchingGlobalRoute = state.routes.find(r => r.name === route.name);
          if (!matchingGlobalRoute) return;

          const event = navigation.emit({
            type: 'tabPress',
            target: matchingGlobalRoute.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }

          // Dim/read the notification dot if user moves to that segment
          if (notifState[index]) {
            const updated = [...notifState];
            updated[index] = false;
            setNotifState(updated);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            android_ripple={{ color: 'rgba(127, 119, 221, 0.1)', borderless: true }}
            testID={`nav_tab_${route.name.toLowerCase()}`}
          >
            <TabIconWrapper
              isFocused={isFocused}
              hasNotification={notifState[index]}
              IconComponent={IconComponent}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

// Sub-component wrapper to isolate icon focus spring loops & rotation bounces
function TabIconWrapper({ isFocused, hasNotification, IconComponent }) {
  const iconScale = useSharedValue(1);
  const iconTranslateY = useSharedValue(0);
  const iconRotate = useSharedValue(0);
  const dotScale = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      iconScale.value = withTiming(1.22, { duration: 180, easing: Easing.out(Easing.quad) });
      
      // Active bounce jump & rotational tilt loop sequence
      iconTranslateY.value = withSequence(
        withTiming(-9, { duration: 130, easing: Easing.out(Easing.quad) }),
        withSpring(0, { damping: 9, stiffness: 150 })
      );
      iconRotate.value = withSequence(
        withTiming(14, { duration: 130, easing: Easing.out(Easing.quad) }),
        withSpring(0, { damping: 7 })
      );
    } else {
      iconScale.value = withTiming(0.9, { duration: 180 });
      iconTranslateY.value = withTiming(0, { duration: 180 });
      iconRotate.value = withTiming(0, { duration: 180 });
    }
  }, [isFocused]);

  useEffect(() => {
    if (hasNotification) {
      // Play a lively pulse sequence for notifications
      dotScale.value = withSequence(
        withTiming(1.35, { duration: 250 }),
        withTiming(0.75, { duration: 180 }),
        withTiming(1.25, { duration: 180 }),
        withSpring(1.0, { damping: 9 })
      );
    } else {
      dotScale.value = withTiming(0, { duration: 180 });
    }
  }, [hasNotification]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: iconScale.value },
        { translateY: iconTranslateY.value },
        { rotate: `${iconRotate.value}deg` },
      ],
      opacity: isFocused ? 1.0 : 0.55,
    };
  });

  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: dotScale.value }],
    };
  });

  return (
    <View style={styles.iconWrapper}>
      <Animated.View style={animatedIconStyle}>
        <IconComponent color={isFocused ? '#FFFFFF' : '#8E8E9F'} size={22} />
      </Animated.View>

      {/* Pulsing notification dot badge */}
      {hasNotification && (
        <Animated.View style={[styles.notifBadge, animatedDotStyle]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    height: 72,
    backgroundColor: 'rgba(28, 28, 50, 0.91)', // Premium frosted dark backdrop
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(127, 119, 221, 0.3)', // Micro-thin glowing top split line
    paddingBottom: 16,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    width: 56,
    height: 38,
    backgroundColor: 'rgba(127, 119, 221, 0.28)', // Radiant purple neon glow blob
    top: 6,
    zIndex: 0,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 46,
  },
  notifBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ED93B1', // High vibrant coral pink badge
    borderWidth: 1,
    borderColor: '#1C1C32',
  },
});
