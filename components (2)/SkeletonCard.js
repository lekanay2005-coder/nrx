import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

export default function SkeletonCard() {
  const pulse = useSharedValue(0.35);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 900 }),
        withTiming(0.35, { duration: 900 })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      opacity: pulse.value,
    };
  });

  return (
    <View style={styles.postCard}>
      {/* Header Row */}
      <View style={styles.rowBetween}>
        <Animated.View style={[styles.skeletonElement, styles.authorSkeleton, animatedPulseStyle]} />
        <View style={styles.row}>
          <Animated.View style={[styles.skeletonElement, styles.chipSkeleton, animatedPulseStyle]} />
        </View>
      </View>

      {/* Content Text Lines */}
      <View style={styles.contentBlock}>
        <Animated.View style={[styles.skeletonElement, styles.textLineFull, animatedPulseStyle]} />
        <Animated.View style={[styles.skeletonElement, styles.textLineThreeQuarters, animatedPulseStyle]} />
        <Animated.View style={[styles.skeletonElement, styles.textLineHalf, animatedPulseStyle]} />
      </View>

      {/* Action Footer Button Skeletals */}
      <View style={styles.actionsRow}>
        <Animated.View style={[styles.skeletonElement, styles.actionButtonSkeleton, animatedPulseStyle]} />
        <Animated.View style={[styles.skeletonElement, styles.actionButtonSkeleton, animatedPulseStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#1C1C32',
    borderWidth: 1.5,
    borderColor: '#29294C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonElement: {
    backgroundColor: '#29294D',
    borderRadius: 6,
  },
  authorSkeleton: {
    width: 120,
    height: 14,
  },
  chipSkeleton: {
    width: 70,
    height: 18,
    borderRadius: 10,
  },
  contentBlock: {
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  textLineFull: {
    width: '100%',
    height: 12,
  },
  textLineThreeQuarters: {
    width: '85%',
    height: 12,
  },
  textLineHalf: {
    width: '50%',
    height: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonSkeleton: {
    width: 85,
    height: 28,
    borderRadius: 10,
  },
});
