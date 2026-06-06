import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Sparkles, Trophy, Flame } from 'lucide-react-native';
import GlobalBackground, { BackgroundController } from '../components/GlobalBackground';
import AnimatedPage from '../components/AnimatedPage';
import NexusButton from '../components/NexusButton';
import { useHaptics } from '../hooks/useHaptics';

export default function DiscoverScreen() {
  const haptic = useHaptics();
  const [challenges, setChallenges] = useState([
    { id: '1', title: 'The Sunlight Stack', xp: 250, count: 42, active: true },
    { id: '2', title: 'Deep Work Silence Block', xp: 400, count: 18, active: false },
    { id: '3', title: 'Stoic Gratitude Log', xp: 150, count: 91, active: false },
  ]);

  const joinHub = (id) => {
    haptic('SUCCESS');
    if (BackgroundController.triggerSuccess) {
      BackgroundController.triggerSuccess();
    }
    setChallenges(challenges.map(c => {
      if (c.id === id) {
        return { ...c, active: true, count: c.count + 1 };
      }
      return c;
    }));
  };

  return (
    <AnimatedPage type="particle-dissolve">
      <GlobalBackground>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Momentum Arena</Text>
          <Text style={styles.subtitle}>Join accountability micro-challenges designed to construct daily focus streaks.</Text>

          <View style={styles.featuredCard}>
            <View style={styles.row}>
              <Sparkles color="#7F77DD" size={18} />
              <Text style={styles.featuredTag}>WEEKLY RESTART CHALLENGE</Text>
            </View>
            <Text style={styles.featuredTitle}>The 24-Hour Momentum Boost</Text>
            <Text style={styles.featuredDesc}>
              Join over 1.2k goal restarters this weekend to commit 15 minutes to your abandoned draft, log it, and shatter the friction!
            </Text>
            <NexusButton
              onPress={() => {
                haptic('HEAVY');
                if (BackgroundController.triggerSuccess) BackgroundController.triggerSuccess();
              }}
              type="primary"
              label="Commit 15 Mins Today (+250 XP)"
            />
          </View>

          <Text style={styles.sectionTitle}>Momentum Arenas</Text>
          {challenges.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.itemTitle}>
                    {item.id === '1' ? 'Friction-Free Study (10m)' :
                     item.id === '2' ? 'Deep Work Sandbox Build' :
                     'Core Metrics Check-In'}
                  </Text>
                  <View style={styles.row}>
                    <Flame color="#D85A30" size={12} />
                    <Text style={styles.metricText}>{item.count} Active Builders</Text>
                  </View>
                </View>
                <View style={styles.xpBox}>
                  <Text style={styles.xpText}>+{item.xp} XP</Text>
                </View>
              </View>

              <View style={{ marginTop: 14 }}>
                {item.active ? (
                  <View style={styles.enlistedBadge}>
                    <Text style={styles.enlistedText}>Active Enrollment</Text>
                  </View>
                ) : (
                  <NexusButton
                    onPress={() => joinHub(item.id)}
                    type="success"
                    label="Commit & Register Goal"
                  />
                )}
              </View>
            </View>
          ))}
        </ScrollView>
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
    marginBottom: 24,
  },
  featuredCard: {
    backgroundColor: '#1D1D35',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#7F77DD',
    padding: 20,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredTag: {
    color: '#7F77DD',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '850',
    marginTop: 8,
  },
  featuredDesc: {
    color: '#D1D3E0',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#1C1C32',
    borderWidth: 1.5,
    borderColor: '#29294C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  metricText: {
    color: '#8E8E9F',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    marginTop: 2,
  },
  xpBox: {
    backgroundColor: '#141426',
    borderWidth: 1,
    borderColor: '#1D9E75',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpText: {
    color: '#1D9E75',
    fontSize: 11,
    fontWeight: '800',
  },
  enlistedBadge: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(29, 158, 117, 0.1)',
    borderWidth: 1.2,
    borderColor: '#1D9E75',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  enlistedText: {
    color: '#1D9E75',
    fontWeight: '800',
    fontSize: 11,
  },
});
