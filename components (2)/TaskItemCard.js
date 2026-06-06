import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Square, CheckSquare } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function TaskItemCard({ item, onToggle }) {
  const checkScale = useSharedValue(item.resolved ? 1.0 : 0.8);
  const strikeProgress = useSharedValue(item.resolved ? 1.0 : 0.0);
  const cardScale = useSharedValue(1.0);

  useEffect(() => {
    strikeProgress.value = withTiming(item.resolved ? 1.0 : 0.0, {
      duration: 300,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });

    checkScale.value = withSpring(item.resolved ? 1.15 : 1.0, {
      damping: 8,
    });
  }, [item.resolved]);

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    onToggle();
  };

  const animatedCheckStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkScale.value }],
    };
  });

  const animatedStrikeStyle = useAnimatedStyle(() => {
    return {
      width: `${strikeProgress.value * 100}%`,
      opacity: strikeProgress.value,
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
      backgroundColor: item.resolved ? 'rgba(29, 158, 117, 0.05)' : '#1C1C32',
      borderColor: item.resolved ? 'rgba(29, 158, 117, 0.4)' : '#29294C',
    };
  });

  return (
    <Pressable
      onPressIn={() => (cardScale.value = withTiming(0.97, { duration: 60 }))}
      onPressOut={() => (cardScale.value = withSpring(1.0))}
      onPress={handlePress}
    >
      <Animated.View style={[styles.taskCard, animatedCardStyle]}>
        <View style={styles.row}>
          <Animated.View style={animatedCheckStyle}>
            {item.resolved ? (
              <CheckSquare size={22} color="#1D9E75" />
            ) : (
              <Square size={22} color="#8E8E9F" />
            )}
          </Animated.View>

          <View style={styles.textContainer}>
            <Text style={[styles.taskText, item.resolved && styles.textResolved]}>
              {item.task}
            </Text>

            {/* Strikethrough line drawing itself from left to right */}
            <Animated.View style={[styles.strikeLine, animatedStrikeStyle]} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  taskText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14.5,
  },
  textResolved: {
    color: '#8E8E9F',
  },
  strikeLine: {
    position: 'absolute',
    left: 0,
    height: 1.5,
    backgroundColor: '#8E8E9F',
    alignSelf: 'flex-start',
  },
});
