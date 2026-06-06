import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Pressable
} from 'react-native';
import { 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Cpu, 
  Radio, 
  Layers, 
  Database,
  Moon,
  Sun,
  Flame,
  Terminal,
  Zap
} from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  interpolateColor, 
  withSequence,
  withRepeat,
  Easing,
  interpolate
} from 'react-native-reanimated';
import GlobalBackground from '../components/GlobalBackground';
import AnimatedPage from '../components/AnimatedPage';
import NexusButton from '../components/NexusButton';
import AnimatedTextInput from '../components/AnimatedTextInput';
import { useHaptics } from '../hooks/useHaptics';
import { AuthService } from '../services/authService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AuthScreen({ onAuthSuccess }) {
  const haptic = useHaptics();

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState('login');
  
  // Custom Dark Mode config: true = ultra cool Obsidian Cyber Dark (AMOLED), false = Classic Stellar Space
  const [cyberMode, setCyberMode] = useState(true);
  
  // Fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Validation status triggers
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Google sign-in simulation helpers
  const [googlePickerVisible, setGooglePickerVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const simulatedAccounts = [
    { email: 'lekanay2005@gmail.com', displayName: 'Lekan Ay' },
    { email: 'restart@comeback.ai', displayName: 'Goal Restarter' },
    { email: 'champion@momentum.tech', displayName: 'ComeBack Champion' }
  ];
  
  // Mode switch indicator tracking
  const toggleProgress = useSharedValue(0);

  // Rotating outer ring simulation values for quantum lock
  const spinRingOuter = useSharedValue(0);
  const spinRingInner = useSharedValue(0);

  useEffect(() => {
    toggleProgress.value = withSpring(mode === 'login' ? 0 : 1, { damping: 15, stiffness: 100 });
  }, [mode]);

  useEffect(() => {
    // 60fps Loop animations for concentric logo vectors
    spinRingOuter.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );
    spinRingInner.value = withRepeat(
      withTiming(-360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedLoginPillStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      toggleProgress.value,
      [0, 1],
      [cyberMode ? '#00FFCC' : '#7F77DD', 'transparent']
    );
    return { backgroundColor };
  });

  const animatedSignupPillStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      toggleProgress.value,
      [0, 1],
      ['transparent', cyberMode ? '#00FFCC' : '#7F77DD']
    );
    return { backgroundColor };
  });

  const outerSpinStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${spinRingOuter.value}deg` }],
    };
  });

  const innerSpinStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${spinRingInner.value}deg` }],
    };
  });

  // Client Validation checkers
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = password.length >= 8;
  const isNameValid = mode === 'login' || name.trim().length >= 2;

  // Real-time strength feedback elements
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigitOrSpecial = /[\d\W]/.test(password);

  const handleToggleMode = (targetMode) => {
    if (mode === targetMode) return;
    haptic('LIGHT');
    setMode(targetMode);
    setErrorMessage('');
  };

  const handleToggleThemeMode = () => {
    haptic('MEDIUM');
    setCyberMode(!cyberMode);
  };

  const handleSubmit = async () => {
    haptic('HEAVY');
    setErrorMessage('');

    // Pre-validation checks
    if (!email) {
      setErrorMessage('Please type in your email address.');
      haptic('WARNING');
      return;
    }
    if (!isEmailValid) {
      setErrorMessage('Format of email address is invalid.');
      haptic('WARNING');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter secure access credentials.');
      haptic('WARNING');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 8 characters.');
      haptic('WARNING');
      return;
    }
    if (mode === 'signup' && !isNameValid) {
      setErrorMessage('Please provide your name or visual alias.');
      haptic('WARNING');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await AuthService.login(email, password);
        if (res.success) {
          haptic('SUCCESS');
          if (onAuthSuccess) onAuthSuccess(res.user);
        } else {
          setErrorMessage(res.error);
          haptic('ERROR');
        }
      } else {
        const res = await AuthService.signup(email, password, name);
        if (res.success) {
          haptic('SUCCESS');
          if (onAuthSuccess) onAuthSuccess(res.user);
        } else {
          setErrorMessage(res.error);
          haptic('ERROR');
        }
      }
    } catch (e) {
      setErrorMessage('A transmission error occurred. Try again.');
      haptic('ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    haptic('HEAVY');
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await AuthService.loginWithGoogle();
      if (res.success) {
        if (res.isSimulatedOnly) {
          setGooglePickerVisible(true);
        } else {
          haptic('SUCCESS');
          if (onAuthSuccess) onAuthSuccess(res.user);
        }
      } else {
        setErrorMessage(res.error);
        haptic('ERROR');
      }
    } catch (e) {
      setErrorMessage('Google Authentication failed. Choose another method.');
      haptic('ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectSimulatedGoogleAccount = async (account) => {
    haptic('MEDIUM');
    setGooglePickerVisible(false);
    setSubmitting(true);

    try {
      const res = await AuthService.loginWithGoogle(account);
      if (res.success) {
        haptic('SUCCESS');
        if (onAuthSuccess) onAuthSuccess(res.user);
      } else {
        setErrorMessage(res.error);
        haptic('ERROR');
      }
    } catch (e) {
      setErrorMessage('Identity mapping failed.');
      haptic('ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatedPage type="slide-overshoot">
      <GlobalBackground mood={cyberMode ? 'IDLE' : 'DEFAULT'}>
        {/* Holographic matrix AMOLED dark overlay if Cyber Mode active */}
        {cyberMode && <View style={styles.cyberObsidianBacking} />}

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardContainer}
        >
          <ScrollView contentContainerStyle={styles.scroll}>
            
            {/* Custom Interactive Theme Override / Coolness Controller */}
            <View style={styles.themeBadgeContainer}>
              <TouchableOpacity
                onPress={handleToggleThemeMode}
                activeOpacity={0.8}
                style={[
                  styles.themeTogglePill,
                  cyberMode ? styles.themeTogglePillCyber : styles.themeTogglePillClassic
                ]}
                testID="cyber_theme_toggle_button"
              >
                <View style={[styles.themeLabelRow, { marginRight: 6 }]}>
                  {cyberMode ? <Moon size={11} color="#00FFCC" /> : <Sun size={11} color="#FAC775" />}
                  <Text style={[
                    styles.themeToggleText, 
                    { color: cyberMode ? '#00FFCC' : '#FAC775', marginLeft: 4 }
                  ]}>
                    {cyberMode ? "VORTEX NEON DARK ON" : "CLASSIC DEEP SPACE"}
                  </Text>
                </View>
                <View style={styles.toggleDotTrack}>
                  <View style={[
                    styles.toggleDotThumb,
                    { 
                      alignSelf: cyberMode ? 'flex-end' : 'flex-start',
                      backgroundColor: cyberMode ? '#00FFCC' : '#FAC775' 
                    }
                  ]} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Concentric Spinning Orbital Header */}
            <View style={styles.logoAndHeader}>
              <View style={styles.orbitalScope}>
                {/* Simulated outer concentric node path */}
                <Animated.View style={[styles.orbitRingOuter, outerSpinStyle, { borderColor: cyberMode ? 'rgba(0, 255, 204, 0.25)' : 'rgba(127, 119, 221, 0.25)' }]}>
                  <View style={[styles.orbitNode, { backgroundColor: cyberMode ? '#00FFCC' : '#7F77DD', top: '15%' }]} />
                </Animated.View>
                {/* Simulated inner node path */}
                <Animated.View style={[styles.orbitRingInner, innerSpinStyle, { borderColor: cyberMode ? 'rgba(237, 147, 177, 0.25)' : 'rgba(237, 147, 177, 0.25)' }]}>
                  <View style={[styles.orbitNode, { backgroundColor: '#ED93B1', right: '10%' }]} />
                </Animated.View>

                <View style={[
                  styles.glowingOrb, 
                  { 
                    backgroundColor: cyberMode ? '#020204' : '#7F77DD',
                    borderColor: cyberMode ? '#00FFCC' : 'transparent',
                    borderWidth: cyberMode ? 1.5 : 0,
                    shadowColor: cyberMode ? '#00FFCC' : '#7F77DD'
                  }
                ]}>
                  <Sparkles size={28} color={cyberMode ? '#00FFCC' : '#FFFFFF'} />
                </View>
              </View>

              <Text style={styles.welcomeText}>
                {mode === 'login' ? 'NEXUS TERMINAL' : 'ESTABLISH ALIGNMENT'}
              </Text>
              <Text style={styles.subtitle}>
                {mode === 'login' 
                  ? 'Access your micro-trust data core safely.' 
                  : 'Synthesize your custom profile and launch secure sync.'}
              </Text>
            </View>

            {/* Aesthetic Bouncy Switch Tab Controls */}
            <View style={[styles.toggleTrack, cyberMode && styles.toggleTrackCyber]}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => handleToggleMode('login')} 
                style={styles.toggleButtonArea}
              >
                <Animated.View style={[styles.toggleSelectorPill, animatedLoginPillStyle]}>
                  <Text style={[
                    styles.toggleLabel, 
                    { color: mode === 'login' ? (cyberMode ? '#020204' : '#FFFFFF') : '#8E8E9F' }
                  ]}>
                    SIGN IN
                  </Text>
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => handleToggleMode('signup')} 
                style={styles.toggleButtonArea}
              >
                <Animated.View style={[styles.toggleSelectorPill, animatedSignupPillStyle]}>
                  <Text style={[
                    styles.toggleLabel, 
                    { color: mode === 'signup' ? (cyberMode ? '#020204' : '#FFFFFF') : '#8E8E9F' }
                  ]}>
                    CREATE ACCOUNT
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Custom Interactive Form Fields Card / Cyber Glassmorphism */}
            <View style={[
              styles.formContainer, 
              cyberMode ? styles.formContainerCyber : styles.formContainerClassic
            ]}>
              {/* Simulated Tech stats banner */}
              {cyberMode && (
                <View style={styles.techSpecsHeader}>
                  <View style={styles.cyberDotBlinking} />
                  <Text style={styles.techSpecsText}>SECURE CONTEXT: ONLINE // CORE SYNC: IDLE</Text>
                  <Cpu size={10} color="#00FFCC" style={{ marginLeft: 'auto' }} />
                </View>
              )}

              {mode === 'signup' && (
                <AnimatedTextInput
                  label="Visual Display Name"
                  placeholder="e.g. Hypatia"
                  value={name}
                  onChangeText={setName}
                  isValid={name.trim().length >= 2}
                  autoCapitalize="words"
                />
              )}

              <AnimatedTextInput
                label="Email Core Terminal ID"
                placeholder="voyager@nexus.network"
                value={email}
                onChangeText={setEmail}
                isValid={isEmailValid}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <AnimatedTextInput
                label="Security Access Password"
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={setPassword}
                isValid={isPasswordValid}
                isPassword={true}
                autoCapitalize="none"
              />

              {/* Holographic Security Checklist Diagnostics */}
              <View style={[styles.checklistContainer, cyberMode && styles.checklistContainerCyber]}>
                <Text style={[styles.checklistHeader, cyberMode && styles.checklistHeaderCyber]}>
                  {cyberMode ? "SYSTEM ALIGNMENT CHECK" : "Terminal Security Checklists"}
                </Text>
                
                {mode === 'signup' && (
                  <View style={styles.checklistRow}>
                    <Text style={[styles.checklistIcon, { color: name.trim().length >= 2 ? (cyberMode ? '#00FFCC' : '#1D9E75') : '#8E8E9F' }]}>
                      {name.trim().length >= 2 ? '●' : '○'}
                    </Text>
                    <Text style={[styles.checklistText, { color: name.trim().length >= 2 ? '#FFFFFF' : '#8E8E9F' }]}>
                      Name is at least 2 characters
                    </Text>
                  </View>
                )}

                <View style={styles.checklistRow}>
                  <Text style={[styles.checklistIcon, { color: isEmailValid ? (cyberMode ? '#00FFCC' : '#1D9E75') : '#8E8E9F' }]}>
                    {isEmailValid ? '●' : '○'}
                  </Text>
                  <Text style={[styles.checklistText, { color: isEmailValid ? '#FFFFFF' : '#8E8E9F' }]}>
                    Valid email format (user@domain.ext)
                  </Text>
                </View>

                <View style={styles.checklistRow}>
                  <Text style={[styles.checklistIcon, { color: hasMinLength ? (cyberMode ? '#00FFCC' : '#1D9E75') : '#8E8E9F' }]}>
                    {hasMinLength ? '●' : '○'}
                  </Text>
                  <Text style={[styles.checklistText, { color: hasMinLength ? '#FFFFFF' : '#8E8E9F' }]}>
                    Password contains 8+ characters
                  </Text>
                </View>

                {mode === 'signup' && (
                  <>
                    <View style={styles.checklistRow}>
                      <Text style={[styles.checklistIcon, { color: hasLetter ? (cyberMode ? '#00FFCC' : '#1D9E75') : '#8E8E9F' }]}>
                        {hasLetter ? '●' : '○'}
                      </Text>
                      <Text style={[styles.checklistText, { color: hasLetter ? '#FFFFFF' : '#8E8E9F' }]}>
                        Contains alphabetical letter
                      </Text>
                    </View>

                    <View style={styles.checklistRow}>
                      <Text style={[styles.checklistIcon, { color: hasDigitOrSpecial ? (cyberMode ? '#00FFCC' : '#1D9E75') : '#8E8E9F' }]}>
                        {hasDigitOrSpecial ? '●' : '○'}
                      </Text>
                      <Text style={[styles.checklistText, { color: hasDigitOrSpecial ? '#FFFFFF' : '#8E8E9F' }]}>
                        Contains number or symbol
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Dynamic encryption loader when typing password */}
              {password.length > 0 && cyberMode && (
                <View style={styles.liveDecryptBar}>
                  <Terminal size={12} color="#00FFCC" style={{ marginRight: 6 }} />
                  <Text style={styles.liveDecryptText}>
                    SECURITY KEY STACK ENCRYPTED: SHA-256 SECURED
                  </Text>
                </View>
              )}

              {/* Error Banner Notification */}
              {errorMessage ? (
                <View style={styles.errorFeedbackRow}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={styles.submitSection}>
                <NexusButton
                  type={mode === 'login' ? 'primary' : 'success'}
                  onPress={handleSubmit}
                  disabled={submitting}
                  style={cyberMode ? { backgroundColor: '#00FFCC' } : null}
                  labelStyle={cyberMode ? { color: '#020204', fontWeight: '950' } : null}
                  label={submitting ? "Authenticating..." : mode === 'login' ? "Access Terminal Core" : "Synthesize Profile Space"}
                />

                <View style={styles.separatorRow}>
                  <View style={[styles.separatorLine, cyberMode && { backgroundColor: '#1D2A2A' }]} />
                  <Text style={styles.separatorText}>OR</Text>
                  <View style={[styles.separatorLine, cyberMode && { backgroundColor: '#1D2A2A' }]} />
                </View>

                <NexusButton
                  type="secondary"
                  onPress={handleGoogleSignIn}
                  disabled={submitting}
                  testID="google_sign_in_button"
                  label="Sign In with Google"
                  style={cyberMode ? styles.googleBtnCyber : styles.googleBtn}
                  iconComponent={
                    <View style={styles.googleGContainer}>
                      <Text style={styles.googleGLetter}>G</Text>
                    </View>
                  }
                />
              </View>
            </View>

            {/* Trust Badges */}
            <View style={styles.trustBadgesRow}>
              <View style={[styles.trustBadge, cyberMode && styles.trustBadgeCyber]}>
                <ShieldCheck size={14} color={cyberMode ? '#00FFCC' : '#1D9E75'} style={{ marginRight: 6 }} />
                <Text style={[styles.trustText, cyberMode && { color: '#8EF6DB' }]}>Local Key Ring Secured</Text>
              </View>
              <View style={[styles.trustBadge, cyberMode && styles.trustBadgeCyber]}>
                <Flame size={12} color={cyberMode ? '#FF4F7B' : '#D85A30'} style={{ marginRight: 6 }} />
                <Text style={[styles.trustText, cyberMode && { color: '#FFB8C9' }]}>Telemetry Safe Mode</Text>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

        {/* Dynamic simulation Google Account Picker Modal */}
        <Modal
          visible={googlePickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setGooglePickerVisible(false)}
        >
          <View style={[styles.modalOverlay, cyberMode && { backgroundColor: 'rgba(2, 2, 4, 0.93)' }]}>
            <View style={[styles.modalContent, cyberMode ? styles.modalContentCyber : styles.modalContentClassic]}>
              <View style={styles.modalHeader}>
                <View style={[styles.googleBigGLogo, cyberMode && { backgroundColor: '#020204', borderColor: '#00FFCC', borderWidth: 1 }]}>
                  <Text style={[styles.googleBigGText, cyberMode && { color: '#00FFCC' }]}>G</Text>
                </View>
                <Text style={styles.modalTitle}>Sign in with Google</Text>
                <Text style={styles.modalSubtitle}>to continue to NEXUS Core</Text>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll} style={styles.modalScrollView}>
                {simulatedAccounts.map((account) => (
                  <TouchableOpacity
                    key={account.email}
                    style={[styles.accountRow, cyberMode && { backgroundColor: '#090F0F', borderColor: '#1F3434' }]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectSimulatedGoogleAccount(account)}
                  >
                    <View style={[styles.avatarCircle, cyberMode && { backgroundColor: '#00FFCC' }]}>
                      <Text style={[styles.avatarInitials, cyberMode && { color: '#020204' }]}>
                        {account.displayName[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.accountMeta}>
                      <Text style={styles.accountNameText}>{account.displayName}</Text>
                      <Text style={styles.accountEmailText}>{account.email}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Create Custom Identity Section */}
                <View style={[styles.customIdentityBox, cyberMode && { backgroundColor: '#040707', borderColor: '#1D2A2A' }]}>
                  <Text style={[styles.customIdentityTitle, cyberMode && { color: '#14D2A4' }]}>Authenticate with another profile:</Text>
                  
                  <TextInput
                    style={[styles.customPickerInput, cyberMode && { backgroundColor: '#0D1414', borderColor: '#1F3434', color: '#00FFCC' }]}
                    placeholder="Full Display Name (e.g. Alexis)"
                    placeholderTextColor={cyberMode ? 'rgba(0, 255, 204, 0.35)' : '#7D7D8C'}
                    value={customName}
                    onChangeText={setCustomName}
                  />
                  
                  <TextInput
                    style={[styles.customPickerInput, cyberMode && { backgroundColor: '#0D1414', borderColor: '#1F3434', color: '#00FFCC' }]}
                    placeholder="Gmail Address (e.g. alex@gmail.com)"
                    placeholderTextColor={cyberMode ? 'rgba(0, 255, 204, 0.35)' : '#7D7D8C'}
                    value={customEmail}
                    onChangeText={setCustomEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    style={[
                      styles.customSubmitBtnSpec,
                      cyberMode && { backgroundColor: '#00FFCC' },
                      (!customName.trim() || !customEmail.includes('@')) && { opacity: 0.5 }
                    ]}
                    disabled={!customName.trim() || !customEmail.includes('@')}
                    onPress={() => handleSelectSimulatedGoogleAccount({
                      displayName: customName.trim(),
                      email: customEmail.trim()
                    })}
                  >
                    <Text style={[styles.customSubmitBtnTxt, cyberMode && { color: '#020204' }]}>Launch Custom Profile</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.modalCancelBtn, cyberMode && { borderColor: '#5C8A8A' }]}
                activeOpacity={0.8}
                onPress={() => setGooglePickerVisible(false)}
              >
                <Text style={styles.modalCancelTxt}>Cancel Google Sign-In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </GlobalBackground>
    </AnimatedPage>
  );
}

const styles = StyleSheet.create({
  cyberObsidianBacking: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020204',
    opacity: 0.97,
    zIndex: -1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    paddingTop: 72,
    paddingBottom: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeBadgeContainer: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  themeTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.2,
  },
  themeTogglePillCyber: {
    backgroundColor: 'rgba(0, 255, 204, 0.08)',
    borderColor: '#00FFCC',
  },
  themeTogglePillClassic: {
    backgroundColor: 'rgba(250, 199, 117, 0.08)',
    borderColor: '#FAC775',
  },
  themeToggleText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  themeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleDotTrack: {
    width: 20,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: 1,
  },
  toggleDotThumb: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logoAndHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  orbitalScope: {
    width: 100,
    height: 100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  orbitRingOuter: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitRingInner: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderStyle: 'dotted',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitNode: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  glowingOrb: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '950',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E9F',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  toggleTrack: {
    flexDirection: 'row',
    backgroundColor: '#141426',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#29294C',
    width: '100%',
    maxWidth: 340,
    marginBottom: 24,
  },
  toggleTrackCyber: {
    backgroundColor: '#020204',
    borderColor: '#1F3434',
  },
  toggleButtonArea: {
    flex: 1,
  },
  toggleSelectorPill: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 1,
  },
  formContainer: {
    width: '100%',
    maxWidth: 340,
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 20,
  },
  formContainerClassic: {
    backgroundColor: 'rgba(20, 20, 38, 0.4)',
    borderColor: '#2A2A4E',
  },
  formContainerCyber: {
    backgroundColor: 'rgba(6, 12, 12, 0.85)',
    borderColor: '#00FFCC',
    shadowColor: '#00FFCC',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  techSpecsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1F3434',
    paddingBottom: 10,
    marginBottom: 18,
  },
  cyberDotBlinking: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FFCC',
    marginRight: 6,
  },
  techSpecsText: {
    color: '#00FFCC',
    fontSize: 8.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
  },
  errorFeedbackRow: {
    backgroundColor: 'rgba(216, 90, 48, 0.12)',
    borderWidth: 1,
    borderColor: '#D85A30',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  liveDecryptBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 204, 0.05)',
    borderColor: 'rgba(0, 255, 204, 0.2)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  liveDecryptText: {
    color: '#00FFCC',
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '900',
  },
  submitSection: {
    marginTop: 4,
  },
  trustBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    flexWrap: 'wrap',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C32',
    borderWidth: 1,
    borderColor: '#2D2D4F',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
  },
  trustBadgeCyber: {
    backgroundColor: '#040707',
    borderColor: '#1D2A2A',
  },
  trustText: {
    color: '#8E8E9F',
    fontSize: 10,
    fontWeight: '850',
  },
  checklistContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  checklistContainerCyber: {
    backgroundColor: '#040707',
    borderColor: '#1D2A2A',
  },
  checklistHeaderCyber: {
    color: '#00FFCC',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  checklistHeader: {
    color: '#FAC775',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checklistIcon: {
    fontSize: 10,
    marginRight: 8,
    fontWeight: 'bold',
  },
  checklistText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3B3B66',
  },
  separatorText: {
    color: '#8E8E9F',
    fontSize: 11,
    fontWeight: '900',
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  googleBtn: {
    backgroundColor: '#1E1E38',
    borderColor: '#4A4A7A',
    borderWidth: 1,
    marginTop: 2,
    minHeight: 48,
  },
  googleBtnCyber: {
    backgroundColor: '#040707',
    borderColor: '#1F3434',
    borderWidth: 1,
    marginTop: 2,
    minHeight: 48,
  },
  googleGContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  googleGLetter: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  modalContentClassic: {
    backgroundColor: '#141426',
    borderColor: '#3B3B66',
  },
  modalContentCyber: {
    backgroundColor: '#020204',
    borderColor: '#00FFCC',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  googleBigGLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  googleBigGText: {
    color: '#4285F4',
    fontSize: 24,
    fontWeight: '900',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#8E8E9F',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  modalScrollView: {
    flexGrow: 0,
    marginBottom: 16,
  },
  modalScroll: {
    paddingBottom: 4,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C32',
    borderWidth: 1,
    borderColor: '#29294C',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7F77DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  accountMeta: {
    flex: 1,
  },
  accountNameText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  accountEmailText: {
    color: '#AFB2C4',
    fontSize: 11,
    marginTop: 2,
  },
  customIdentityBox: {
    backgroundColor: '#0E0E1B',
    borderColor: '#29294C',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  customIdentityTitle: {
    color: '#FAC775',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 10,
  },
  customPickerInput: {
    backgroundColor: '#16162A',
    borderColor: '#2C2C53',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 10,
  },
  customSubmitBtnSpec: {
    backgroundColor: '#7F77DD',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  customSubmitBtnTxt: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  modalCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3B3B66',
    borderRadius: 14,
  },
  modalCancelTxt: {
    color: '#8E8E9F',
    fontSize: 12.5,
    fontWeight: '800',
  },
});
