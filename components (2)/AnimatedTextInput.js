import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TextInput, Pressable, Animated as RNAnimated } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { Sparkle, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react-native';

export default function AnimatedTextInput({
  label,
  value,
  onChangeText,
  error,
  isValid,
  isPassword = false,
  placeholder,
  ...props
}) {
  const [internalFocused, setInternalFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const labelProgress = useSharedValue(value ? 1 : 0);
  const typingShake = useSharedValue(0);
  const errorShake = useSharedValue(0);
  const borderPulse = useSharedValue(0);
  const successBreath = useSharedValue(1);
  const errorScale = useSharedValue(0);

  // Dynamic Border Color calculation
  const borderProgress = useSharedValue(0); // 0 silent, 1 focused, 2 success, 3 error

  useEffect(() => {
    // Sync validation state changes
    if (error) {
      borderProgress.value = withTiming(3, { duration: 150 });
      errorScale.value = withSpring(1, { damping: 10 });
      // Aggressive left-right shake (4 times over 400ms)
      errorShake.value = withSequence(
        withTiming(-8, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(-6, { duration: 80 }),
        withTiming(6, { duration: 80 }),
        withTiming(-3, { duration: 40 }),
        withTiming(3, { duration: 40 }),
        withTiming(0, { duration: 40 })
      );
    } else if (isValid) {
      borderProgress.value = withTiming(2, { duration: 150 });
      errorScale.value = withTiming(0, { duration: 150 });
      // Breathe in satisfaction
      successBreath.value = withSequence(
        withTiming(0.96, { duration: 100 }),
        withSpring(1.04, { damping: 8 }),
        withTiming(1.0, { duration: 100 })
      );
    } else if (internalFocused) {
      borderProgress.value = withTiming(1, { duration: 150 });
      errorScale.value = withTiming(0, { duration: 150 });
    } else {
      borderProgress.value = withTiming(0, { duration: 150 });
      errorScale.value = withTiming(0, { duration: 150 });
    }
  }, [error, isValid, internalFocused]);

  const handleFocus = () => {
    setInternalFocused(true);
    labelProgress.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    // Pulse once with a highlight ring
    borderPulse.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 250 })
    );
  };

  const handleBlur = () => {
    setInternalFocused(false);
    if (!value) {
      labelProgress.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
    }
  };

  const handleChangeText = (text) => {
    if (onChangeText) onChangeText(text);

    // Subtle horizontal satisfying keystroke shake (1px)
    typingShake.value = withSequence(
      withTiming(1.2, { duration: 25 }),
      withTiming(-1.2, { duration: 25 }),
      withTiming(0, { duration: 15 })
    );
  };

  // Label animation styles
  const labelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(labelProgress.value, [0, 1], [14, -8]);
    const scale = interpolate(labelProgress.value, [0, 1], [1.0, 0.78]);
    const color = interpolateColor(
      labelProgress.value,
      [0, 1],
      ['#8E8E9F', '#7F77DD']
    );

    return {
      transform: [
        { translateY },
        { scale },
        { translateX: interpolate(labelProgress.value, [0, 1], [0, -6]) },
      ],
      color,
    };
  });

  // Dynamic glow ring style
  const containerStyle = useAnimatedStyle(() => {
    const defaultColor = '#29294C';
    const focusColor = '#7F77DD';
    const okColor = '#1D9E75';
    const errColor = '#D85A30';

    const borderColor = interpolateColor(
      borderProgress.value,
      [0, 1, 2, 3],
      [defaultColor, focusColor, okColor, errColor]
    );

    const glowWidth = interpolate(borderPulse.value, [0, 1], [0, 4]);

    return {
      borderColor,
      borderLeftWidth: internalFocused ? 4 : 1.5,
      borderLeftColor: focusColor,
      backgroundColor: internalFocused ? '#24243D' : '#1C1C32',
      borderWidth: 1.5,
      transform: [
        { translateX: typingShake.value + errorShake.value },
        { scale: successBreath.value },
      ],
      shadowColor: focusColor,
      shadowOpacity: interpolate(borderPulse.value, [0, 1], [0, 0.3]),
      shadowRadius: glowWidth,
    };
  });

  // Password strength helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: '#8E8E9F' };
    if (pass.length < 8) return { score: 1, label: 'Weak (Min. 8 characters needed)', color: '#D85A30' };
    
    // Check complexity
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasNonalphas = /\W/.test(pass);
    
    const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasNonalphas].filter(Boolean).length;
    
    if (complexityScore <= 1) return { score: 2, label: 'Medium Security', color: '#FAC775' };
    if (complexityScore === 2) return { score: 3, label: 'Strong Security', color: '#1D9E75' };
    return { score: 4, label: 'Vortex Lock Encryption', color: '#7F77DD' };
  };

  const strength = isPassword ? getPasswordStrength(value) : null;

  // Validation message style
  const errorMsgStyle = useAnimatedStyle(() => {
    return {
      opacity: errorScale.value,
      transform: [{ translateY: interpolate(errorScale.value, [0, 1], [-10, 0]) }],
    };
  });

  return (
    <View style={styles.root}>
      {/* Label float box */}
      <Animated.Text style={[styles.floatingLabel, labelStyle]}>
        {label}
      </Animated.Text>

      <Animated.View style={[styles.inputWrapper, containerStyle]}>
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          placeholder={internalFocused ? placeholder : ""}
          placeholderTextColor="rgba(142, 142, 159, 0.5)"
          style={styles.textInput}
          {...props}
        />

        {/* Dynamic status indicators */}
        <View style={styles.rightAddon}>
          {isPassword && value.length > 0 && (
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={{ marginRight: 8, padding: 4 }}
              hitSlop={8}
              testID="password_toggle_eye"
            >
              {showPassword ? (
                <EyeOff size={18} color="#8E8E9F" />
              ) : (
                <Eye size={18} color="#7F77DD" />
              )}
            </Pressable>
          )}
          {isValid && (
            <Animated.View style={styles.checkmarkBox}>
              <CheckCircle size={18} color="#1D9E75" />
            </Animated.View>
          )}
          {error && (
            <Animated.View style={styles.errorIconBox}>
              <AlertCircle size={18} color="#D85A30" />
            </Animated.View>
          )}
        </View>
      </Animated.View>

      {/* Password Strength Indicator */}
      {isPassword && value && strength && (
        <View style={styles.strengthRail}>
          <View style={styles.rowBetween}>
            <Text style={styles.strengthTxt}>Credentials Security</Text>
            <Text style={[styles.strengthTxt, { color: strength.color, fontWeight: '900' }]}>
              {strength.label}
            </Text>
          </View>
          <View style={styles.strengthRoad}>
            <View
              style={[
                styles.strengthFill,
                {
                  width: `${(strength.score / 4) * 100}%`,
                  backgroundColor: strength.color,
                },
              ]}
            />
          </View>
          {strength.score === 4 && (
            <View style={styles.starCluster}>
              <Sparkle size={10} color="#7F77DD" />
              <Text style={styles.vortexPrompt}>Maximum Secure Level Signed</Text>
            </View>
          )}
        </View>
      )}

      {/* Animated Dropdown Error feedback */}
      {error && (
        <Animated.View style={[styles.errorContainer, errorMsgStyle]}>
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: 20,
    position: 'relative',
    alignSelf: 'stretch',
  },
  floatingLabel: {
    position: 'absolute',
    left: 14,
    top: 0,
    zIndex: 10,
    fontWeight: '800',
    fontSize: 13,
    backgroundColor: '#131324', // Cover border with match background
    paddingHorizontal: 6,
  },
  inputWrapper: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  rightAddon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkmarkBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#D85A30',
    fontSize: 11,
    fontWeight: '700',
  },
  strengthRail: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  strengthTxt: {
    color: '#8E8E9F',
    fontSize: 10,
    fontWeight: '700',
  },
  strengthRoad: {
    height: 4,
    backgroundColor: '#1C1C32',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  starCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  vortexPrompt: {
    fontSize: 9,
    color: '#7F77DD',
    fontWeight: '800',
    marginLeft: 4,
  },
});
