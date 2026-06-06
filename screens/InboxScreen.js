import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Send, Sparkles } from 'lucide-react-native';
import GlobalBackground, { BackgroundController } from '../components/GlobalBackground';
import AnimatedPage from '../components/AnimatedPage';
import AnimatedTextInput from '../components/AnimatedTextInput';
import NexusButton from '../components/NexusButton';
import MessageBubble from '../components/MessageBubble';
import { useHaptics } from '../hooks/useHaptics';
import { geminiService } from '../services/gemini';

export default function InboxScreen() {
  const haptic = useHaptics();
  const [messages, setMessages] = useState([
    { text: "Welcome back! I am your ComeBack AI Coach. I'm here to support you, completely free of any judgment, shame, or guilt. What goal are we resetting, or what's on your mind today?", isAi: true },
    { text: "I missed a few days of my learning goals and feel like I failed.", isAi: false },
    { text: "That is completely natural and expected. Millions of people fall off track; what matters is restarting with a small, friction-free plan. No guilt—let's rebuild your momentum together!", isAi: true },
  ]);
  const [typedMessage, setTypedMessage] = useState('');

  // Paper Plane Action Shared Values
  const planeX = useSharedValue(0);
  const planeY = useSharedValue(0);
  const planeOpacity = useSharedValue(1);

  const sendMessage = async () => {
    const userPrompt = typedMessage.trim();
    if (!userPrompt) return;
    haptic('LIGHT');

    const updatedHistory = [...messages, { text: userPrompt, isAi: false }];
    setMessages(updatedHistory);
    setTypedMessage('');

    // Trigger paper plane flying animation: flies up and right off screen
    planeX.value = withSequence(
      withTiming(60, { duration: 250 }),
      withTiming(150, { duration: 150 })
    );
    planeY.value = withSequence(
      withTiming(-60, { duration: 250 }),
      withTiming(-150, { duration: 150 })
    );
    planeOpacity.value = withSequence(
      withTiming(0.8, { duration: 200 }),
      withTiming(0, { duration: 200 })
    );

    // Reset plane position after flight delay
    setTimeout(() => {
      planeX.value = 0;
      planeY.value = 0;
      planeOpacity.value = 1;
    }, 600);

    // Add loading indicator bubble
    setMessages(prev => [...prev, { text: "...", isAi: true, isTyping: true }]);

    try {
      const responseText = await geminiService.chatReply(updatedHistory, userPrompt);
      
      haptic('SUCCESS');
      if (BackgroundController.triggerSuccess) {
        BackgroundController.triggerSuccess(); // Confetti on message receipt
      }

      setMessages(prev => {
        const filtered = prev.filter(m => !m.isTyping);
        return [...filtered, { text: responseText, isAi: true }];
      });
    } catch (err) {
      console.warn("AI response generation error in chat:", err);
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isTyping);
        return [...filtered, { text: "ComeBack AI Coach was unable to connect. Let's focus on showing up today anyway!", isAi: true }];
      });
    }
  };

  const animatedPlaneStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: planeX.value },
        { translateY: planeY.value },
      ],
      opacity: planeOpacity.value,
    };
  });

  return (
    <AnimatedPage type="slide-overshoot">
      <GlobalBackground>
        <View style={styles.container}>
          <Text style={styles.title}>ComeBack AI Coach</Text>
          <Text style={styles.subtitle}>Empathy-powered recovery companion. Speak freely.</Text>

          <ScrollView contentContainerStyle={styles.scroll}>
            {messages.map((message, i) => (
              <MessageBubble key={i} message={message} />
            ))}
          </ScrollView>

          {/* Form typed actions tray */}
          <View style={styles.tray}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AnimatedTextInput
                label="Message ComeBack AI Coach..."
                placeholder="Talk to your coach..."
                value={typedMessage}
                onChangeText={setTypedMessage}
                isValid={typedMessage.trim().length > 3}
              />
            </View>

            <View style={styles.sendIconBoxOuter}>
              <NexusButton
                onPress={sendMessage}
                type="primary"
                style={styles.sendBtn}
                disabled={!typedMessage.trim()}
                morphToStar={false}
              >
                <Animated.View style={animatedPlaneStyle}>
                  <Send size={18} color="#FFFFFF" />
                </Animated.View>
              </NexusButton>
            </View>
          </View>
        </View>
      </GlobalBackground>
    </AnimatedPage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E9F',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 160, // Excess padding for overlap safe zone
  },
  tray: {
    position: 'absolute',
    bottom: 90, // Positioned above custom bottom bar (which is height 72)
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  sendIconBoxOuter: {
    width: 52,
    height: 52,
    marginBottom: 20, // Align logically with AnimatedTextInput's margin
  },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#7F77DD',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
