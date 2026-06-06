import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions } from 'react-native';
import { Shield, Plus, Zap, UserCheck } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import GlobalBackground, { BackgroundController } from '../components/GlobalBackground';
import AnimatedPage from '../components/AnimatedPage';
import NexusButton from '../components/NexusButton';
import { useHaptics } from '../hooks/useHaptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ConnectScreen() {
  const haptic = useHaptics();
  const cohorts = [
    { name: 'Frontend Developers Circle', size: 142, state: 'Daily Study Block' },
    { name: 'Academic Goals Prep Lounge', size: 89, state: 'No-Guilt Study' },
    { name: 'Detox & Habits Restarters', size: 211, state: 'Slow Rebuild' },
  ];

  // Connection Animation state
  const [matchInProgress, setMatchInProgress] = useState(false);
  const flashOpacity = useSharedValue(0);
  const leftAvatarX = useSharedValue(-100);
  const rightAvatarX = useSharedValue(SCREEN_WIDTH + 100);
  const connectionLineScale = useSharedValue(0);
  const matchContainerOpacity = useSharedValue(0);

  const triggerMatchInteraction = () => {
    haptic('HEAVY');
    setMatchInProgress(true);
    matchContainerOpacity.value = withTiming(1, { duration: 150 });

    // 1. Full screen flash: white burst fades in and out in 200ms
    flashOpacity.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(0, { duration: 250 })
    );

    // 2. Avatars fly in from opposite sides and meet in the middle
    setTimeout(() => {
      try {
        haptic('SUCCESS');
      } catch (e) {}

      leftAvatarX.value = withSpring(SCREEN_WIDTH / 2 - 50, { damping: 9, stiffness: 85 });
      rightAvatarX.value = withSpring(SCREEN_WIDTH / 2 + 10, { damping: 9, stiffness: 85 });

      // 3. Connection line draws between them
      setTimeout(() => {
        connectionLineScale.value = withSpring(1, { damping: 12 });
        if (BackgroundController.triggerSuccess) {
          BackgroundController.triggerSuccess(); // Trigger rain shower!
        }
        try {
          haptic('SUCCESS');
        } catch (e) {}

        // Dismiss after 2.5s
        setTimeout(() => {
          matchContainerOpacity.value = withTiming(0, { duration: 300 }, () => {
            // Reset state
            leftAvatarX.value = -100;
            rightAvatarX.value = SCREEN_WIDTH + 100;
            connectionLineScale.value = 0;
          });
          setTimeout(() => setMatchInProgress(false), 350);
        }, 2200);
      }, 500);
    }, 150);
  };

  const animatedFlashStyle = useAnimatedStyle(() => {
    return { opacity: flashOpacity.value };
  });

  const animatedLeftStyle = useAnimatedStyle(() => {
    return { transform: [{ translateX: leftAvatarX.value }] };
  });

  const animatedRightStyle = useAnimatedStyle(() => {
    return { transform: [{ translateX: rightAvatarX.value }] };
  });

  const animatedLineStyle = useAnimatedStyle(() => {
    return { transform: [{ scaleX: connectionLineScale.value }] };
  });

  const matchContainerStyle = useAnimatedStyle(() => {
    return { opacity: matchContainerOpacity.value };
  });

  return (
    <AnimatedPage type="slide-overshoot">
      <GlobalBackground>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Recovery Circles</Text>
              <Text style={styles.subtitle}>Collaborate with fellow restarters to rebuild habits together.</Text>
            </View>
            <View style={{ width: 44, height: 44 }}>
              <NexusButton
                onPress={() => haptic('SUCCESS')}
                type="primary"
                style={styles.addBtn}
                morphToStar={false}
                iconComponent={<Plus size={18} color="#FFFFFF" />}
              />
            </View>
          </View>

          {/* Interactive Consensus scan trigger button */}
          <View style={styles.matchScanCard}>
            <View style={styles.row}>
              <Zap size={18} color="#7F77DD" />
              <Text style={styles.matchTitle}>Restarters Peer Matcher</Text>
            </View>
            <Text style={styles.matchDesc}>
              Find another active builder holding aligned core goals. Share progress, cheer daily milestones, and defeat silent abandonment together.
            </Text>
            <NexusButton
              type="primary"
              onPress={triggerMatchInteraction}
              label="Find a Rebuilding Partner Now"
            />
          </View>

          {/* List of Cohorts */}
          {cohorts.map((cohort, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{cohort.name}</Text>
                  <Text style={styles.cardInfo}>{cohort.size} active restarters</Text>
                </View>
                <View style={[styles.statusBadge, { alignSelf: 'center' }]}>
                  <Text style={styles.statusTxt}>{cohort.state}</Text>
                </View>
              </View>

              <View style={{ marginTop: 14 }}>
                <NexusButton
                  type="primary"
                  onPress={() => haptic('LIGHT')}
                  style={styles.enterBtn}
                  label="Enter Circle Channel"
                />
              </View>
            </View>
          ))}
        </ScrollView>

        {/* CONNECTION MATCH OVERLAY */}
        {matchInProgress && (
          <Animated.View style={[styles.matchOverlay, matchContainerStyle]} pointerEvents="box-none">
            {/* White flash */}
            <Animated.View style={[styles.flashBurst, animatedFlashStyle]} pointerEvents="none" />

            {/* Meet in middle avatars */}
            <View style={styles.meetBox} pointerEvents="none">
              <Animated.View style={[styles.matchAvatar, styles.avatarRed, animatedLeftStyle]}>
                <Text style={styles.avatarSymbol}>🛰️</Text>
              </Animated.View>

              <Animated.View style={[styles.matchAvatar, styles.avatarTeal, animatedRightStyle]}>
                <Text style={styles.avatarSymbol}>🛸</Text>
              </Animated.View>

              {/* Connecting line */}
              <Animated.View style={[styles.connectionLine, animatedLineStyle]} />
            </View>

            <View style={styles.matchAlertCard} pointerEvents="none">
              <UserCheck size={28} color="#1D9E75" />
              <Text style={styles.matchAlertTitle}>Rebuilding Partner Matched!</Text>
              <Text style={styles.matchAlertDesc}>
                Partner peer relationship established. Say hello in chat to rebuild together!
              </Text>
            </View>
          </Animated.View>
        )}
      </GlobalBackground>
    </AnimatedPage>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingTop: 64,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E9F',
    fontWeight: '600',
    marginTop: 4,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    paddingVertical: 0,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchScanCard: {
    backgroundColor: 'rgba(28, 28, 50, 0.6)',
    borderWidth: 1.5,
    borderColor: '#7F77DD',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 6,
  },
  matchDesc: {
    color: '#D1D3E0',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1C1C32',
    borderWidth: 1.5,
    borderColor: '#29294C',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  cardInfo: {
    color: '#8E8E9F',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#32221D',
    borderWidth: 1,
    borderColor: '#D85A30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTxt: {
    color: '#D85A30',
    fontSize: 10,
    fontWeight: '800',
  },
  enterBtn: {
    backgroundColor: '#141426',
    borderWidth: 1,
    borderColor: '#3B3B66',
  },
  matchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(19, 19, 36, 0.92)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashBurst: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 1001,
  },
  meetBox: {
    height: 120,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 40,
  },
  matchAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  avatarRed: {
    backgroundColor: '#F0997B',
  },
  avatarTeal: {
    backgroundColor: '#1D9E75',
  },
  avatarSymbol: {
    fontSize: 24,
  },
  connectionLine: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: '#1D9E75',
    zIndex: 5,
  },
  matchAlertCard: {
    backgroundColor: '#1C1C32',
    borderWidth: 1.5,
    borderColor: '#1D9E75',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  matchAlertTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 12,
  },
  matchAlertDesc: {
    color: '#AFB2C4',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
});
