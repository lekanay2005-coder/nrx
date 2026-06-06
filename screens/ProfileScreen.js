import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, ActivityIndicator, Pressable } from 'react-native';
import { Award, Zap, Shield, Flame, Database, CheckCircle, RefreshCw, LogOut, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalBackground from '../components/GlobalBackground';
import AnimatedPage from '../components/AnimatedPage';
import NexusButton from '../components/NexusButton';
import AnimatedTextInput from '../components/AnimatedTextInput';
import { useHaptics } from '../hooks/useHaptics';
import { getMongoDBConfig, saveMongoDBConfig, testConnection, syncBatchToMongoDB } from '../services/mongodb';
import { AuthService } from '../services/authService';

const AVATARS = [
  { id: 'av_1', emoji: '👾', label: 'Cyber Entity', color: '#00FFCC' },
  { id: 'av_2', emoji: '🚀', label: 'Star Voyager', color: '#7F77DD' },
  { id: 'av_3', emoji: '🧠', label: 'Singularity', color: '#ED93B1' },
  { id: 'av_4', emoji: '⚡', label: 'Hyper Spark', color: '#FAC775' },
  { id: 'av_5', emoji: '🛰️', label: 'Apex Scout', color: '#32D7FF' },
  { id: 'av_6', emoji: '🛸', label: 'Deep Probe', color: '#FF4F7B' },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const haptic = useHaptics();
  const [currentUser, setCurrentUser] = useState(null);

  // Custom User Profile configuration fields
  const [editDisplayName, setEditDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[1]);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [hasInitializedForm, setHasInitializedForm] = useState(false);

  // MongoDB state managers
  const [config, setConfig] = useState({
    endpoint: '',
    apiKey: '',
    database: '',
    cluster: '',
  });
  const [isSandbox, setIsSandbox] = useState(true);
  const [testResult, setTestResult] = useState({ status: 'idle', message: '' }); // 'idle' | 'testing' | 'success' | 'failed'
  const [showConfig, setShowConfig] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  // Subscribe to auth session updates
  useEffect(() => {
    const unsub = AuthService.subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      if (user && !hasInitializedForm) {
        setEditDisplayName(user.displayName || '');
        if (user.avatarEmoji) {
          const found = AVATARS.find(a => a.emoji === user.avatarEmoji);
          if (found) setSelectedAvatar(found);
        }
        setHasInitializedForm(true);
      }
    });
    return () => unsub();
  }, [hasInitializedForm]);

  // Load configuration on mount
  useEffect(() => {
    async function loadConfig() {
      const savedConfig = await getMongoDBConfig();
      setConfig({
        endpoint: savedConfig.isSandbox ? '' : savedConfig.endpoint,
        apiKey: savedConfig.isSandbox ? '' : savedConfig.apiKey,
        database: savedConfig.database,
        cluster: savedConfig.cluster,
      });
      setIsSandbox(savedConfig.isSandbox);
    }
    loadConfig();
  }, []);

  const handleTestConnection = async () => {
    haptic('MEDIUM');
    setTestResult({ status: 'testing', message: 'Testing secure MongoDB Cloud tunnel...' });

    if (!config.endpoint || !config.apiKey) {
      setTestResult({
        status: 'failed',
        message: 'Endpoint URL and API Key are required. Fill out the connection payload to begin.',
      });
      haptic('WARNING');
      return;
    }

    if (
      config.endpoint.includes('...') ||
      config.endpoint.includes('abcde') ||
      config.apiKey.includes('...') ||
      config.apiKey === 'SANDBOX_MODE_ACTIVE_NO_KEY_PROVIDED'
    ) {
      setTestResult({
        status: 'failed',
        message: 'Placeholder Detected! Make sure you replaced the dummy URL App ID (like "..." or "abcde") and key with your actual alphanumeric MongoDB Atlas credentials.',
      });
      haptic('ERROR');
      return;
    }

    const res = await testConnection({
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      database: config.database || 'nexus_social_db',
      cluster: config.cluster || 'Cluster0',
    });

    if (res.success) {
      setTestResult({ status: 'success', message: res.message });
      haptic('SUCCESS');
    } else {
      setTestResult({ status: 'failed', message: res.message });
      haptic('ERROR');
    }
  };

  const handleSaveConfig = async () => {
    haptic('SUCCESS');
    const success = await saveMongoDBConfig({
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      database: config.database || 'nexus_social_db',
      cluster: config.cluster || 'Cluster0',
    });

    if (success) {
      const savedConfig = await getMongoDBConfig();
      setIsSandbox(savedConfig.isSandbox);
      setShowConfig(false);
      setTestResult({ status: 'idle', message: '' });
      Alert.alert(
        'Credentials Saved',
        savedConfig.isSandbox
          ? 'Reverted back to secure local Sandbox Simulation!'
          : 'MongoDB Atlas Data API tunnel is now active!'
      );
    } else {
      Alert.alert('Configuration Error', 'Could not save configurations. Try again.');
    }
  };

  const handleResetToSandbox = async () => {
    haptic('LONG');
    const success = await saveMongoDBConfig({ endpoint: '', apiKey: '', database: '', cluster: '' });
    if (success) {
      setConfig({
        endpoint: '',
        apiKey: '',
        database: 'nexus_social_db',
        cluster: 'Cluster0',
      });
      setIsSandbox(true);
      setShowConfig(false);
      setTestResult({ status: 'idle', message: '' });
      Alert.alert('Reverted to Sandbox', 'Using offline simulated database state.');
    }
  };

  const handlePushTemplatesToMongoDB = async () => {
    if (isSandbox) {
      Alert.alert(
        'Sandbox Sync Required',
        'Cannot synchronize to Atlas in sandbox mode. Configure and apply valid Data API credentials first.'
      );
      return;
    }

    haptic('HEAVY');
    setIsSyncing(true);

    const templatePosts = [
      {
        id: 'tmpl_1',
        author: 'Hypatia of Alexandria',
        content: 'Mathematics reveals the underlying geometry of the Cosmos. Cultivate order in your reflection logs.',
        likes: 18,
        isLiked: false,
        categories: ['Wisdom', 'Philosophy']
      },
      {
        id: 'tmpl_2',
        author: 'Marcus Aurelius',
        content: 'No man is happy who does not think himself so. Control external notifications to preserve peace.',
        likes: 24,
        isLiked: true,
        categories: ['Stoic', 'Detox']
      },
      {
        id: 'tmpl_3',
        author: 'Seneca the Younger',
        content: 'While we are postponing, life speeds by. Complete your metrics today.',
        likes: 14,
        isLiked: false,
        categories: ['Action', 'Growth']
      }
    ];

    const result = await syncBatchToMongoDB('posts', templatePosts);
    setIsSyncing(false);

    if (result.success) {
      Alert.alert(
        'Deploy Succeeded!',
        'Successfully synchronized and deployed 3 high-quality template posts into your MongoDB Atlas Remote Database!'
      );
    } else {
      Alert.alert('Sync Failed', result.error || 'Connection error.');
    }
  };

  const handleLogout = () => {
    haptic('HEAVY');
    Alert.alert(
      "Secure Sign Out",
      "Do you want to terminate your current ComeBack Coach session? Local states will be deactivated.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            const res = await AuthService.logout();
            if (res.success) {
              haptic('SUCCESS');
            } else {
              Alert.alert("Error Terminating Session", res.error || "An error occurred.");
            }
          }
        }
      ]
    );
  };

  const handleUpdateProfile = async () => {
    haptic('HEAVY');
    if (!editDisplayName.trim()) {
      Alert.alert("Input Error", "Please provide a valid display name.");
      haptic('WARNING');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await AuthService.saveUserProfile(currentUser.uid, {
        displayName: editDisplayName.trim(),
        avatarEmoji: selectedAvatar.emoji,
        avatarColor: selectedAvatar.color
      });

      setIsUpdatingProfile(false);
      if (res.success) {
        haptic('SUCCESS');
        Alert.alert("Profile Updated Successfully", "Your visual nickname and orbital beacon configurations have been successfully synchronised with Firestore!");
      } else {
        haptic('ERROR');
        Alert.alert("Sync Error", res.error || "Could not synchronize with Firestore.");
      }
    } catch (err) {
      setIsUpdatingProfile(false);
      haptic('ERROR');
      Alert.alert("System Sync Mismatch", err.message || "An exception occurred.");
    }
  };

  return (
    <AnimatedPage type="circular-reveal">
      <GlobalBackground>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Custom Navigation Back Header */}
          <View style={styles.backHeader}>
            <Pressable
              onPress={() => {
                haptic('LIGHT');
                navigation.goBack();
              }}
              style={styles.backButton}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)', borderless: true }}
              testID="profile_back_button"
            >
              <ArrowLeft color="#FFFFFF" size={24} />
            </Pressable>
            <Text style={styles.headerTitle}>PROFILE</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.avatarRow}>
            <View style={[
              styles.largeAvatar,
              currentUser?.avatarColor ? { backgroundColor: currentUser.avatarColor } : null
            ]}>
              {currentUser?.avatarEmoji ? (
                <Text style={{ fontSize: 36 }}>{currentUser.avatarEmoji}</Text>
              ) : (
                <Text style={styles.avatarInitialsText}>
                  {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'C'}
                </Text>
              )}
            </View>
            <View style={styles.profileMeta}>
              <Text style={styles.name}>{currentUser?.displayName || 'ComeBack Champion'}</Text>
              <Text style={styles.hierarchyRank}>
                {currentUser?.email || 'momentum-builder@comeback.ai'}
              </Text>
            </View>
          </View>

          {/* Triple Numerical Analytics Index Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Flame size={18} color="#D85A30" />
              <Text style={styles.statNum}>{currentUser?.streak || 14}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Zap size={18} color="#1D9E75" />
              <Text style={styles.statNum}>
                {currentUser?.xp ? currentUser.xp.toLocaleString() : '2,450'}
              </Text>
              <Text style={styles.statLabel}>XP Level</Text>
            </View>
            <View style={styles.statBox}>
              <Shield size={18} color="#7F77DD" />
              <Text style={styles.statNum}>{currentUser?.reliability || 98}%</Text>
              <Text style={styles.statLabel}>Reliability</Text>
            </View>
          </View>

          {/* Visual Achievements Card List */}
          <Text style={styles.sectionTitle}>Digital Badges</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>🧠</Text>
              <Text style={styles.badgeName}>Streak Booster</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>🔋</Text>
              <Text style={styles.badgeName}>Grit Master</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>🛰️</Text>
              <Text style={styles.badgeName}>Comeback Buddy</Text>
            </View>
          </View>

          {/* Customize Profile Space Panel */}
          <Text style={styles.sectionTitle}>CUSTOMIZE PROFILE SPACE</Text>
          <View style={styles.customCard}>
            <Text style={styles.customCardSubtitle}>
              Configure your visual display nickname and customize your cybernetic beacon avatar saved safely to Firestore.
            </Text>

            <AnimatedTextInput
              label="Visual Handle Nickname"
              placeholder="e.g. Hypatia"
              value={editDisplayName}
              onChangeText={setEditDisplayName}
              isValid={editDisplayName.trim().length >= 2}
            />

            <Text style={styles.avatarLabel}>CHOOSE YOUR SECURITY ORBITAL AVATAR</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((av) => (
                <Pressable
                  key={av.id}
                  onPress={() => {
                    haptic('LIGHT');
                    setSelectedAvatar(av);
                  }}
                  style={[
                    styles.avatarGridItem,
                    { backgroundColor: av.color },
                    selectedAvatar.emoji === av.emoji && styles.selectedGridItem
                  ]}
                  testID={`avatar_option_${av.id}`}
                >
                  <Text style={styles.gridEmoji}>{av.emoji}</Text>
                  <Text style={styles.gridLabel} numberOfLines={1}>
                    {av.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <NexusButton
              type="primary"
              onPress={handleUpdateProfile}
              label={isUpdatingProfile ? "Authorizing Profile Sync..." : "Synchronize Profile Space"}
              disabled={isUpdatingProfile}
              testID="save_profile_button"
            />
          </View>

          {/* MongoDB Integration Section */}
          <Text style={styles.sectionTitle}>MongoDB Atlas Deployment</Text>
          <View style={styles.mongoCard}>
            <View style={styles.mongoHeader}>
              <Database size={22} color={isSandbox ? '#AFA9EC' : '#1D9E75'} />
              <View style={styles.mongoHeaderMeta}>
                <Text style={styles.mongoCardTitle}>MongoDB Atlas Sync</Text>
                <Text style={[styles.mongoStatusText, { color: isSandbox ? '#8E8E9F' : '#1D9E75' }]}>
                  {isSandbox ? 'SANDBOX SIMULATION (LOCAL)' : 'ATLAS SYNC TUNNEL ACTIVE'}
                </Text>
              </View>
            </View>

            <Text style={styles.mongoDescription}>
              Configure and sync your thoughts, goals, and reflections directly with a MongoDB Atlas cloud cluster via the MongoDB Atlas REST Data API.
            </Text>

            {testResult.message ? (
              <View style={[
                styles.messageBanner,
                testResult.status === 'success' ? styles.successBanner : 
                testResult.status === 'testing' ? styles.testingBanner : styles.failedBanner
              ]}>
                {testResult.status === 'testing' && <ActivityIndicator size="small" color="#EAEAEA" style={{ marginRight: 8 }} />}
                <Text style={styles.bannerText}>{testResult.message}</Text>
              </View>
            ) : null}

            <View style={styles.configForm}>
              <View style={styles.guideToggleRow}>
                <Text style={[styles.formHint, { marginBottom: 8 }]}>
                  Enable MongoDB "Data API" on your Atlas console, and supply your Endpoint parameters to complete cloud deployment.
                </Text>
                <NexusButton
                  type="secondary"
                  onPress={() => { haptic('LIGHT'); setShowGuide(!showGuide); }}
                  label={showGuide ? "Hide Setup Guide 📖" : "Show Setup Guide 📖"}
                  style={styles.guideBtnSmall}
                  textStyle={{ fontSize: 11, fontWeight: '700', color: '#AFA9EC' }}
                  morphToStar={false}
                />
              </View>

              {showGuide && (
                <View style={styles.guideContainer}>
                  <Text style={styles.guideTitle}>How to Enable & Link MongoDB Atlas Data API:</Text>
                  <Text style={styles.guideStep}>1️⃣  Log in to your <Text style={styles.boldText}>MongoDB Atlas</Text> dashboard at cloud.mongodb.com.</Text>
                  <Text style={styles.guideStep}>2️⃣  In the left sidebar under the <Text style={styles.boldText}>Services</Text> section, click on <Text style={styles.boldText}>Data API</Text>.</Text>
                  <Text style={styles.guideStep}>3️⃣  Choose your cluster (e.g. <Text style={styles.boldText}>Cluster0</Text>) and click <Text style={styles.boldText}>"Enable Data API"</Text>.</Text>
                  <Text style={styles.guideStep}>4️⃣  Copy your <Text style={styles.boldText}>URL Endpoint</Text>. Ensure it does not contain literal dots <Text style={styles.dangerText}>"..."</Text> or the placeholder app client ID <Text style={styles.dangerText}>"abcde"</Text>. It should contain your unique alphanumeric App ID!</Text>
                  <Text style={styles.guideStep}>5️⃣  Create a high-security <Text style={styles.boldText}>API Key</Text> on that same Data API dashboard, copy it, and paste it into the password field below.</Text>
                  <Text style={styles.guideStep}>⚠️  If you see <Text style={styles.dangerText}>"cannot find app using Client App ID..."</Text>, it means your Endpoint URL path is set to <Text style={styles.dangerText}>"..."</Text> or mismatched. Check the URL carefully!</Text>
                </View>
              )}

              <AnimatedTextInput
                label="REST Data API Endpoint URL"
                placeholder="https://...data.mongodb-api.com/app/.../endpoint/v1"
                value={config.endpoint}
                onChangeText={(val) => setConfig({ ...config, endpoint: val })}
                isValid={config.endpoint.startsWith('https://')}
              />

              <AnimatedTextInput
                label="Atlas Data API Key"
                placeholder="Paste your MongoDB API Key here"
                value={config.apiKey}
                onChangeText={(val) => setConfig({ ...config, apiKey: val })}
                isPassword={true}
                isValid={config.apiKey.length > 5}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <AnimatedTextInput
                    label="Database"
                    placeholder="nexus_social_db"
                    value={config.database}
                    onChangeText={(val) => setConfig({ ...config, database: val })}
                    isValid={config.database.length > 0}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AnimatedTextInput
                    label="Cluster"
                    placeholder="Cluster0"
                    value={config.cluster}
                    onChangeText={(val) => setConfig({ ...config, cluster: val })}
                    isValid={config.cluster.length > 0}
                  />
                </View>
              </View>

              <View style={styles.actionRowGrid}>
                <NexusButton
                  type="secondary"
                  onPress={handleTestConnection}
                  label="Test Stream"
                  style={{ flex: 1, marginRight: 8 }}
                />
                <NexusButton
                  type="success"
                  onPress={handleSaveConfig}
                  label="Save Config"
                  style={{ flex: 1 }}
                />
              </View>

              {!isSandbox ? (
                <View style={{ marginTop: 12 }}>
                  <NexusButton
                    type="success"
                    onPress={handlePushTemplatesToMongoDB}
                    label={isSyncing ? "Seeding Atlas..." : "Seeding Templates to MongoDB 🚀"}
                    disabled={isSyncing}
                  />
                  <View style={{ marginTop: 12 }}>
                    <NexusButton
                      type="danger"
                      onPress={handleResetToSandbox}
                      label="Revert to Local Sandbox Mode"
                    />
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: 12, opacity: 0.6 }}>
                  <Text style={styles.sandboxOnlyText}>
                    💡 Fill out the credentials above, test, and save to unlock direct MongoDB database loading and template seeding.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Cache Action Trigger */}
          <View style={{ marginTop: 12 }}>
            <NexusButton
              type="secondary"
              onPress={() => {
                haptic('WARNING');
                Alert.alert("Reset Complete", "Local app metrics memory buffers have been refreshed.");
              }}
              label="Reset Core Local Cache"
              style={{ marginBottom: 12 }}
            />
            <NexusButton
              type="danger"
              onPress={handleLogout}
              label="Terminated Secure Session"
              iconComponent={<LogOut size={16} color="#FFFFFF" />}
            />
          </View>
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  largeAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7F77DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  avatarInitialsText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  profileMeta: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  hierarchyRank: {
    fontSize: 13,
    color: '#8E8E9F',
    fontWeight: '700',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1C1C32',
    borderWidth: 1.5,
    borderColor: '#29294C',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNum: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },
  statLabel: {
    color: '#8E8E9F',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  badge: {
    flex: 1,
    backgroundColor: '#1C1C32',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2B2B4E',
    marginHorizontal: 4,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeName: {
    color: '#AFB2C4',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
  },
  mongoCard: {
    backgroundColor: '#141426',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3B3B66',
    padding: 18,
    marginBottom: 20,
  },
  mongoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mongoHeaderMeta: {
    marginLeft: 12,
  },
  mongoCardTitle: {
    fontSize: 15,
    fontWeight: '950',
    color: '#FFFFFF',
  },
  mongoStatusText: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  mongoDescription: {
    color: '#AFB2C4',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  messageBanner: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successBanner: {
    backgroundColor: 'rgba(29, 158, 117, 0.15)',
    borderColor: '#1D9E75',
    borderWidth: 1,
  },
  testingBanner: {
    backgroundColor: 'rgba(127, 119, 221, 0.15)',
    borderColor: '#7F77DD',
    borderWidth: 1,
  },
  failedBanner: {
    backgroundColor: 'rgba(240, 153, 123, 0.15)',
    borderColor: '#F0997B',
    borderWidth: 1,
  },
  bannerText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  btnColumn: {
    flexDirection: 'column',
  },
  configForm: {
    marginTop: 8,
  },
  formHint: {
    color: '#8E8E9F',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row',
  },
  actionRowGrid: {
    flexDirection: 'row',
    marginTop: 10,
  },
  guideToggleRow: {
    marginBottom: 10,
  },
  guideBtnSmall: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    minHeight: 28,
    marginTop: 2,
    borderRadius: 8,
  },
  guideContainer: {
    backgroundColor: '#1C1C32',
    borderWidth: 1,
    borderColor: '#3B3B66',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  guideTitle: {
    color: '#FAC775',
    fontWeight: '900',
    fontSize: 12,
    marginBottom: 10,
  },
  guideStep: {
    color: '#AFB2C4',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
  },
  boldText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dangerText: {
    color: '#F0997B',
    fontWeight: '800',
  },
  sandboxOnlyText: {
    color: '#AFA9EC',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    width: '100%',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  customCard: {
    backgroundColor: '#141426',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3B3B66',
    padding: 18,
    marginBottom: 20,
  },
  customCardSubtitle: {
    color: '#AFB2C4',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FAC775',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 6,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  avatarGridItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.75,
  },
  selectedGridItem: {
    borderColor: '#FFFFFF',
    opacity: 1,
    transform: [{ scale: 1.05 }],
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  gridEmoji: {
    fontSize: 24,
  },
  gridLabel: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 4,
    textAlign: 'center',
  },
});
