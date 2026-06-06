import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Sparkles, MessageCircle } from 'lucide-react-native';

export default function MessageBubble({ message }) {
  const slideX = useSharedValue(200);
  const slideY = useSharedValue(0);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    // Message slides in from right with an arc (curving slide effect + bounce)
    slideX.value = withSpring(0, { damping: 14, stiffness: 100 });
    scale.value = withSpring(1.0, { damping: 12 });

    // Arc offset (slightly bounds upwards and drops back)
    slideY.value = withSequence(
      withTiming(-12, { duration: 150, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: slideX.value },
        { translateY: slideY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.bubble,
        message.isAi ? styles.aiBubble : styles.userBubble,
        animatedStyle,
      ]}
    >
      <View style={styles.row}>
        {message.isAi ? (
          <Sparkles size={12} color="#1D9E75" />
        ) : (
          <MessageCircle size={12} color="#7F77DD" />
        )}
        <Text style={styles.sourceText}>
          {message.isAi ? 'COMEBACK COACH' : 'YOU'}
        </Text>
      </View>
      <Text style={styles.messageText}>{message.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderWidth: 1.5,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(127, 119, 221, 0.12)',
    borderColor: 'rgba(127, 119, 221, 0.3)',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(29, 158, 117, 0.08)',
    borderColor: 'rgba(29, 158, 117, 0.25)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sourceText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#8E8E9F',
    marginLeft: 6,
    letterSpacing: 0.8,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
  },
});
