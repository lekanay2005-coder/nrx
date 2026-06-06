import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Pressable, Platform, TextInput, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Star, Heart, MessageSquare, Send, CornerDownRight, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { geminiService } from '../services/gemini';

export default function FeedCard({ post, index, onLike, onAddComment }) {
  const enterY = useSharedValue(24);
  const enterOpacity = useSharedValue(0);
  const enterTilt = useSharedValue(-1.5);

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleSummarize = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (v) {}

    if (showSummary) {
      setShowSummary(false);
      return;
    }

    setShowSummary(true);

    if (!summary) {
      setLoadingSummary(true);
      try {
        const responseText = await geminiService.summarizePost(post.content);
        setSummary(responseText);
      } catch (err) {
        console.warn('Gemini error summarizing:', err);
        setSummary('Failed to generate summary. Please check your network connection.');
      } finally {
        setLoadingSummary(false);
      }
    }
  };

  const hoverScale = useSharedValue(1);
  const hoverY = useSharedValue(0);
  const borderOpacity = useSharedValue(0);

  const doubleTapHeartScale = useSharedValue(0);
  const doubleTapHeartOpacity = useSharedValue(0);
  const doubleTapX = useSharedValue(0);
  const doubleTapY = useSharedValue(0);

  const [lastTap, setLastTap] = useState(0);

  useEffect(() => {
    // Stagger entry animations by 60ms each
    const delay = index * 60;
    enterY.value = withDelay(delay, withTiming(0, { duration: 280, easing: Easing.out(Easing.quad) }));
    enterOpacity.value = withDelay(delay, withTiming(1, { duration: 280 }));
    enterTilt.value = withDelay(delay, withTiming(0, { duration: 280 }));
  }, [index]);

  const handleTouchStart = () => {
    // Lift slightly: scale 1.01, move up 3px, border appear
    hoverScale.value = withTiming(1.01, { duration: 120 });
    hoverY.value = withTiming(-3, { duration: 120 });
    borderOpacity.value = withTiming(1, { duration: 120 });
  };

  const handleTouchEnd = () => {
    hoverScale.value = withTiming(1.0, { duration: 120 });
    hoverY.value = withTiming(0, { duration: 120 });
    borderOpacity.value = withTiming(0, { duration: 120 });
  };

  const handlePress = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double Tap Detected!
      const { locationX, locationY } = e.nativeEvent;
      doubleTapX.value = locationX;
      doubleTapY.value = locationY;
      doubleTapHeartScale.value = 0;
      doubleTapHeartOpacity.value = 1;

      doubleTapHeartScale.value = withSequence(
        withSpring(2.0, { damping: 8, stiffness: 100 }),
        withTiming(0, { duration: 400 })
      );
      doubleTapHeartOpacity.value = withTiming(0, { duration: 800 });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}

      if (onLike && !post.isLiked) {
        onLike();
      }
    } else {
      setLastTap(now);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: enterOpacity.value,
      transform: [
        { translateY: enterY.value + hoverY.value },
        { scale: hoverScale.value },
        { rotate: `${enterTilt.value}deg` },
      ],
      borderColor: `rgba(127, 119, 221, ${borderOpacity.value * 0.5})`,
      borderWidth: 0.5,
    };
  });

  const heartStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: doubleTapX.value - 24,
      top: doubleTapY.value - 24,
      transform: [{ scale: doubleTapHeartScale.value }],
      opacity: doubleTapHeartOpacity.value,
    };
  });

  return (
    <Pressable
      onPressIn={handleTouchStart}
      onPressOut={handleTouchEnd}
      onPress={handlePress}
    >
      <Animated.View style={[styles.postCard, animatedStyle]}>
        {/* Author Metadata */}
        <View style={styles.rowBetween}>
          <Text style={styles.postAuthor}>{post.author}</Text>
          <View style={styles.row}>
            {post.categories.map((c, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.postContent}>{post.content}</Text>

        {/* Expandable AI Summary Panel */}
        {showSummary && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryHeaderLeft}>
                <Sparkles size={11} color="#A5F3FC" style={{ marginRight: 5 }} />
                <Text style={styles.summaryTitle}>AI SUMMARY</Text>
              </View>
              <Pressable
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (v) {}
                  setShowSummary(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="Close summary"
              >
                <Text style={styles.summaryCloseText}>Dismiss</Text>
              </Pressable>
            </View>
            {loadingSummary ? (
              <View style={styles.summarySkeletonRow}>
                <ActivityIndicator size="small" color="#9E97F0" style={{ marginRight: 8 }} />
                <Text style={styles.summaryLoadingText}>Synthesizing cognitive brief...</Text>
              </View>
            ) : (
              <Text style={styles.summaryText}>{summary}</Text>
            )}
          </View>
        )}

        <View style={styles.actionsContainer}>
          <Pressable
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (v) {}
              if (onLike) onLike();
            }}
            style={[styles.actionButton, styles.likeButton, post.isLiked && styles.liked]}
          >
            <Star
              color={post.isLiked ? '#FFFFFF' : '#8E8E9F'}
              size={13}
              fill={post.isLiked ? '#FFFFFF' : 'transparent'}
            />
            <Text style={[styles.actionText, styles.likeText, post.isLiked && styles.likedText]}>
              {post.likes} Stars
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (v) {}
              setShowComments(!showComments);
            }}
            style={[styles.actionButton, styles.commentButton, showComments && styles.commentActive]}
          >
            <MessageSquare
              color={showComments ? '#7F77DD' : '#8E8E9F'}
              size={13}
            />
            <Text style={[styles.actionText, styles.commentText, showComments && styles.commentActiveText]}>
              {(post.comments || []).length} Comments
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSummarize}
            style={[styles.actionButton, styles.summarizeButton, showSummary && styles.summarizeActive]}
            accessibilityRole="button"
            accessibilityLabel="Summarize post with Gemini AI"
            testID={`summarize_button_${post.id}`}
          >
            <Sparkles
              color={showSummary ? '#9E97F0' : '#8E8E9F'}
              size={13}
            />
            <Text style={[styles.actionText, styles.summarizeText, showSummary && styles.summarizeActiveText]}>
              Summarize
            </Text>
          </Pressable>
        </View>

        {showComments && (
          <View style={styles.commentsSection}>
            <View style={styles.commentsSeparator} />
            
            {/* Thread of existing commentaries */}
            {(!post.comments || post.comments.length === 0) ? (
              <Text style={styles.noCommentsText}>No alignment replies. Share your perspective!</Text>
            ) : (
              <View style={styles.commentsList}>
                {post.comments.map((comment, index) => (
                  <View key={comment.id || index} style={styles.commentItem}>
                    <View style={styles.commentMetaRow}>
                      <View style={styles.commentLeftMeta}>
                        <CornerDownRight size={11} color="#7F77DD" style={{ marginRight: 5 }} />
                        <Text style={styles.commentAuthorName}>{comment.author}</Text>
                      </View>
                      <Text style={styles.commentTimestamp}>{comment.timestamp || 'Just now'}</Text>
                    </View>
                    <Text style={styles.commentContentText}>{comment.content}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Input prompt area */}
            <View style={styles.commentFieldContainer}>
              <TextInput
                style={styles.commentInputBox}
                placeholder="Type your response..."
                placeholderTextColor="#6D6D8A"
                value={commentText}
                onChangeText={setCommentText}
                maxLength={120}
              />
              <Pressable
                onPress={() => {
                  if (!commentText.trim()) return;
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  } catch (err) {}
                  if (onAddComment) {
                    onAddComment(commentText);
                  }
                  setCommentText('');
                }}
                disabled={!commentText.trim()}
                style={[styles.sendButtonPill, commentText.trim().length > 0 && styles.sendActiveState]}
              >
                <Send size={11} color={commentText.trim().length > 0 ? '#FFFFFF' : '#6D6D8A'} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Floating Heart Burst overlay on double tap */}
        <Animated.View pointerEvents="none" style={heartStyle}>
          <Heart size={48} color="#ED93B1" fill="#ED93B1" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#1C1C32',
    borderWidth: 1.5,
    borderColor: '#29294C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthor: {
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 14,
  },
  chip: {
    backgroundColor: '#141426',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3B3B66',
  },
  chipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8E9F',
  },
  postContent: {
    color: '#D1D3E0',
    fontSize: 13.5,
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    zIndex: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A30',
    borderWidth: 1,
    borderColor: '#2D2D4F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  likeButton: {
    // inherits actionButton properties
  },
  commentButton: {
    // inherits actionButton properties
  },
  commentActive: {
    backgroundColor: '#7F77DD12',
    borderColor: '#7F77DD',
  },
  actionText: {
    fontSize: 11,
    color: '#8E8E9F',
    fontWeight: '700',
    marginLeft: 5,
  },
  likeText: {
    // inherits actionText properties
  },
  likedText: {
    color: '#7F77DD',
  },
  liked: {
    backgroundColor: '#7F77DD1F',
    borderColor: '#7F77DD',
  },
  commentText: {
    // inherits actionText properties
  },
  commentActiveText: {
    color: '#7F77DD',
  },
  summaryContainer: {
    backgroundColor: '#1E1B4B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#312E81',
    padding: 12,
    marginBottom: 14,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#A5F3FC',
    letterSpacing: 1.2,
  },
  summaryCloseText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  summarySkeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLoadingText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  summaryText: {
    fontSize: 12.5,
    color: '#E2E8F0',
    lineHeight: 18,
    fontWeight: '500',
  },
  summarizeButton: {
    // inherits actionButton style
  },
  summarizeActive: {
    backgroundColor: '#312E8142',
    borderColor: '#4F46E5',
  },
  summarizeText: {
    // inherits actionText style
  },
  summarizeActiveText: {
    color: '#A5F3FC',
  },
  commentsSection: {
    marginTop: 14,
  },
  commentsSeparator: {
    height: 1,
    backgroundColor: '#242442',
    marginBottom: 12,
  },
  noCommentsText: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: '#6D6D8A',
    marginBottom: 12,
    paddingLeft: 4,
  },
  commentsList: {
    marginBottom: 12,
    gap: 10,
  },
  commentItem: {
    backgroundColor: '#131326',
    borderWidth: 1,
    borderColor: '#20203E',
    borderRadius: 10,
    padding: 10,
  },
  commentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentLeftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthorName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B2B4CC',
  },
  commentTimestamp: {
    fontSize: 9.5,
    color: '#5C5C7A',
    fontWeight: '600',
  },
  commentContentText: {
    fontSize: 12,
    color: '#D1D3E0',
    lineHeight: 16,
    paddingLeft: 16,
  },
  commentFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131326',
    borderWidth: 1,
    borderColor: '#222244',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  commentInputBox: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    paddingVertical: 6,
    height: 34,
  },
  sendButtonPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E1E38',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  sendActiveState: {
    backgroundColor: '#7F77DD',
  },
});
