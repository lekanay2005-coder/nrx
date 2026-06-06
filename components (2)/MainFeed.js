import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { RefreshCw, MessageSquare, AlertTriangle, Cpu } from 'lucide-react-native';
import { db } from '../services/firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { fetchMongoDBCollection, insertMongoDBDocument } from '../services/mongodb';
import { useHaptics } from '../hooks/useHaptics';
import { BackgroundController } from './GlobalBackground';
import FeedCard from './FeedCard';
import SkeletonCard from './SkeletonCard';

const MainFeed = forwardRef(({ currentUser, onScroll, headerComponent, footerComponent }, ref) => {
  const haptic = useHaptics();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorState, setErrorState] = useState(false);

  // Fetch posts from Firestore (or fallback to local MongoDB collection)
  const fetchPosts = async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorState(false);

    const start = Date.now();
    let loadedFromFirestore = false;
    let fetchedFeed = null;

    try {
      if (db) {
        console.log("[Firestore Sync] MainFeed fetching posts collection...");
        const postsCol = collection(db, 'posts');
        const q = query(postsCol, orderBy('createdAt', 'desc'), limit(30));
        const snap = await getDocs(q);

        if (!snap.empty) {
          fetchedFeed = snap.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              author: data.author || 'ComeBack Champion',
              content: data.content || '',
              likes: typeof data.likes === 'number' ? data.likes : 0,
              isLiked: !!data.isLiked,
              categories: data.categories || ['Active Growth'],
              comments: data.comments || [],
              createdAt: data.createdAt || new Date().toISOString()
            };
          });
          loadedFromFirestore = true;
          console.log(`[Firestore Sync] MainFeed successfully fetched ${fetchedFeed.length} posts.`);
        }
      }
    } catch (error) {
      console.warn("[Firestore Fail] MainFeed could not query posts. Trying fallback.", error.message);
    }

    // Try MongoDB collection next as local fallback / sync pipeline
    if (!loadedFromFirestore) {
      try {
        const remoteDocs = await fetchMongoDBCollection('posts');
        if (remoteDocs && remoteDocs.length > 0) {
          // Sort posts by createdAt desc
          const sorted = [...remoteDocs].sort((a, b) => {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          });
          fetchedFeed = sorted.map(docSnap => ({
            ...docSnap,
            id: docSnap.id || docSnap._id || 'local_' + Math.random(),
            comments: docSnap.comments || []
          }));
          loadedFromFirestore = true;
          console.log(`[MongoDB Sync] MainFeed loaded ${fetchedFeed.length} posts.`);
        }
      } catch (err) {
        console.warn("[MongoDB Fallback Fail] MainFeed fallback also failed:", err.message);
      }
    }

    // Beautiful minimum loading duration (900ms) for professional pacing
    const elapsed = Date.now() - start;
    const remaining = Math.max(900 - elapsed, 0);

    setTimeout(() => {
      if (fetchedFeed && fetchedFeed.length > 0) {
        setFeed(fetchedFeed);
      } else {
        // Safe pre-seeded network fallback
        console.log("[MainFeed] Resolving with local default state seed.");
        if (feed.length === 0) {
          setFeed([
            {
              id: 'seed_1',
              author: 'Marcus Aurelius',
              content: 'True resilience is forged from small daily micro-habits. Complete your focus stack today.',
              likes: 12,
              isLiked: false,
              categories: ['Mindset', 'Growth'],
              comments: [
                { id: 'sc1_1', author: 'Seneca', content: 'Indeed, consistency is the ultimate driver!', timestamp: '2h ago' }
              ],
              createdAt: new Date().toISOString()
            },
            {
              id: 'seed_2',
              author: 'Hypatia',
              content: 'The stars shine brightest when light pollution disappears. Disconnect for 20 mins to refresh.',
              likes: 8,
              isLiked: true,
              categories: ['Digital Detox', 'Science'],
              comments: [],
              createdAt: new Date().toISOString()
            }
          ]);
        }
      }
      setLoading(false);
      setRefreshing(false);
    }, remaining);
  };

  // Expose triggers to parent components (like HomeScreen for real-time post creation feeds)
  useImperativeHandle(ref, () => ({
    refreshFeed: () => {
      fetchPosts(false);
    },
    addNewPost: (newPost) => {
      setFeed(prevFeed => [newPost, ...prevFeed]);
    }
  }));

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(() => {
    haptic('LIGHT');
    fetchPosts(true);
  }, []);

  const handleLike = async (id) => {
    let targetPost = null;
    const updatedFeed = feed.map(p => {
      if (p.id === id) {
        const isNowLiked = !p.isLiked;
        if (isNowLiked && BackgroundController.triggerSuccess) {
          BackgroundController.triggerSuccess();
        }
        targetPost = {
          ...p,
          isLiked: isNowLiked,
          likes: isNowLiked ? p.likes + 1 : p.likes - 1
        };
        return targetPost;
      }
      return p;
    });

    setFeed(updatedFeed);

    if (targetPost) {
      try {
        if (db && !id.toString().startsWith('local_') && !id.toString().startsWith('seed_')) {
          const postRef = doc(db, 'posts', id);
          await updateDoc(postRef, {
            likes: targetPost.likes,
            isLiked: targetPost.isLiked
          });
        }
      } catch (err) {
        console.warn("[Firestore Update Fail] Could not sync likes in MainFeed:", err.message);
      }
      // Backup sync logs
      insertMongoDBDocument('posts', targetPost);
    }
  };

  const handleAddComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    haptic('SUCCESS');

    if (BackgroundController.triggerSuccess) {
      BackgroundController.triggerSuccess();
    }

    let targetPost = null;
    const updatedFeed = feed.map(p => {
      if (p.id === postId) {
        const newRefComment = {
          id: 'c_' + Date.now().toString(),
          author: currentUser?.displayName || 'ComeBack Champion',
          content: commentText.trim(),
          timestamp: 'Just now'
        };
        const updatedComments = [...(p.comments || []), newRefComment];
        
        targetPost = {
          ...p,
          comments: updatedComments
        };
        return targetPost;
      }
      return p;
    });

    setFeed(updatedFeed);

    if (targetPost) {
      try {
        if (db && !postId.toString().startsWith('local_') && !postId.toString().startsWith('seed_')) {
          const postRef = doc(db, 'posts', postId);
          await updateDoc(postRef, {
            comments: targetPost.comments
          });
        }
      } catch (err) {
        console.warn("[Firestore Update Fail] Could not sync comments in MainFeed:", err.message);
      }
      // Backup sync to local MongoDB collection
      insertMongoDBDocument('posts', targetPost);
    }
  };

  const renderItem = ({ item, index }) => (
    <FeedCard
      post={item}
      index={index}
      onLike={() => handleLike(item.id)}
      onAddComment={(text) => handleAddComment(item.id, text)}
    />
  );

  const handleScrollEvent = (e) => {
    if (onScroll) onScroll(e);
    if (BackgroundController.triggerScrollBoost) {
      BackgroundController.triggerScrollBoost();
    }
  };

  if (loading && feed.length === 0) {
    return (
      <View style={styles.skeletonContainer}>
        {headerComponent && headerComponent()}
        <Text style={styles.feedTitle}>Growth Feed</Text>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  return (
    <FlatList
      ref={ref}
      data={feed}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.scroll}
      onScroll={handleScrollEvent}
      scrollEventThrottle={16}
      ListHeaderComponent={() => (
        <View style={styles.headerWrapper}>
          {headerComponent && headerComponent()}
          <View style={styles.feedStickyHeader}>
            <Text style={styles.feedTitle}>Growth Feed</Text>
            <Pressable 
              onPress={() => fetchPosts(false)}
              style={styles.syncIndicatorButton}
              accessibilityRole="button"
              accessibilityLabel="Sync and refresh posts"
            >
              <Cpu size={12} color="#7F77DD" style={{ marginRight: 4 }} />
              <Text style={styles.syncText}>Live Node</Text>
            </Pressable>
          </View>
        </View>
      )}
      ListFooterComponent={footerComponent}
      ListEmptyComponent={() => (
        <View style={styles.errorBox}>
          <AlertTriangle size={32} color="#F0997B" style={{ marginBottom: 10 }} />
          <Text style={styles.errorTitle}>Feed Synchronization Stalled</Text>
          <Text style={styles.errorSub}>The local database cache is currently empty. Check connectivity to node streams.</Text>
        </View>
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#7F77DD"
          colors={['#7F77DD']}
          progressBackgroundColor="#16162B"
        />
      }
      showsVerticalScrollIndicator={false}
      testID="main_feed_flatlist"
    />
  );
});

export default MainFeed;

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 110,
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  headerWrapper: {
    backgroundColor: 'transparent',
  },
  feedStickyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.0,
    textTransform: 'uppercase',
  },
  syncIndicatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B4B',
    borderColor: '#312E81',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  syncText: {
    color: '#AFA9EC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C32',
    borderWidth: 1.5,
    borderColor: '#F0997B30',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
  },
  errorTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  errorSub: {
    fontSize: 12,
    color: '#8E8E9F',
    textAlign: 'center',
    lineHeight: 18,
  },
});
