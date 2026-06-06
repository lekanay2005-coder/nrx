import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useDerivedValue,
  interpolateColor,
  useFrameCallback,
  useAnimatedReaction,
  runOnUI,
} from 'react-native-reanimated';
import { Canvas, Fill, Circle } from '@shopify/react-native-skia';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// TIMELINE CONFIGURATION (24h in minutes)
const TIMELINE_MINUTES = [
  0,    // Midnight
  280,  // 4:40 AM
  320,  // 5:20 AM
  520,  // 8:40 AM
  560,  // 9:20 AM
  1000, // 4:40 PM
  1040, // 5:20 PM
  1240, // 8:40 PM
  1280, // 9:20 PM
  1440, // End of day
];

// SLOT A COLLOURS
const SLOT_A_COLORS = [
  '#7F77DD', // Midnight (Night Purple)
  '#7F77DD', // 4:40 AM
  '#FAC775', // 5:20 AM (Morning Gold)
  '#FAC775', // 8:40 AM
  '#5DCAA5', // 9:20 AM (Daytime Teal)
  '#5DCAA5', // 4:40 PM
  '#F0997B', // 5:20 PM (Evening Coral)
  '#F0997B', // 8:40 PM
  '#7F77DD', // 9:20 PM (Night Purple)
  '#7F77DD', // 12:00 AM
];

// SLOT B COLLOURS
const SLOT_B_COLORS = [
  '#FFFFFF', // Midnight (Star Specs)
  '#7F77DD', // 4:40 AM
  '#ED93B1', // 5:20 AM (Morning Pink)
  '#ED93B1', // 8:40 AM
  '#AFA9EC', // 9:20 AM (Daytime Light Purple)
  '#AFA9EC', // 4:40 PM
  '#E28743', // 5:20 PM (Evening Amber)
  '#E28743', // 8:40 PM
  '#FFFFFF', // 9:20 PM (Star Specs)
  '#FFFFFF', // 12:00 AM
];

// CANVAS BACKGROUND GRADIENT TIMELINE
const BG_COLORS = [
  '#08080E', // Midnight (Near-black)
  '#08080E', // 4:40 AM
  '#0F0F1A', // 5:20 AM (Deep Dawn Indigo)
  '#0F0F1A', // 8:40 AM
  '#131324', // 9:20 AM (Classic Deep Space Navy)
  '#131324', // 4:40 PM
  '#15101E', // 5:20 PM (Sunset Dusk purple-dark)
  '#15101E', // 8:40 PM
  '#08080E', // 9:20 PM (Near-black)
  '#08080E', // Midnight
];

// Static emitter for success bursts and scrolling boosts
export const BackgroundController = {
  triggerSuccess: null,
  triggerScrollBoost: null,
};

// 1. FLOATING PARTICLE COMPONENT
const FloatingParticle = ({ index, activeCount, speedMultiplier, colorA, colorB }) => {
  const x = useSharedValue(Math.random() * SCREEN_WIDTH);
  const y = useSharedValue(Math.random() * SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  const r = useMemo(() => 2 + Math.random() * 4, []);
  const baseOpacity = useMemo(() => 0.15 + Math.random() * 0.55, []);
  const speed = useMemo(() => 0.3 + Math.random() * 0.9, []);
  const driftPhase = useMemo(() => Math.random() * Math.PI * 2, []);
  const driftX = useMemo(() => 10 + Math.random() * 25, []);
  const startX = useMemo(() => Math.random() * SCREEN_WIDTH, []);
  const colorSlot = useMemo(() => (Math.random() > 0.5 ? 0 : 1), []);

  useFrameCallback((frameInfo) => {
    'worklet';
    const dt = frameInfo.timeSinceLastFrame ? frameInfo.timeSinceLastFrame / 16.666 : 1.0;
    const isActive = index < activeCount.value;

    // Smoothly calculate target opacity with top/bottom edge padding
    if (isActive) {
      let targetOp = 1.0;
      if (y.value < 100) {
        targetOp = y.value / 100;
      } else if (y.value > SCREEN_HEIGHT - 100) {
        targetOp = (SCREEN_HEIGHT - y.value) / 100;
      }
      targetOp *= baseOpacity;
      opacity.value = opacity.value + (targetOp - opacity.value) * 0.1 * dt;
    } else {
      opacity.value = opacity.value + (0 - opacity.value) * 0.1 * dt;
    }

    // Apply rising motion
    const currentSpeed = speed * speedMultiplier.value;
    y.value -= currentSpeed * dt;

    if (y.value < -10) {
      y.value = SCREEN_HEIGHT + 10;
    }

    // Sine wave horizontal drift
    const sineOffset = Math.sin(y.value * 0.005 + driftPhase) * driftX;
    x.value = startX + sineOffset;
  });

  const color = useDerivedValue(() => {
    return colorSlot === 0 ? colorA.value : colorB.value;
  });

  return <Circle cx={x} cy={y} r={r} opacity={opacity} color={color} />;
};

// 2. TAP EXPLOSION BURST PARTICLE
const BurstParticle = ({ index, triggerBurstSignal, colorA, colorB }) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const vx = useSharedValue(0);
  const vy = useSharedValue(0);
  const opacity = useSharedValue(0);
  const age = useSharedValue(0);
  const color = useSharedValue('#FFFFFF');

  const r = useMemo(() => 2.5 + Math.random() * 3, []);

  useAnimatedReaction(
    () => triggerBurstSignal.value,
    (signal) => {
      'worklet';
      if (signal.timestamp === 0) return;

      const mySlot = Math.floor(index / 8);
      if (mySlot === signal.burstSlot) {
        x.value = signal.tapX;
        y.value = signal.tapY;

        const localIdx = index % 8;
        const angle = (localIdx * 45 * Math.PI) / 180 + (Math.random() * 0.4 - 0.2);
        const speed = 3 + Math.random() * 5;

        vx.value = Math.cos(angle) * speed;
        vy.value = Math.sin(angle) * speed;
        opacity.value = 1.0;
        color.value = Math.random() > 0.5 ? colorA.value : colorB.value;
        age.value = 0;
      }
    }
  );

  useFrameCallback((frameInfo) => {
    'worklet';
    if (opacity.value <= 0) return;
    const dt = frameInfo.timeSinceLastFrame ? frameInfo.timeSinceLastFrame / 16.666 : 1.0;

    x.value += vx.value * dt;
    y.value += vy.value * dt;

    vx.value *= Math.pow(0.95, dt);
    vy.value *= Math.pow(0.95, dt);

    age.value += 16.666 * dt;
    if (age.value >= 600) {
      opacity.value = 0;
    } else {
      opacity.value = 1.0 - age.value / 600;
    }
  });

  return <Circle cx={x} cy={y} r={r} opacity={opacity} color={color} />;
};

// 3. SUCCESS CONFETTI PARTICLES
const ConfettiParticle = ({ index, triggerConfettiSignal }) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const vx = useSharedValue(0);
  const vy = useSharedValue(0);
  const opacity = useSharedValue(0);
  const age = useSharedValue(0);
  const color = useSharedValue('#FFFFFF');

  const r = useMemo(() => 3 + Math.random() * 4, []);

  useAnimatedReaction(
    () => triggerConfettiSignal.value,
    (signal) => {
      'worklet';
      if (signal.timestamp === 0) return;

      const mySlot = Math.floor(index / 20);
      if (mySlot === signal.confettiSlot) {
        x.value = Math.random() * SCREEN_WIDTH;
        y.value = SCREEN_HEIGHT + 10;

        vx.value = Math.random() * 6 - 3;
        vy.value = -(6 + Math.random() * 12);

        opacity.value = 1.0;
        const colors = ['#5DCAA5', '#AFA9EC', '#ED93B1', '#F0997B'];
        color.value = colors[index % colors.length];
        age.value = 0;
      }
    }
  );

  useFrameCallback((frameInfo) => {
    'worklet';
    if (opacity.value <= 0) return;
    const dt = frameInfo.timeSinceLastFrame ? frameInfo.timeSinceLastFrame / 16.666 : 1.0;

    x.value += vx.value * dt;
    y.value += vy.value * dt;

    vy.value += 0.22 * dt; // Gravity pull

    age.value += 16.666 * dt;
    if (age.value >= 1500) {
      opacity.value = 0;
    } else {
      opacity.value = 1.0 - age.value / 1500;
    }
  });

  return <Circle cx={x} cy={y} r={r} opacity={opacity} color={color} />;
};

export default function GlobalBackground({ children, hourOverride, mood = 'DEFAULT' }) {
  // TIME STATE
  const hourShared = useSharedValue(new Date().getHours());
  const minuteShared = useSharedValue(new Date().getMinutes());

  // Set initial overrides if provided
  useEffect(() => {
    if (hourOverride !== undefined) {
      hourShared.value = hourOverride;
      minuteShared.value = 0;
    }
  }, [hourOverride]);

  // Continuously sync time
  useEffect(() => {
    if (hourOverride === undefined) {
      const interval = setInterval(() => {
        const d = new Date();
        hourShared.value = d.getHours();
        minuteShared.value = d.getMinutes();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [hourOverride]);

  const currentMinutes = useDerivedValue(() => {
    return hourShared.value * 60 + minuteShared.value;
  });

  // Derived slot colors interpolated over 20-minute transition boundaries
  const colorAShared = useDerivedValue(() => {
    return interpolateColor(currentMinutes.value, TIMELINE_MINUTES, SLOT_A_COLORS);
  });

  const colorBShared = useDerivedValue(() => {
    return interpolateColor(currentMinutes.value, TIMELINE_MINUTES, SLOT_B_COLORS);
  });

  const bgShared = useDerivedValue(() => {
    return interpolateColor(currentMinutes.value, TIMELINE_MINUTES, BG_COLORS);
  });

  // MOOD SPEEDS AND COUNTS CONFIGURATION
  const activeCountShared = useSharedValue(48);
  const speedMultiplierShared = useSharedValue(1.0);

  useEffect(() => {
    if (mood === 'IDLE') {
      activeCountShared.value = 40;
      speedMultiplierShared.value = 0.4;
    } else if (mood === 'ACTIVE') {
      activeCountShared.value = 60;
      speedMultiplierShared.value = 2.5;
    } else {
      activeCountShared.value = 48;
      speedMultiplierShared.value = 1.0;
    }
  }, [mood]);

  // ACTION EMITTERS
  const triggerBurstSignal = useSharedValue({ tapX: 0, tapY: 0, timestamp: 0, burstSlot: 0 });
  const nextBurstIdx = useSharedValue(0);

  const triggerConfettiSignal = useSharedValue({ timestamp: 0, confettiSlot: 0 });
  const nextConfettiIdx = useSharedValue(0);

  const handleTap = (e) => {
    const { locationX, locationY } = e.nativeEvent;

    // Shift to next available tap pool quadrant
    runOnUI((lx, ly) => {
      'worklet';
      const currentSlot = Math.floor(nextBurstIdx.value / 8);
      triggerBurstSignal.value = {
        tapX: lx,
        tapY: ly,
        timestamp: Date.now(),
        burstSlot: currentSlot,
      };
      nextBurstIdx.value = (nextBurstIdx.value + 8) % 32;
    })(locationX, locationY);
  };

  const spawnSuccessConfetti = () => {
    'worklet';
    const currentSlot = Math.floor(nextConfettiIdx.value / 20);
    triggerConfettiSignal.value = {
      timestamp: Date.now(),
      confettiSlot: currentSlot,
    };
    nextConfettiIdx.value = (nextConfettiIdx.value + 20) % 40;
  };

  // Wire static methods of the controller
  useEffect(() => {
    BackgroundController.triggerSuccess = () => {
      runOnUI(spawnSuccessConfetti)();
    };

    BackgroundController.triggerScrollBoost = () => {
      runOnUI(() => {
        'worklet';
        speedMultiplierShared.value = 1.8;
      })();
      setTimeout(() => {
        runOnUI(() => {
          'worklet';
          speedMultiplierShared.value = 1.0;
        })();
      }, 1000);
    };

    return () => {
      BackgroundController.triggerSuccess = null;
      BackgroundController.triggerScrollBoost = null;
    };
  }, []);

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      <Canvas style={StyleSheet.absoluteFillObject}>
        {/* Dynamic Space Background */}
        <Fill color={bgShared} />

        {/* 60 Floating Particles always pre-allocated */}
        {Array.from({ length: 60 }).map((_, i) => (
          <FloatingParticle
            key={`float-${i}`}
            index={i}
            activeCount={activeCountShared}
            speedMultiplier={speedMultiplierShared}
            colorA={colorAShared}
            colorB={colorBShared}
          />
        ))}

        {/* 32 Burst Particles on-demand pool */}
        {Array.from({ length: 32 }).map((_, i) => (
          <BurstParticle
            key={`burst-${i}`}
            index={i}
            triggerBurstSignal={triggerBurstSignal}
            colorA={colorAShared}
            colorB={colorBShared}
          />
        ))}

        {/* 40 Success/Checklist Confetti upward particles */}
        {Array.from({ length: 40 }).map((_, i) => (
          <ConfettiParticle
            key={`confetti-${i}`}
            index={i}
            triggerConfettiSignal={triggerConfettiSignal}
          />
        ))}
      </Canvas>

      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
