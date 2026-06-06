import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Target, Zap, Clock, ShieldAlert, Sparkles, RefreshCw, AlertCircle, Heart, CheckCircle2 } from 'lucide-react-native';
import GlobalBackground, { BackgroundController } from '../components/GlobalBackground';
import AnimatedPage from '../components/AnimatedPage';
import NexusButton from '../components/NexusButton';
import AnimatedTextInput from '../components/AnimatedTextInput';
import TaskItemCard from '../components/TaskItemCard';
import { useHaptics } from '../hooks/useHaptics';
import { geminiService } from '../services/gemini';

const STORAGE_KEYS = {
  ACTIVE_GOAL: '@comeback_active_goal',
  GOAL_MILESTONES: '@comeback_goal_milestones',
  DAILY_TASKS: '@comeback_daily_tasks',
  RECOVERY_ACTIVE: '@comeback_recovery_active',
  RECOVERY_MESSAGE: '@comeback_recovery_message',
  XP_POINTS: '@comeback_xp_points'
};

export default function MissionScreen() {
  const haptic = useHaptics();
  
  // App state
  const [goal, setGoal] = useState('');
  const [inputGoal, setInputGoal] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryMsg, setRecoveryMsg] = useState('');
  const [missedDaysCount, setMissedDaysCount] = useState('3');
  const [xp, setXp] = useState(1250);

  // Load from local storage on mount
  useEffect(() => {
    async function loadSavedPlan() {
      try {
        const savedGoal = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_GOAL);
        const savedMilestones = await AsyncStorage.getItem(STORAGE_KEYS.GOAL_MILESTONES);
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_TASKS);
        const savedRecoveryActive = await AsyncStorage.getItem(STORAGE_KEYS.RECOVERY_ACTIVE);
        const savedRecoveryMsg = await AsyncStorage.getItem(STORAGE_KEYS.RECOVERY_MESSAGE);
        const savedXp = await AsyncStorage.getItem(STORAGE_KEYS.XP_POINTS);

        if (savedGoal) setGoal(savedGoal);
        if (savedMilestones) setMilestones(JSON.parse(savedMilestones));
        if (savedTasks) setDailyTasks(JSON.parse(savedTasks));
        if (savedRecoveryActive === 'true') setRecoveryMode(true);
        if (savedRecoveryMsg) setRecoveryMsg(savedRecoveryMsg);
        if (savedXp) setXp(parseInt(savedXp));
      } catch (err) {
        console.warn("Could not load local storage details", err);
      }
    }
    loadSavedPlan();
  }, []);

  // Set-up a brand new goal with Gemini
  const initializeGoalWithAI = async () => {
    if (!inputGoal.trim()) return;
    haptic('HEAVY');
    setLoading(true);

    try {
      const plan = await geminiService.generateGoalPlan(inputGoal);
      if (plan) {
        const tasksFormatted = plan.dailyTasks.map((t, idx) => ({
          id: 'task_' + idx + '_' + Date.now().toString(),
          task: t,
          resolved: false
        }));

        setGoal(inputGoal);
        setMilestones(plan.milestones);
        setDailyTasks(tasksFormatted);
        setRecoveryMode(false);
        setRecoveryMsg('');

        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_GOAL, inputGoal);
        await AsyncStorage.setItem(STORAGE_KEYS.GOAL_MILESTONES, JSON.stringify(plan.milestones));
        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TASKS, JSON.stringify(tasksFormatted));
        await AsyncStorage.setItem(STORAGE_KEYS.RECOVERY_ACTIVE, 'false');
        await AsyncStorage.setItem(STORAGE_KEYS.RECOVERY_MESSAGE, '');
        
        haptic('SUCCESS');
        if (BackgroundController.triggerSuccess) {
          BackgroundController.triggerSuccess(); // Confetti on success build!
        }
      }
    } catch (err) {
      console.warn("Could not initialize plan with Gemini", err);
    } finally {
      setLoading(false);
    }
  };

  // Launch Recovery Plan simulation
  const triggerGuiltFreeRecovery = async () => {
    if (!goal) return;
    haptic('HEAVY');
    setLoading(true);

    try {
      const recovery = await geminiService.generateRecoveryPlan(missedDaysCount, goal);
      if (recovery) {
        const recoveryTasksFormatted = recovery.plan.map((t, idx) => ({
          id: 'recovery_' + idx + '_' + Date.now().toString(),
          task: t,
          resolved: false
        }));

        setDailyTasks(recoveryTasksFormatted);
        setRecoveryMode(true);
        setRecoveryMsg(recovery.coachMessage);

        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TASKS, JSON.stringify(recoveryTasksFormatted));
        await AsyncStorage.setItem(STORAGE_KEYS.RECOVERY_ACTIVE, 'true');
        await AsyncStorage.setItem(STORAGE_KEYS.RECOVERY_MESSAGE, recovery.coachMessage);

        haptic('SUCCESS');
        if (BackgroundController.triggerSuccess) {
          BackgroundController.triggerSuccess(); // Fireworks/particle cascade
        }
      }
    } catch (err) {
      console.warn("Could not launch recovery system", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle checklist mission status
  const toggleTask = async (id) => {
    const updatedTasks = dailyTasks.map(t => {
      if (t.id === id) {
        const nextResolved = !t.resolved;
        if (nextResolved) {
          haptic('SUCCESS');
          const newXp = xp + 150;
          setXp(newXp);
          AsyncStorage.setItem(STORAGE_KEYS.XP_POINTS, newXp.toString());
          if (BackgroundController.triggerSuccess) {
            BackgroundController.triggerSuccess();
          }
        } else {
          haptic('LIGHT');
        }
        return { ...t, resolved: nextResolved };
      }
      return t;
    });

    setDailyTasks(updatedTasks);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TASKS, JSON.stringify(updatedTasks));
  };

  // Clear goal back to sandbox seed
  const resetGoal = async () => {
    haptic('LONG');
    setGoal('');
    setInputGoal('');
    setMilestones([]);
    setDailyTasks([]);
    setRecoveryMode(false);
    setRecoveryMsg('');
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_GOAL);
    await AsyncStorage.removeItem(STORAGE_KEYS.GOAL_MILESTONES);
    await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_TASKS);
    await AsyncStorage.removeItem(STORAGE_KEYS.RECOVERY_ACTIVE);
    await AsyncStorage.removeItem(STORAGE_KEYS.RECOVERY_MESSAGE);
  };

  const completedCount = dailyTasks.filter(t => t.resolved).length;
  const progressRatio = dailyTasks.length > 0 ? (completedCount / dailyTasks.length) * 100 : 0;

  return (
    <AnimatedPage type="3d-fold">
      <GlobalBackground mood={progressRatio === 100 ? 'ACTIVE' : 'DEFAULT'}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Goals & Rebuilding</Text>
          <Text style={styles.subtitle}>Define realistic objectives and recover smoothly when off track.</Text>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#7F77DD" />
              <Spacer height={16} />
              <Text style={styles.loadingText}>Synthesizing Adaptive Recovery Path...</Text>
            </View>
          ) : !goal ? (
            // No Goal State: Input Area
            <View style={styles.plannerCard}>
              <View style={styles.row}>
                <Sparkles size={20} color="#7F77DD" />
                <Text style={styles.plannerHeader}>Start A Goal Platform</Text>
              </View>
              <Text style={styles.plannerDesc}>
                Tell ComeBack AI what you're working towards, what skills you need, or what targets you previously lost momentum on.
              </Text>

              <AnimatedTextInput
                label="Your Goal Description"
                placeholder="e.g., Become a Frontend Developer by December"
                value={inputGoal}
                onChangeText={setInputGoal}
                isValid={inputGoal.trim().length > 3}
              />

              <NexusButton
                onPress={initializeGoalWithAI}
                disabled={!inputGoal.trim()}
                type="primary"
                label="Plan Goals with ComeBack AI"
              />
            </View>
          ) : (
            // Active Goal States
            <View>
              {/* Active Milestone Card header */}
              <View style={styles.activeGoalContainer}>
                <View style={styles.rowBetween}>
                  <View style={styles.row}>
                    <Target size={18} color="#7F77DD" />
                    <Text style={styles.activeLabel}>ACTIVE GOAL MISSION</Text>
                  </View>
                  <Pressable onPress={resetGoal} style={styles.resetBadge}>
                    <Text style={styles.resetBadgeText}>Change Goal</Text>
                  </Pressable>
                </View>
                <Text style={styles.goalTitleText}>{goal}</Text>

                {/* Milestone breakdown visualizer */}
                <Text style={styles.timelineHeader}>Milestone Roadmap</Text>
                {milestones.map((m, idx) => (
                  <View key={idx} style={styles.timelineRow}>
                    <View style={styles.bulletCol}>
                      <View style={[styles.timelineNode, idx === 0 ? styles.nodeCurrent : null]} />
                      {idx !== milestones.length - 1 && <View style={styles.timelineVerticalBar} />}
                    </View>
                    <Text style={[styles.timelineItemText, idx === 0 ? styles.itemTextCurrent : null]}>
                      {m}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Guilt-free compassionate welcome block (If recovery is active) */}
              {recoveryMode && (
                <View style={styles.recoveryWelcomeCard}>
                  <View style={styles.row}>
                    <Heart size={18} color="#D85A30" style={{ marginRight: 6 }} />
                    <Text style={styles.recoveryWelcomeHeader}>Guilt-Free Comeback Active</Text>
                  </View>
                  <Text style={styles.recoveryWelcomeText}>{recoveryMsg}</Text>
                  <View style={styles.recoveryInfoPill}>
                    <Clock size={12} color="#D85A30" style={{ marginRight: 4 }} />
                    <Text style={styles.recoveryInfoPillText}>Gradual ramp-up: low time commitments enabled.</Text>
                  </View>
                </View>
              )}

              {/* Daily Rebuild Tasks checklist */}
              <View style={styles.statusBar}>
                <View style={styles.rowBetween}>
                  <View style={styles.row}>
                    <Zap size={16} color="#1D9E75" />
                    <Text style={styles.progressTxt}>Momentum Index</Text>
                  </View>
                  <Text style={styles.progressPct}>
                    {Math.round(progressRatio)}% Completed
                  </Text>
                </View>
                <View style={styles.progressRail}>
                  <View style={[styles.progressIndicator, { width: `${progressRatio}%` }]} />
                </View>
              </View>

              {/* Individual task items checking */}
              {dailyTasks.map(item => (
                <TaskItemCard
                  key={item.id}
                  item={item}
                  onToggle={() => toggleTask(item.id)}
                />
              ))}

              {/* Clear perfection rewards badge */}
              {progressRatio === 100 && (
                <View style={styles.completedSplash}>
                  <CheckCircle2 size={32} color="#1D9E75" />
                  <Text style={styles.completedTitle}>Perfect Rhythm Mastered!</Text>
                  <Text style={styles.completedDesc}>
                    Your recovery block of targets is completed. Momentum has compounding benefit. +150 XP Allocated.
                  </Text>
                </View>
              )}

              {/* Interactive Recovery Engine Trigger Option */}
              <View style={styles.recoveryEngineTriggerContainer}>
                <View style={styles.row}>
                  <Clock size={16} color="#FAC775" />
                  <Text style={styles.recoveryEngineTitle}>Fell Off Track? (Simulation)</Text>
                </View>
                <Text style={styles.recoveryEngineDesc}>
                  Whether you missed 3 days or 15 days, simulate silent abandonment. Our Recovery Engine generates an adaptive, shame-free ramp-up plan.
                </Text>

                <View style={[styles.inlineInputRow, { marginTop: 12 }]}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <AnimatedTextInput
                      label="Number of Days Missed"
                      placeholder="e.g. 3"
                      value={missedDaysCount}
                      onChangeText={setMissedDaysCount}
                      isValid={parseInt(missedDaysCount) > 0}
                    />
                  </View>
                  <View style={{ flex: 1.2 }}>
                    <NexusButton
                      onPress={triggerGuiltFreeRecovery}
                      type="success"
                      label="Engage Recovery"
                      style={styles.engageRecBtn}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </GlobalBackground>
    </AnimatedPage>
  );
}

// Simple spacer helper
function Spacer({ height }) {
  return <View style={{ height }} />;
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingTop: 64,
    paddingBottom: 120,
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
  loadingCard: {
    backgroundColor: '#1C1C32',
    borderWidth: 1.5,
    borderColor: '#7F77DD40',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginVertical: 40,
  },
  loadingText: {
    color: '#AFA9EC',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  plannerCard: {
    backgroundColor: '#1C1C32',
    borderWidth: 1.5,
    borderColor: '#29294C',
    borderRadius: 20,
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
    marginBottom: 10,
  },
  plannerHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 8,
  },
  plannerDesc: {
    color: '#AFB2C4',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  activeGoalContainer: {
    backgroundColor: '#1E1B4B',
    borderColor: '#312E81',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  activeLabel: {
    color: '#8E8E9F',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.0,
    marginLeft: 6,
  },
  resetBadge: {
    backgroundColor: '#131324',
    borderWidth: 1,
    borderColor: '#3B3B66',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  resetBadgeText: {
    color: '#AFA9EC',
    fontSize: 9,
    fontWeight: '900',
  },
  goalTitleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginVertical: 8,
  },
  timelineHeader: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#312E81',
    paddingTop: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletCol: {
    alignItems: 'center',
    marginRight: 10,
    width: 14,
  },
  timelineNode: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B3B66',
    marginTop: 5,
  },
  nodeCurrent: {
    backgroundColor: '#7F77DD',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginTop: 4,
  },
  timelineVerticalBar: {
    width: 1.5,
    height: 24,
    backgroundColor: '#312E81',
    marginTop: 2,
  },
  timelineItemText: {
    color: '#AFB2C4',
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1,
  },
  itemTextCurrent: {
    color: '#AFA9EC',
    fontWeight: '800',
  },
  recoveryWelcomeCard: {
    backgroundColor: '#451E1A',
    borderWidth: 1.5,
    borderColor: '#B91C1C50',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  recoveryWelcomeHeader: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '900',
  },
  recoveryWelcomeText: {
    color: '#FCA5A5',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  recoveryInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#1E1B4B',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  recoveryInfoPillText: {
    color: '#AFB2C4',
    fontSize: 10,
    fontWeight: '850',
  },
  statusBar: {
    backgroundColor: '#1C1C32',
    borderWidth: 1.5,
    borderColor: '#29294C',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  progressTxt: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 6,
  },
  progressPct: {
    color: '#1D9E75',
    fontWeight: '900',
    fontSize: 12,
  },
  progressRail: {
    height: 8,
    backgroundColor: '#131324',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#1D9E75',
    borderRadius: 4,
  },
  completedSplash: {
    backgroundColor: '#132C24',
    borderWidth: 1.5,
    borderColor: '#1D9E7580',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  completedTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 10,
  },
  completedDesc: {
    color: '#A7F3D0',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  recoveryEngineTriggerContainer: {
    backgroundColor: '#1A1D24',
    borderWidth: 1.5,
    borderColor: '#FAC77530',
    borderRadius: 20,
    padding: 18,
    marginTop: 12,
  },
  recoveryEngineTitle: {
    color: '#FFD166',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 6,
  },
  recoveryEngineDesc: {
    color: '#AFB2C4',
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 6,
  },
  inlineInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engageRecBtn: {
    marginBottom: 20,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1D9E75',
    justifyContent: 'center',
  },
});
