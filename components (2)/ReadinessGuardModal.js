import React from 'react';
import { View, StyleSheet, Text, Modal } from 'react-native';
import { Shield } from 'lucide-react-native';
import NexusButton from './NexusButton';

export default function ReadinessGuardModal({ visible, score, contentProposed, feedback, onApprove, onCancel }) {
  const isHealthy = score >= 75;
  const accentColor = isHealthy ? '#1D9E75' : '#D85A30';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { borderColor: accentColor }]}>
          <View style={styles.header}>
            <Shield color={accentColor} size={28} />
            <Text style={[styles.headerTxt, { color: accentColor }]}>
              BURNOUT SAFETY INTERCEPT
            </Text>
          </View>

          <View style={[styles.circle, { backgroundColor: `${accentColor}1A` }]}>
            <Text style={[styles.scoreText, { color: accentColor }]}>
              {score}%
            </Text>
            <Text style={styles.scoreSub}>MOTIVATION INDEX</Text>
          </View>

          <Text style={styles.proposal}>
            Reflection: "{contentProposed}"
          </Text>

          <Text style={styles.feedback}>
            Coach Advice: {feedback}
          </Text>

          <View style={styles.buttonRow}>
            <NexusButton
              type="secondary"
              onPress={onCancel}
              label="Cancel"
              style={{ flex: 1, marginRight: 12 }}
            />

            <NexusButton
              type={isHealthy ? 'success' : 'danger'}
              onPress={onApprove}
              label="Approve & Post"
              style={{ flex: 1.4 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#1C1C32',
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTxt: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 8,
  },
  circle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '950',
  },
  scoreSub: {
    fontSize: 9,
    color: '#8E8E9F',
    fontWeight: '700',
    marginTop: 2,
  },
  proposal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  feedback: {
    fontSize: 13,
    color: '#AFB2C4',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#2A2A3D',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 12,
  },
  cancelBtnText: {
    color: '#AFB2C4',
    fontWeight: '700',
  },
  approveBtn: {
    flex: 1.3,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
