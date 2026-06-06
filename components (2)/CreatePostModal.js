import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Tag, User, Sparkles } from 'lucide-react-native';
import NexusButton from './NexusButton';
import { useHaptics } from '../hooks/useHaptics';

export default function CreatePostModal({
  visible,
  currentUser,
  onClose,
  onSubmit,
  submitting = false,
}) {
  const haptic = useHaptics();
  const [text, setText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['Active Growth']);

  const availableCategories = [
    'Mindset',
    'Growth',
    'Digital Detox',
    'Science',
    'Active Growth',
    'Self Mastery',
  ];

  const handleToggleCategory = (category) => {
    haptic('LIGHT');
    if (selectedCategories.includes(category)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== category));
      }
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim(), selectedCategories);
    setText('');
    setSelectedCategories(['Active Growth']);
  };

  const charLimit = 280;
  const isOverLimit = text.length > charLimit;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Top Notch Handler Decorator */}
          <View style={styles.dragHandle} />

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Sparkles size={16} color="#7F77DD" style={{ marginRight: 6 }} />
              <Text style={styles.headerTitle}>Compose Post</Text>
            </View>
            <Pressable
              onPress={() => {
                haptic('WARNING');
                onClose();
              }}
              style={styles.closeButton}
              accessibilityLabel="Close create post modal"
              testID="close_create_post_button"
            >
              <X size={18} color="#8E8E9F" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* User Profile Ident Row */}
            <View style={styles.userBadgeRow}>
              <View style={styles.avatarMini}>
                <User size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.userName}>
                  {currentUser?.displayName || 'ComeBack Champion'}
                </Text>
                <Text style={styles.userStatus}>Sharing momentum updates</Text>
              </View>
            </View>

            {/* Content Input Frame */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.postInput}
                placeholder="What focus goals or breakthroughs are you tracking today?"
                placeholderTextColor="#6D6D8A"
                multiline
                numberOfLines={5}
                value={text}
                onChangeText={setText}
                maxLength={350}
                autoFocus
                testID="compose_post_input"
              />

              <View style={styles.counterRow}>
                <Text
                  style={[
                    styles.counterText,
                    isOverLimit && styles.counterErrorText,
                  ]}
                >
                  {text.length} / {charLimit}
                </Text>
              </View>
            </View>

            {/* Category Selector Title */}
            <View style={styles.categoryHeader}>
              <Tag size={13} color="#7F77DD" style={{ marginRight: 6 }} />
              <Text style={styles.categoryHeading}>Align Core Categories</Text>
            </View>

            {/* Tag Selection Chips */}
            <View style={styles.chipGrid}>
              {availableCategories.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <Pressable
                    key={category}
                    onPress={() => handleToggleCategory(category)}
                    style={[
                      styles.chip,
                      isSelected && styles.chipActive,
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    testID={`category_chip_${category.toLowerCase().replace(' ', '_')}`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipActiveText,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Action Row */}
          <View style={styles.actionBlock}>
            <NexusButton
              onPress={handleSubmit}
              disabled={!text.trim() || isOverLimit || submitting}
              label={submitting ? "Analyzing Content with AI..." : "Publish to Momentum Feed"}
              type="primary"
              testID="submit_post_button"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 12, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#16162B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.5,
    borderColor: '#29294A',
    borderBottomWidth: 0,
    maxHeight: '85%',
    minHeight: '60%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#303056',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#202042',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#20203D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  userBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  avatarMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#7F77DD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userStatus: {
    fontSize: 11,
    color: '#7F77DD',
    fontWeight: '600',
    marginTop: 1,
  },
  inputContainer: {
    backgroundColor: '#10101F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#24244D',
    padding: 14,
    marginBottom: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  postInput: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
    minHeight: 100,
    padding: 0,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  counterText: {
    fontSize: 11,
    color: '#6D6D8A',
    fontWeight: '700',
  },
  counterErrorText: {
    color: '#F0997B',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#B0B2CE',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#1E1E3D',
    borderWidth: 1,
    borderColor: '#2D2D5E',
  },
  chipActive: {
    backgroundColor: '#28245D',
    borderColor: '#7F77DD',
  },
  chipText: {
    fontSize: 11.5,
    color: '#8E8E9F',
    fontWeight: '700',
  },
  chipActiveText: {
    color: '#AFA9EC',
  },
  actionBlock: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
