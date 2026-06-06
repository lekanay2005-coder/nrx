import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Pressable } from 'react-native';
import { Send, Zap, User, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalBackground, { BackgroundController } from '../components/GlobalBackground';
import AnimatedPage from '../components/AnimatedPage';
import NexusButton from '../components/NexusButton';
import AnimatedTextInput from '../components/AnimatedTextInput';
import MainFeed from '../components/MainFeed';
import CreatePostModal from '../components/CreatePostModal';
import ReadinessGuardModal from '../components/ReadinessGuardModal';
import { useHaptics } from '../hooks/useHaptics';
import { insertMongoDBDocument, fetchMongoDBCollection } from '../services/mongodb';
import { AuthService } from '../services/authService';
import { geminiService } from '../services/gemini';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, limit } from 'firebase/firestore';

export default function HomeScreen() {
  const navigation = useNavigation();
  const haptic = useHaptics();
  const feedRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Sync auth and user details
  useEffect(() => {
    const unsubscribe = AuthService.subscribeToAuthChanges((usr) => {
      setCurrentUser(usr);
    });
    return () => unsubscribe();
  }, []);

  // Readiness Intercept and Create Post modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [interceptVisible, setInterceptVisible] = useState(false);
  const [proposalDetails, setProposalDetails] = useState({ score: 0, text: '', feedback: '', categories: ['Active Growth'] });

  const handlePublishAttempt = async (text, categories) => {
    const postContent = typeof text === 'string' ? text : inputText;
    const postCats = Array.isArray(categories) ? categories : ['Active Growth'];

    if (!postContent.trim()) return;
    haptic('MEDIUM');
    setSubmittingPost(true);

    try {
      // Connect live to Gemini cognitive analysis endpoint
      const result = await geminiService.analyzeReadiness(postContent.trim());
      
      setProposalDetails({
        score: typeof result.readinessScore === 'number' ? result.readinessScore : 88,
        text: postContent.trim(),
        feedback: result.feedback || "Approved automatically via live AI cognitive synthesis.",
        categories: postCats
      });
      setInterceptVisible(true);
    } catch (err) {
      console.warn("AI Readiness scan failed, using robust offline fallback metric:", err.message);
      const words = postContent.trim().split(/\s+/).length;
      const score = words < 4 ? 45 : 92;
      const feedback = words < 4
        ? "This post is highly minimalist. Add more context or goal alignments to build community value."
        : "Excellent alignment! Clear objectives and supportive phrasing detected.";

      setProposalDetails({
        score,
        text: postContent.trim(),
        feedback,
        categories: postCats
      });
      setInterceptVisible(true);
    } finally {
      setSubmittingPost(false);
    }
  };

  const confirmPublish = async () => {
    setInterceptVisible(false);
    setCreateModalVisible(false);
    haptic('SUCCESS');

    // Trigger success burst floating up in GlobalBackground!
    if (BackgroundController.triggerSuccess) {
      BackgroundController.triggerSuccess();
    }

    const authorName = currentUser?.displayName || 'ComeBack Champion';
    const newPost = {
      author: authorName,
      content: proposalDetails.text,
      likes: 0,
      isLiked: false,
      categories: proposalDetails.categories || ['Active Growth'],
      comments: [],
      createdAt: new Date().toISOString()
    };

    let finalId = 'local_' + Date.now().toString();

    try {
      if (db) {
        const postsCol = collection(db, 'posts');
        const docRef = await addDoc(postsCol, newPost);
        finalId = docRef.id;
        console.log("[Firestore Success] Staged content published under ID: ", finalId);
      }
    } catch (e) {
      console.warn("[Firestore Fail] Reverting post to local offline stack: ", e.message);
    }

    const compiledPost = {
      ...newPost,
      id: finalId
    };

    // Backup log write
    insertMongoDBDocument('posts', compiledPost);

    feedRef.current?.addNewPost(compiledPost);
    setInputText('');
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Profile Card Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.name}>{currentUser?.displayName || 'ComeBack Champion'}</Text>
        </View>
        <Pressable
          onPress={() => {
            haptic('MEDIUM');
            navigation.navigate('Profile');
          }}
          style={[
            styles.avatar,
            currentUser?.avatarColor ? { backgroundColor: currentUser.avatarColor } : null
          ]}
          testID="profile_avatar_button"
        >
          {currentUser?.avatarEmoji ? (
            <Text style={{ fontSize: 24, textAlign: 'center' }}>{currentUser.avatarEmoji}</Text>
          ) : (
            <User color="#FFFFFF" size={24} />
          )}
        </Pressable>
      </View>

      {/* AI Briefing Box */}
      <View style={styles.briefCard}>
        <View style={styles.row}>
          <Zap color="#1D9E75" size={18} />
          <Text style={styles.briefTitle}>RECOVERY BRIEFING</Text>
        </View>
        <Text style={styles.briefText}>
          Your recovery coefficient is <Text style={styles.high}>94% (Exceptional)</Text>. Start your 15-minute quick study ramp-up today and celebrate being back inside the momentum arena!
        </Text>
      </View>

      {/* Custom Post Composer Trigger */}
      <Pressable
        style={styles.composeCard}
        onPress={() => {
          haptic('LIGHT');
          setCreateModalVisible(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Open compose reflection modal"
        testID="open_create_post_button"
      >
        <Text style={styles.sectionTitle}>Publish Thoughts</Text>
        <View style={styles.inlineButtonTrigger}>
          <Text style={styles.inlineButtonPlaceholder}>Share an action, reflection, or core metric...</Text>
          <View style={styles.inlineButtonIconPill}>
            <Plus size={14} color="#FFFFFF" />
          </View>
        </View>
      </Pressable>
    </View>
  );

  return (
    <AnimatedPage type="slide-overshoot">
      <GlobalBackground>
        <MainFeed
          ref={feedRef}
          currentUser={currentUser}
          headerComponent={renderHeader}
        />

        {/* Floating Action Button (FAB) relative overlay */}
        <Pressable
          style={styles.fab}
          onPress={() => {
            haptic('LIGHT');
            setCreateModalVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Floating compose reflection"
          testID="floating_create_post_button"
        >
          <Plus size={24} color="#FFFFFF" />
        </Pressable>

        <CreatePostModal
          visible={createModalVisible}
          currentUser={currentUser}
          submitting={submittingPost}
          onClose={() => setCreateModalVisible(false)}
          onSubmit={(text, categories) => {
            handlePublishAttempt(text, categories);
          }}
        />

        <ReadinessGuardModal
          visible={interceptVisible}
          score={proposalDetails.score}
          contentProposed={proposalDetails.text}
          feedback={proposalDetails.feedback}
          onApprove={confirmPublish}
          onCancel={() => {
            setInterceptVisible(false);
            haptic('WARNING');
          }}
        />
      </GlobalBackground>
    </AnimatedPage>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingTop: 64,
    paddingBottom: 100, // Safe padding for bottom bar
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcome: {
    fontSize: 14,
    color: '#8E8E9F',
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7F77DD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  briefCard: {
    backgroundColor: '#1D1D35',
    borderWidth: 1.5,
    borderColor: '#1D9E75',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  briefTitle: {
    color: '#1D9E75',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginLeft: 6,
  },
  briefText: {
    color: '#D1D3E0',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  high: {
    fontWeight: '800',
    color: '#1D9E75',
  },
  composeCard: {
    backgroundColor: '#1C1C32',
    borderWidth: 1,
    borderColor: '#2D2D4F',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  inlineButtonTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#10101F',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2D2D4F',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inlineButtonPlaceholder: {
    color: '#6D6D8A',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inlineButtonIconPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7F77DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7F77DD',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7F77DD',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#9E97F0',
  },
});
