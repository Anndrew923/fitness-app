import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
  where,
  deleteDoc,
} from 'firebase/firestore';
import firebaseWriteMonitor from '../utils/firebaseMonitor';

import './Community.css';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const Community = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useUser();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'friends', 'requests', 'search'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 好友相關狀態
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // 防抖狀態
  const [likeProcessing, setLikeProcessing] = useState(new Set());
  const [commentProcessing, setCommentProcessing] = useState(new Set());

  // 留言防抖計時器
  const commentDebounceTimers = useRef(new Map());

  // 批量留言操作
  // const pendingComments = useRef(new Map());

  // 追蹤載入狀態，避免重複載入
  const hasLoadedFriendsRef = useRef(false);
  const hasLoadedPostsRef = useRef(false);
  const hasLoadedRequestsRef = useRef(false);

  // 快取機制：避免重複載入相同的動態
  const postsCacheRef = useRef(new Map());
  const lastLoadTimeRef = useRef(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5分鐘快取
  // 目標用戶好友快取，降低重複讀取
  const targetFriendsCacheRef = useRef(new Map());
  const targetUserInfoCacheRef = useRef(new Map());

  // 使用 useMemo 優化計算
  const currentUserId = useMemo(() => {
    return auth.currentUser?.uid;
  }, [auth.currentUser?.uid]);

  const allowedUserIds = useMemo(() => {
    const friendIds = userData?.friends || [];
    return [currentUserId, ...friendIds].filter(Boolean);
  }, [currentUserId, userData?.friends]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts;
    }
    return posts.filter(
      post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.userNickname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  // 載入動態 - 優化版本（避免複合索引問題）
  const loadPosts = useCallback(async () => {
    if (!auth.currentUser || !userData) {
      console.log('🚫 用戶未登入或資料未載入，跳過載入動態');
      return;
    }

    const now = Date.now();

    // 檢查快取
    const cached = postsCacheRef.current.get('posts');
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log('📦 使用快取動態數據');
      setPosts(cached.data);
      return;
    }

    // 檢查是否已經載入過
    if (
      hasLoadedPostsRef.current &&
      now - lastLoadTimeRef.current < CACHE_DURATION
    ) {
      console.log('⏰ 動態數據仍在有效期限內，跳過重新載入');
      return;
    }

    console.log('🔄 開始載入動態...');
    setLoading(true);
    setError('');

    try {
      // 獲取好友列表
      const friendIds = userData?.friends || [];
      const allowedUserIds = [currentUserId, ...friendIds].filter(Boolean);

      console.log(`🔍 當前用戶ID: ${currentUserId}`);
      console.log(`🔍 好友列表: ${friendIds.join(', ')}`);
      console.log(`🔍 允許查看的用戶: ${allowedUserIds.join(', ')}`);
      console.log(`🔍 總共 ${allowedUserIds.length} 個用戶的動態需要載入`);

      // 進一步優化查詢策略：分頁載入 + 智能過濾
      const postsQuery = query(
        collection(db, 'communityPosts'),
        orderBy('timestamp', 'desc'),
        limit(50) // 進一步減少到50條，提升載入速度
      );

      const snapshot = await getDocs(postsQuery);
      const generalPosts = [];
      const targetedPosts = [];

      snapshot.forEach(docSnap => {
        const postData = docSnap.data();
        const base = {
          id: docSnap.id,
          userId: postData.userId,
          userNickname: postData.userNickname,
          userAvatarUrl: postData.userAvatarUrl,
          content: postData.content,
          timestamp: postData.timestamp,
          likes: postData.likes || [],
          commentCount: (postData.comments || []).length,
          comments: [],
          type: postData.type || 'status',
          targetUserId: postData.targetUserId,
        };

        if (postData.targetUserId) {
          targetedPosts.push(base);
        } else if (allowedUserIds.includes(postData.userId)) {
          generalPosts.push(base);
        }
      });

      // 為目標留言取得目標用戶的好友列表（去重 + 快取）
      const uniqueTargetIds = Array.from(
        new Set(targetedPosts.map(p => p.targetUserId).filter(Boolean))
      ).filter(id => !targetFriendsCacheRef.current.has(id));

      if (uniqueTargetIds.length > 0) {
        await Promise.all(
          uniqueTargetIds.map(async targetId => {
            try {
              const userDoc = await getDoc(doc(db, 'users', targetId));
              const data = userDoc.exists() ? userDoc.data() : null;
              const friends = Array.isArray(data?.friends) ? data.friends : [];
              targetFriendsCacheRef.current.set(targetId, friends);
              targetUserInfoCacheRef.current.set(targetId, {
                nickname:
                  data?.nickname ||
                  data?.email?.split('@')[0] ||
                  t('community.fallback.user'),
                avatarUrl: data?.avatarUrl || '',
              });
            } catch (e) {
              console.warn('讀取目標用戶好友失敗:', targetId, e);
              targetFriendsCacheRef.current.set(targetId, []);
              targetUserInfoCacheRef.current.set(targetId, {
                nickname: t('community.fallback.user'),
                avatarUrl: '',
              });
            }
          })
        );
      }

      // 過濾目標留言可見性：作者、目標用戶、目標用戶好友
      const filteredTargeted = targetedPosts
        .filter(p => {
          if (currentUserId === p.userId) return true;
          if (currentUserId === p.targetUserId) return true;
          const tFriends =
            targetFriendsCacheRef.current.get(p.targetUserId) || [];
          return tFriends.includes(currentUserId);
        })
        .map(p => ({
          ...p,
          targetUserNickname:
            targetUserInfoCacheRef.current.get(p.targetUserId)?.nickname || '',
        }));

      const merged = [...generalPosts, ...filteredTargeted];

      // 按時間排序（雖然查詢已經排序，但確保一致性）
      merged.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp) : new Date(a.date);
        const timeB = b.timestamp ? new Date(b.timestamp) : new Date(b.date);
        return timeB - timeA;
      });

      const limitedPosts = merged.slice(0, 30);

      console.log(`📊 載入完成：共 ${limitedPosts.length} 條動態`);
      setPosts(limitedPosts);
      hasLoadedPostsRef.current = true;
      lastLoadTimeRef.current = now;

      // 快取數據
      postsCacheRef.current.set('posts', {
        data: limitedPosts,
        timestamp: now,
      });
    } catch (error) {
      console.error('載入動態失敗:', error);
      setError(t('community.messages.loadFeedError'));
    } finally {
      setLoading(false);
    }
  }, [userData?.friends, CACHE_DURATION]);

  // 發布新動態
  const publishPost = async () => {
    if (!newPostContent.trim()) {
      setError(t('community.messages.emptyPost'));
      return;
    }

    if (!auth.currentUser) {
      setError(t('community.messages.needLogin'));
      return;
    }

    try {
      setSubmitting(true);
      console.log('📝 準備發布動態...');

      const postData = {
        userId: auth.currentUser.uid,
        userNickname:
          userData?.nickname ||
          userData?.email?.split('@')[0] ||
          t('community.fallback.anonymousUser'),
        userAvatarUrl: (() => {
          const isGuest = sessionStorage.getItem('guestMode') === 'true';
          return isGuest ? '/guest-avatar.svg' : userData?.avatarUrl || '';
        })(),
        content: newPostContent.trim(),
        type: 'status', // 一般動態
        likes: [],
        comments: [],
        timestamp: new Date().toISOString(),
        privacy: 'friends', // 預設好友可見
        // 若此貼文是發給特定用戶的留言，會在好友個人版發佈，該頁的發佈邏輯會附帶 targetUserId
      };

      const docRef = await addDoc(collection(db, 'communityPosts'), postData);

      // 記錄寫入操作
      firebaseWriteMonitor.logWrite('addDoc', 'communityPosts', docRef.id);

      console.log('✅ 動態發布成功，ID:', docRef.id);

      // 立即更新本地狀態，添加新動態到列表頂部
      const newPost = {
        id: docRef.id,
        ...postData,
      };

      console.log('🔄 更新本地狀態，添加新動態:', newPost.id);
      setPosts(prevPosts => {
        const updatedPosts = [newPost, ...prevPosts];
        console.log(`📊 更新後動態總數: ${updatedPosts.length}`);
        return updatedPosts;
      });

      // 清空輸入框
      setNewPostContent('');
      setSuccess(t('community.messages.publishSuccess'));

      // 3秒後清除成功訊息
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ 發布動態失敗:', error);
      setError(`${t('community.messages.publishFail')}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 點讚/取消點讚 - 優化版本（使用樂觀更新）
  const toggleLike = useCallback(
    async (postId, currentLikes) => {
      if (!auth.currentUser) {
        setError(t('community.messages.needLogin'));
        return;
      }

      // 防抖：避免重複點擊
      if (likeProcessing.has(postId)) {
        console.log('🔄 點讚操作進行中，請稍候...');
        return;
      }

      const isLiked = currentLikes.includes(currentUserId);

      // 計算新的點讚列表
      const newLikes = isLiked
        ? currentLikes.filter(id => id !== currentUserId)
        : [...currentLikes, currentUserId];

      // 立即更新本地狀態（樂觀更新）
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                likes: newLikes,
              }
            : post
        )
      );

      // 設置處理狀態
      setLikeProcessing(prev => new Set(prev).add(postId));

      try {
        // 使用 setDoc 替代 updateDoc，減少讀取操作
        const postRef = doc(db, 'communityPosts', postId);
        await setDoc(postRef, { likes: newLikes }, { merge: true });

        // 記錄寫入操作
        firebaseWriteMonitor.logWrite('setDoc', 'communityPosts', postId, {
          likes: `更新為 ${newLikes.length} 個點讚`,
        });

        console.log(`👍 ${isLiked ? '取消點讚' : '點讚'}成功`);
      } catch (error) {
        console.error('❌ 點讚操作失敗:', error);
        setError(t('community.messages.likeFail'));

        // 回滾本地狀態
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  likes: currentLikes, // 回滾到原始狀態
                }
              : post
          )
        );
      } finally {
        // 清除處理狀態
        setLikeProcessing(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    },
    [likeProcessing, auth.currentUser, setPosts]
  );

  // 按需載入評論 - 新增功能
  const loadComments = useCallback(async postId => {
    if (!auth.currentUser) return;

    try {
      const postRef = doc(db, 'communityPosts', postId);
      const postDoc = await getDoc(postRef);

      if (postDoc.exists()) {
        const postData = postDoc.data();
        const comments = postData.comments || [];

        // 更新本地狀態，只更新評論部分
        setPosts(prevPosts => {
          return prevPosts.map(post => {
            if (post.id === postId) {
              return { ...post, comments };
            }
            return post;
          });
        });

        console.log(`💬 載入評論完成：${comments.length} 條評論`);
      }
    } catch (error) {
      console.error('❌ 載入評論失敗:', error);
    }
  }, []);

  // 添加留言 - 優化版本（使用防抖 + 批量操作）
  const addComment = useCallback(
    async (postId, commentContent) => {
      if (!commentContent.trim()) return;
      if (!auth.currentUser) {
        setError(t('community.messages.needLogin'));
        return;
      }

      // 防抖：避免重複提交
      if (commentProcessing.has(postId)) {
        console.log('🔄 留言提交中，請稍候...');
        return;
      }

      const comment = {
        id: Date.now().toString(), // 簡單的ID生成
        userId: auth.currentUser.uid,
        userNickname:
          userData?.nickname ||
          userData?.email?.split('@')[0] ||
          t('community.fallback.anonymousUser'),
        userAvatarUrl: (() => {
          const isGuest = sessionStorage.getItem('guestMode') === 'true';
          return isGuest ? '/guest-avatar.svg' : userData?.avatarUrl || '';
        })(),
        content: commentContent.trim(),
        timestamp: new Date().toISOString(),
      };

      // 立即更新本地狀態（樂觀更新）
      setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
          if (post.id === postId) {
            const newComments = [...post.comments, comment];
            return { ...post, comments: newComments };
          }
          return post;
        });
        return updatedPosts;
      });

      // 設置處理狀態
      setCommentProcessing(prev => new Set(prev).add(postId));

      // 清除之前的計時器
      if (commentDebounceTimers.current.has(postId)) {
        clearTimeout(commentDebounceTimers.current.get(postId));
      }

      // 設置新的防抖計時器（1秒）
      const timer = setTimeout(async () => {
        try {
          // 找到對應的動態
          const currentPost = posts.find(post => post.id === postId);
          if (!currentPost) {
            setError(t('community.messages.postNotFound'));
            return;
          }

          // 計算新的留言列表
          const newComments = [...currentPost.comments, comment];

          // 使用 setDoc 替代 updateDoc
          const postRef = doc(db, 'communityPosts', postId);
          await setDoc(postRef, { comments: newComments }, { merge: true });

          // 記錄寫入操作
          firebaseWriteMonitor.logWrite('setDoc', 'communityPosts', postId, {
            comments: `新增留言，總計 ${newComments.length} 條`,
          });

          console.log('💬 留言添加成功');
        } catch (error) {
          console.error('❌ 添加留言失敗:', error);
          setError(t('community.messages.commentFail'));

          // 回滾本地狀態
          setPosts(prevPosts => {
            const updatedPosts = prevPosts.map(post => {
              if (post.id === postId) {
                const revertedComments = post.comments.filter(
                  c => c.id !== comment.id
                );
                return { ...post, comments: revertedComments };
              }
              return post;
            });
            return updatedPosts;
          });
        } finally {
          // 清除處理狀態
          setCommentProcessing(prev => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });

          // 清除計時器
          commentDebounceTimers.current.delete(postId);
        }
      }, 500);

      commentDebounceTimers.current.set(postId, timer);
    },
    [
      auth.currentUser,
      userData?.nickname,
      userData?.email,
      userData?.avatarUrl,
      commentProcessing,
      posts,
      setPosts,
    ]
  );

  // 刪除留言
  const deleteComment = useCallback(
    async (postId, commentId) => {
      if (!auth.currentUser) {
        setError(t('community.messages.needLogin'));
        return;
      }

      try {
        // 找到對應的動態
        const currentPost = posts.find(post => post.id === postId);
        if (!currentPost) {
          setError(t('community.messages.postNotFound'));
          return;
        }

        // 找到要刪除的留言
        const commentToDelete = currentPost.comments.find(
          comment => comment.id === commentId
        );
        if (!commentToDelete) {
          setError(t('community.messages.commentNotFound'));
          return;
        }

        // 檢查刪除權限
        const currentUserId = auth.currentUser.uid;
        const isPostOwner = currentPost.userId === currentUserId;
        const isCommentOwner = commentToDelete.userId === currentUserId;

        if (!isPostOwner && !isCommentOwner) {
          setError(t('community.messages.noPermission'));
          return;
        }

        // 確認刪除
        const confirmMessage = isPostOwner
          ? t('community.confirm.deleteComment')
          : t('community.confirm.deleteMyComment');

        if (!window.confirm(confirmMessage)) {
          return;
        }

        // 計算新的留言列表
        const newComments = currentPost.comments.filter(
          comment => comment.id !== commentId
        );

        // 更新數據庫
        const postRef = doc(db, 'communityPosts', postId);
        await setDoc(postRef, { comments: newComments }, { merge: true });

        // 記錄寫入操作
        firebaseWriteMonitor.logWrite('setDoc', 'communityPosts', postId, {
          comments: `刪除留言，總計 ${newComments.length} 條`,
        });

        // 更新本地狀態
        console.log('🔄 更新本地狀態，刪除留言:', commentId);
        setPosts(prevPosts => {
          const updatedPosts = prevPosts.map(post =>
            post.id === postId ? { ...post, comments: newComments } : post
          );
          console.log(`📊 動態 ${postId} 留言數: ${newComments.length}`);
          return updatedPosts;
        });

        setSuccess(t('community.messages.deleteCommentSuccess'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('❌ 刪除留言失敗:', error);
        setError(t('community.messages.deleteCommentFail'));
      }
    },
    [posts]
  );

  // 刪除動態（主要留言）
  const deletePost = useCallback(
    async postId => {
      if (!auth.currentUser) {
        setError(t('community.messages.needLogin'));
        return;
      }

      try {
        // 找到對應的動態
        const currentPost = posts.find(post => post.id === postId);
        if (!currentPost) {
          setError(t('community.messages.postNotFound'));
          return;
        }

        // 檢查刪除權限（只有動態作者可以刪除）
        const currentUserId = auth.currentUser.uid;
        if (currentPost.userId !== currentUserId) {
          setError(t('community.messages.noPermission'));
          return;
        }

        // 確認刪除
        if (!window.confirm(t('community.confirm.deletePost'))) {
          return;
        }

        // 從數據庫刪除
        const postRef = doc(db, 'communityPosts', postId);
        await deleteDoc(postRef);

        // 記錄寫入操作
        firebaseWriteMonitor.logWrite('deleteDoc', 'communityPosts', postId, {
          action: '刪除動態',
        });

        // 更新本地狀態
        console.log('🔄 更新本地狀態，刪除動態:', postId);
        setPosts(prevPosts => {
          const updatedPosts = prevPosts.filter(post => post.id !== postId);
          console.log(`📊 剩餘動態數: ${updatedPosts.length}`);
          return updatedPosts;
        });

        setSuccess(t('community.messages.deletePostSuccess'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('❌ 刪除動態失敗:', error);
        setError(t('community.messages.deletePostFail'));
      }
    },
    [posts]
  );

  // 格式化時間
  const formatTime = useCallback(
    timestamp => {
      const now = new Date();
      const postTime = new Date(timestamp);
      const diffMs = now - postTime;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return t('community.time.justNow');
      if (diffMins < 60)
        return t('community.time.minutesAgo', { count: diffMins });
      if (diffHours < 24)
        return t('community.time.hoursAgo', { count: diffHours });
      if (diffDays < 7) return t('community.time.daysAgo', { count: diffDays });
      try {
        return new Intl.DateTimeFormat(i18n.language).format(postTime);
      } catch {
        return postTime.toLocaleDateString();
      }
    },
    [i18n.language, t]
  );

  // 載入好友數據
  const loadFriendsData = useCallback(async () => {
    try {
      // 檢查是否已經載入過
      if (hasLoadedFriendsRef.current) {
        return;
      }

      setLoading(true);

      if (process.env.NODE_ENV === 'development') {
        console.log('開始載入好友列表，使用邀請記錄方式');
      }

      // 從邀請記錄中獲取好友關係
      const friendshipsQuery = query(
        collection(db, 'friendInvitations'),
        where('status', '==', 'accepted')
      );

      const friendshipsSnapshot = await getDocs(friendshipsQuery);
      const friendIds = new Set();

      // 收集所有好友的 ID
      friendshipsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.fromUserId === auth.currentUser.uid) {
          friendIds.add(data.toUserId);
        } else if (data.toUserId === auth.currentUser.uid) {
          friendIds.add(data.fromUserId);
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`找到 ${friendIds.size} 位好友:`, Array.from(friendIds));
      }

      // 獲取好友詳細信息
      const friendsData = [];
      for (const friendId of friendIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', friendId));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            // 確保 userData 存在
            if (!userData) {
              console.warn(`好友 ${friendId} 的用戶數據為空`);
              continue;
            }

            console.log(
              `✅ 載入好友資料: ${friendId} - ${
                userData.nickname || userData.email
              }`
            );

            // 獲取好友的運動評分
            let averageScore = 0;
            let scoreCount = 0;

            // 從好友的用戶文檔的 scores 字段獲取評分
            if (userData.scores) {
              const scores = [];

              // 檢查各種評測分數
              if (userData.scores.strength && userData.scores.strength > 0) {
                scores.push(userData.scores.strength);
              }
              if (
                userData.scores.explosivePower &&
                userData.scores.explosivePower > 0
              ) {
                scores.push(userData.scores.explosivePower);
              }
              if (userData.scores.cardio && userData.scores.cardio > 0) {
                scores.push(userData.scores.cardio);
              }
              if (
                userData.scores.muscleMass &&
                userData.scores.muscleMass > 0
              ) {
                scores.push(userData.scores.muscleMass);
              }
              if (userData.scores.bodyFat && userData.scores.bodyFat > 0) {
                scores.push(userData.scores.bodyFat);
              }

              console.log(`好友 ${friendId} 的評分數據:`, userData.scores);
              console.log(`好友 ${friendId} 的有效分數:`, scores);

              if (scores.length > 0) {
                averageScore =
                  scores.reduce((a, b) => a + b, 0) / scores.length;
                scoreCount = scores.length;
                console.log(
                  `好友 ${friendId} 平均分數: ${averageScore}, 項目數: ${scoreCount}`
                );
              }
            } else {
              console.log(`好友 ${friendId} 沒有評分數據`);
            }

            friendsData.push({
              id: friendId,
              nickname:
                userData.nickname ||
                userData.email?.split('@')[0] ||
                '未命名用戶',
              email: userData.email || '',
              avatarUrl: userData.avatarUrl || '',
              averageScore:
                averageScore > 0 ? Number(averageScore).toFixed(2) : null,
              scoreCount: scoreCount,
              lastActive: userData.lastActive,
            });
          }
        } catch (error) {
          console.error(`載入好友 ${friendId} 數據失敗:`, error);
        }
      }

      // 驗證數據完整性
      const validFriendsData = friendsData.filter(
        friend => friend && friend.id && typeof friend.nickname === 'string'
      );

      setFriendsList(validFriendsData);

      // 更新 userData 中的好友列表
      const friendIdsArray = Array.from(friendIds);
      setUserData(prev => ({
        ...prev,
        friends: friendIdsArray,
      }));

      if (process.env.NODE_ENV === 'development') {
        console.log('好友列表載入完成:', validFriendsData);
        console.log('更新 userData.friends:', friendIdsArray);
      }

      // 標記已載入
      hasLoadedFriendsRef.current = true;
    } catch (error) {
      console.error('載入好友數據失敗:', error);
      setError(t('community.messages.loadFriendsFail'));
      // 即使載入失敗也要標記為已嘗試載入，避免無限重試
      hasLoadedFriendsRef.current = true;
    } finally {
      setLoading(false);
    }
  }, []);

  // 載入好友邀請
  const loadFriendRequests = useCallback(async () => {
    try {
      console.log('🔍 開始載入好友邀請...');
      console.log('當前用戶ID:', auth.currentUser.uid);

      // 先檢查所有發送給當前用戶的邀請
      const allRequestsQuery = query(
        collection(db, 'friendInvitations'),
        where('toUserId', '==', auth.currentUser.uid)
      );

      const allRequestsSnapshot = await getDocs(allRequestsQuery);
      console.log('📋 找到所有邀請數量:', allRequestsSnapshot.docs.length);

      // 顯示所有邀請的詳細信息
      allRequestsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`邀請 ${index + 1}:`, {
          id: doc.id,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          status: data.status,
          createdAt: data.createdAt,
        });
      });

      // 只顯示pending狀態的邀請
      const requestsQuery = query(
        collection(db, 'friendInvitations'),
        where('toUserId', '==', auth.currentUser.uid),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(requestsQuery);
      console.log('📋 找到pending邀請數量:', snapshot.docs.length);
      const requests = [];

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        try {
          const userDoc = await getDoc(doc(db, 'users', data.fromUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            requests.push({
              id: docSnapshot.id,
              fromUserId: data.fromUserId,
              nickname:
                userData.nickname ||
                userData.email?.split('@')[0] ||
                '未命名用戶',
              email: userData.email,
              avatarUrl: userData.avatarUrl || '',
              createdAt: data.createdAt,
            });
          }
        } catch (error) {
          console.error(`獲取邀請用戶信息失敗:`, error);
        }
      }

      console.log('✅ 載入完成，邀請列表:', requests);
      setFriendRequests(requests);
      // 標記已載入
      hasLoadedRequestsRef.current = true;
    } catch (error) {
      console.error('載入好友邀請失敗:', error);
      // 即使載入失敗也要標記為已嘗試載入
      hasLoadedRequestsRef.current = true;
    }
  }, [setFriendRequests]);

  // 搜尋用戶
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const usersQuery = query(collection(db, 'users'));
      const snapshot = await getDocs(usersQuery);
      const results = [];

      snapshot.forEach(doc => {
        const userData = doc.data();
        const searchTerm = searchQuery.toLowerCase();
        const nickname = (userData.nickname || '').toLowerCase();
        const email = (userData.email || '').toLowerCase();

        if (
          (nickname.includes(searchTerm) || email.includes(searchTerm)) &&
          doc.id !== auth.currentUser.uid
        ) {
          results.push({
            id: doc.id,
            nickname:
              userData.nickname ||
              userData.email?.split('@')[0] ||
              '未命名用戶',
            email: userData.email,
            avatarUrl: userData.avatarUrl || '',
            isFriend: friendsList.some(friend => friend.id === doc.id),
            hasPendingRequest: false, // 簡化處理
          });
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error('搜尋用戶失敗:', error);
      setError(t('community.messages.searchFail'));
    } finally {
      setLoading(false);
    }
  };

  // 發送好友邀請
  const sendFriendRequest = async toUserId => {
    try {
      console.log('📤 開始發送好友邀請...');
      console.log('發送者ID:', auth.currentUser.uid);
      console.log('接收者ID:', toUserId);
      setLoading(true);

      // 檢查是否已經發送過邀請
      const existingQuery = query(
        collection(db, 'friendInvitations'),
        where('fromUserId', '==', auth.currentUser.uid),
        where('toUserId', '==', toUserId),
        where('status', '==', 'pending')
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        console.log('⚠️ 發現已存在的邀請:', existingSnapshot.docs.length, '個');

        // 檢查邀請是否真的存在且有效
        const existingInvitation = existingSnapshot.docs[0];
        const existingData = existingInvitation.data();
        console.log('現有邀請資料:', existingData);

        // 檢查邀請是否超過24小時，如果是則允許重新發送
        const invitationTime = new Date(existingData.createdAt);
        const now = new Date();
        const hoursDiff = (now - invitationTime) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
          console.log('📅 邀請已超過24小時，允許重新發送');
          // 刪除舊邀請
          await deleteDoc(doc(db, 'friendInvitations', existingInvitation.id));
          console.log('🗑️ 已刪除舊邀請');
        } else {
          // 如果邀請存在但對方沒有收到，可能是資料問題，允許重新發送
          setError(t('community.messages.inviteSent'));

          // 清除錯誤訊息，讓用戶可以重試
          setTimeout(() => {
            setError('');
          }, 3000);

          return;
        }
      }

      // 發送邀請
      const invitationData = {
        fromUserId: auth.currentUser.uid,
        toUserId: toUserId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      console.log('📝 邀請資料:', invitationData);
      const docRef = await addDoc(
        collection(db, 'friendInvitations'),
        invitationData
      );

      // 記錄寫入操作
      firebaseWriteMonitor.logWrite('addDoc', 'friendInvitations', docRef.id);

      console.log('✅ 邀請已發送，文檔ID:', docRef.id);
      setSuccess(t('community.messages.inviteSent'));

      // 立即驗證邀請是否真的被創建
      try {
        const verifyDoc = await getDoc(docRef);
        if (verifyDoc.exists()) {
          console.log('✅ 邀請驗證成功:', verifyDoc.data());
        } else {
          console.error('❌ 邀請驗證失敗：文檔不存在');
        }
      } catch (verifyError) {
        console.error('❌ 邀請驗證失敗:', verifyError);
      }

      // 更新搜尋結果狀態
      setSearchResults(prev =>
        prev.map(user =>
          user.id === toUserId ? { ...user, hasPendingRequest: true } : user
        )
      );

      // 延遲重新載入邀請列表，確保資料已寫入
      setTimeout(() => {
        loadFriendRequests();
      }, 1000);
    } catch (error) {
      console.error('發送好友邀請失敗:', error);
      setError(t('community.messages.inviteSendFail'));
    } finally {
      setLoading(false);
    }
  };

  // 接受好友邀請
  const acceptFriendRequest = async (requestId, fromUserId) => {
    try {
      setLoading(true);

      // 1. 更新原邀請狀態為已接受
      await updateDoc(doc(db, 'friendInvitations', requestId), {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      });

      // 記錄寫入操作
      firebaseWriteMonitor.logWrite(
        'updateDoc',
        'friendInvitations',
        requestId
      );

      // 2. 更新當前用戶的好友列表
      const currentUserRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(currentUserRef, {
        friends: arrayUnion(fromUserId),
      });

      // 記錄寫入操作
      firebaseWriteMonitor.logWrite(
        'updateDoc',
        'users',
        auth.currentUser.uid,
        { friends: 'arrayUnion' }
      );

      // 3. 更新本地狀態
      setUserData(prev => ({
        ...prev,
        friends: [...(prev.friends || []), fromUserId],
      }));

      // 4. 重新載入好友數據
      await loadFriendsData();
      await loadFriendRequests();

      setSuccess(t('community.messages.inviteAccepted'));
    } catch (error) {
      console.error('接受好友邀請失敗:', error);
      setError(`${t('community.messages.inviteAcceptFail')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 拒絕好友邀請
  const declineFriendRequest = async requestId => {
    try {
      setLoading(true);

      await updateDoc(doc(db, 'friendInvitations', requestId), {
        status: 'declined',
        declinedAt: new Date().toISOString(),
      });

      // 記錄寫入操作
      firebaseWriteMonitor.logWrite(
        'updateDoc',
        'friendInvitations',
        requestId
      );

      await loadFriendRequests();
      setSuccess(t('community.messages.inviteRejected'));
    } catch (error) {
      console.error('拒絕好友邀請失敗:', error);
      setError(`${t('community.messages.inviteRejectFail')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 跳轉到好友個人版
  const goToFriendBoard = friendId => {
    if (!friendId) {
      console.error('好友ID為空');
      return;
    }

    const friend = friendsList.find(f => f.id === friendId);
    if (friend) {
      console.log('🔄 跳轉到好友個人版:', friendId, friend.nickname);
      // 使用 React Router 跳轉到好友的個人版（動態牆）
      navigate(`/friend-feed/${friendId}`);
    } else {
      console.error('找不到好友:', friendId);
      console.log('當前好友列表:', friendsList);
    }
  };

  // 移除好友
  const removeFriend = async friendId => {
    // 找到要移除的好友資料
    const friendToRemove = friendsList.find(friend => friend.id === friendId);
    const friendName = friendToRemove?.nickname || '好友';

    // 顯示確認對話框（第一層）
    const isConfirmed = window.confirm(
      `確定要移除好友「${friendName}」嗎？\n\n移除後：\n• 雙方將不再是好友關係\n• 無法查看對方的動態\n• 此操作可以重新加好友來恢復`
    );

    if (!isConfirmed) {
      return;
    }

    // Double Check（第二層確認）
    const doubleConfirmed = window.confirm(
      `最後確認：確定要移除好友「${friendName}」嗎？此操作將立即生效。`
    );
    if (!doubleConfirmed) {
      return;
    }

    try {
      setLoading(true);

      // 1. 更新當前用戶的好友列表
      const currentUserRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(currentUserRef, {
        friends: arrayRemove(friendId),
      });

      // 2. 將所有相關的邀請狀態更新為已取消
      const relatedInvitations = await getDocs(
        query(
          collection(db, 'friendInvitations'),
          where('fromUserId', 'in', [auth.currentUser.uid, friendId]),
          where('toUserId', 'in', [auth.currentUser.uid, friendId])
        )
      );

      // 批量更新邀請狀態
      const updatePromises = relatedInvitations.docs.map(doc =>
        updateDoc(doc.ref, {
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
        })
      );
      await Promise.all(updatePromises);

      // 3. 更新本地狀態
      setUserData(prev => ({
        ...prev,
        friends: prev.friends?.filter(id => id !== friendId) || [],
      }));

      setFriendsList(prev => prev.filter(friend => friend.id !== friendId));

      setSuccess(`已移除好友「${friendName}」`);
    } catch (error) {
      console.error('移除好友失敗:', error);
      setError(`移除好友失敗: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 初始載入
  useEffect(() => {
    try {
      // 頁面初始化時載入動態牆數據和好友數據
      // 先載入動態，再載入好友數據
      loadPosts();
      loadFriendsData();
      loadFriendRequests();
    } catch (error) {
      console.error('初始載入失敗:', error);
      setError('載入數據失敗，請稍後再試');
    }

    // 組件卸載時清理計時器
    return () => {
      const timers = commentDebounceTimers.current;
      if (timers) {
        timers.forEach(timer => clearTimeout(timer));
        timers.clear();
      }
    };
  }, [loadPosts, loadFriendsData, loadFriendRequests]);

  // 標籤切換時的載入（備用載入機制）
  useEffect(() => {
    try {
      // 如果初始載入失敗，在切換標籤時重試
      if (activeTab === 'friends' && !hasLoadedFriendsRef.current) {
        console.log('🔄 標籤切換時重新載入好友數據');
        loadFriendsData();
      } else if (activeTab === 'requests' && !hasLoadedRequestsRef.current) {
        console.log('🔄 標籤切換時重新載入邀請數據');
        loadFriendRequests();
      }
    } catch (error) {
      console.error('標籤切換載入失敗:', error);
      setError('載入數據失敗，請稍後再試');
    }
  }, [activeTab, loadFriendsData, loadFriendRequests]);

  return (
    <div className="community-page">
      <div className="community-header">
        <h1>🏠 肉體樂園</h1>

        {/* 狀態訊息 */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
      </div>

      {/* 錯誤邊界 - 如果出現嚴重錯誤，顯示錯誤信息 */}
      {!friendsList && (
        <div className="alert alert-error">
          載入好友列表時出現錯誤，請刷新頁面重試
        </div>
      )}

      {/* 標籤導航 */}
      <div className="tab-navigation">
        {/* 載入狀態提示 */}
        {!hasLoadedFriendsRef.current && (
          <div className="loading-indicator">正在載入好友數據...</div>
        )}
        <div
          className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <span className="tab-label">{t('community.tabs.feed')}</span>
        </div>
        <div
          className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <span className="tab-label">
            {t('community.tabs.friends')} (
            {!hasLoadedFriendsRef.current ? '...' : friendsList.length})
          </span>
        </div>
        <div
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <span className="tab-label">{t('community.tabs.invites')}</span>
          {friendRequests.length > 0 && (
            <span className="notification-badge">{friendRequests.length}</span>
          )}
        </div>
        <div
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <span className="tab-label">{t('community.tabs.search')}</span>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="tab-content">
        {loading && <div className="loading">載入中...</div>}

        {/* 重試按鈕 */}
        {error && !loading && (
          <div className="alert alert-error">
            {error}
            <button
              onClick={() => {
                hasLoadedPostsRef.current = false;
                hasLoadedFriendsRef.current = false;
                hasLoadedRequestsRef.current = false;
                postsCacheRef.current.clear();
                lastLoadTimeRef.current = 0;
                setError('');
                loadPosts();
                loadFriendsData();
                loadFriendRequests();
              }}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              重試
            </button>
          </div>
        )}

        {/* 手動刷新按鈕 - 只在動態牆分頁顯示 */}
        {!error && !loading && activeTab === 'feed' && (
          <div className="refresh-section">
            <button
              onClick={() => {
                hasLoadedPostsRef.current = false;
                hasLoadedFriendsRef.current = false;
                postsCacheRef.current.clear();
                lastLoadTimeRef.current = 0;
                loadFriendsData();
                loadPosts();
              }}
              style={{
                padding: '8px 16px',
                background: 'var(--tiffany-secondary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '10px',
              }}
            >
              🔄 {t('community.refresh')}
            </button>
          </div>
        )}

        {activeTab === 'feed' && (
          <>
            {/* 發布動態區域 */}
            <div className="post-composer">
              <div className="composer-header">
                <div className="user-avatar">
                  <img
                    src={(() => {
                      const isGuest =
                        sessionStorage.getItem('guestMode') === 'true';
                      return isGuest
                        ? '/guest-avatar.svg'
                        : userData?.avatarUrl || '/default-avatar.svg';
                    })()}
                    alt={t('community.ui.avatarAlt')}
                    loading="lazy"
                    onError={e => {
                      e.target.src = '/default-avatar.svg';
                    }}
                  />
                </div>
                <div className="composer-input">
                  <textarea
                    placeholder={t('community.sharePlaceholder')}
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    maxLength={500}
                    disabled={submitting}
                  />
                  <div className="composer-footer">
                    <span className="char-count">
                      {newPostContent.length}/500
                    </span>
                    <button
                      onClick={publishPost}
                      disabled={!newPostContent.trim() || submitting}
                      className="publish-btn"
                    >
                      {submitting
                        ? t('community.publishing')
                        : t('community.publish')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 動態列表 */}
            <div className="posts-container">
              {posts.length === 0 ? (
                <div className="empty-state">
                  <p>{t('community.emptyFeed.title')}</p>
                  <p>{t('community.emptyFeed.subtitle')}</p>
                </div>
              ) : (
                posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={auth.currentUser?.uid}
                    onToggleLike={toggleLike}
                    onAddComment={addComment}
                    onDeleteComment={deleteComment}
                    onDeletePost={deletePost}
                    onLoadComments={loadComments} // 傳遞載入評論的回調
                    formatTime={formatTime}
                    likeProcessing={likeProcessing}
                    commentProcessing={commentProcessing}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'friends' && (
          <div className="friends-tab">
            {!friendsList || friendsList.length === 0 ? (
              <div className="empty-state">
                <p>{t('community.noFriends')}</p>
                <p>{t('community.goSearchFriends')}</p>
              </div>
            ) : (
              <div className="friends-list">
                {friendsList
                  .filter(friend => friend && friend.id)
                  .map(friend => (
                    <div key={friend.id || 'unknown'} className="friend-item">
                      <div className="friend-info">
                        <img
                          src={friend.avatarUrl || '/default-avatar.svg'}
                          alt={t('community.ui.avatarAlt')}
                          className="friend-avatar"
                          loading="lazy"
                          onError={e => {
                            e.target.src = '/default-avatar.svg';
                          }}
                        />
                        <div className="friend-details">
                          <div className="friend-name">
                            {friend.nickname ||
                              t('community.fallback.unnamedUser')}
                          </div>
                          <div className="friend-score">
                            {friend.averageScore ? (
                              <>
                                <span className="score-value">
                                  🏆 {friend.averageScore}
                                  {t('community.ui.pointsUnit')}
                                </span>
                              </>
                            ) : (
                              <span className="no-score">
                                {t('community.ui.noScore')}
                              </span>
                            )}
                          </div>
                          <div className="friend-email">
                            {friend.email || ''}
                          </div>
                        </div>
                      </div>
                      <div className="friend-actions">
                        <button
                          className="btn-board"
                          onClick={() =>
                            friend.id && goToFriendBoard(friend.id)
                          }
                          title={t('community.ui.boardTitle')}
                        >
                          💬
                        </button>
                        <button
                          className="btn-remove"
                          onClick={() => friend.id && removeFriend(friend.id)}
                          title={t('community.friend.remove')}
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="requests-tab">
            {friendRequests.length === 0 ? (
              <div className="empty-state">
                <p>{t('community.invites.empty')}</p>
              </div>
            ) : (
              <div className="requests-list">
                {friendRequests.map(request => (
                  <div key={request.id} className="request-item">
                    <div className="request-info">
                      <img
                        src={request.avatarUrl || '/default-avatar.svg'}
                        alt={t('community.ui.avatarAlt')}
                        className="request-avatar"
                        loading="lazy"
                        onError={e => {
                          e.target.src = '/default-avatar.svg';
                        }}
                      />
                      <div className="request-details">
                        <div className="request-name">{request.nickname}</div>
                        <div className="request-email">{request.email}</div>
                      </div>
                    </div>
                    <div className="request-actions">
                      <button
                        className="btn-accept"
                        onClick={() =>
                          acceptFriendRequest(request.id, request.fromUserId)
                        }
                        title={t('community.invites.accept')}
                      >
                        ✅
                      </button>
                      <button
                        className="btn-decline"
                        onClick={() => declineFriendRequest(request.id)}
                        title={t('community.invites.reject')}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="search-tab">
            <div className="search-container">
              <input
                type="text"
                placeholder={t('community.search.placeholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="search-input"
              />
              <button onClick={handleSearch} className="search-btn">
                {t('common.search')}
              </button>
            </div>

            <div className="search-results">
              {searchResults.length === 0 && searchQuery.trim() ? (
                <div className="empty-state">
                  <p>{t('community.search.empty')}</p>
                </div>
              ) : (
                searchResults.map(user => (
                  <div key={user.id} className="user-item">
                    <div className="user-info">
                      <img
                        src={user.avatarUrl || '/default-avatar.svg'}
                        alt={t('community.ui.avatarAlt')}
                        className="user-avatar"
                        loading="lazy"
                        onError={e => {
                          e.target.src = '/default-avatar.svg';
                        }}
                      />
                      <div className="user-details">
                        <div className="user-name">{user.nickname}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="user-actions">
                      {user.isFriend ? (
                        <span className="status-badge">
                          {t('community.friend.badgeFriend')}
                        </span>
                      ) : user.hasPendingRequest ? (
                        <span className="status-badge">
                          {t('community.friend.badgeInvited')}
                        </span>
                      ) : (
                        <button
                          className="btn-add"
                          onClick={() => sendFriendRequest(user.id)}
                          disabled={loading}
                          title={t('community.friend.add')}
                        >
                          {t('community.friend.add')}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 動態卡片組件 - 使用 React.memo 優化
const PostCard = React.memo(
  ({
    post,
    currentUserId,
    onToggleLike,
    onAddComment,
    onDeleteComment,
    onDeletePost,
    onLoadComments, // 新增：按需載入評論的回調
    formatTime,
    likeProcessing,
    commentProcessing,
  }) => {
    const { t } = useTranslation();
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false); // 新增：圖片載入狀態
    const [commentsLoaded, setCommentsLoaded] = useState(false); // 新增：評論載入狀態

    const isLiked = post.likes.includes(currentUserId);
    const likeCount = post.likes.length;
    const commentCount = post.commentCount || post.comments.length; // 使用 commentCount 或實際評論數量

    // 新增：處理評論顯示/隱藏，按需載入
    const handleToggleComments = () => {
      const newShowComments = !showComments;
      setShowComments(newShowComments);

      // 如果顯示評論且評論未載入，則載入評論
      if (newShowComments && !commentsLoaded && onLoadComments) {
        onLoadComments(post.id);
        setCommentsLoaded(true);
      }
    };

    const handleAddComment = () => {
      if (newComment.trim()) {
        onAddComment(post.id, newComment);
        setNewComment('');
      }
    };

    return (
      <div className="post-card">
        {/* 用戶資訊 */}
        <div className="post-header">
          <div className="post-user">
            <img
              src={post.userAvatarUrl || '/default-avatar.svg'}
              alt={t('community.ui.avatarAlt')}
              className="user-avatar"
              loading="lazy" // 新增：懶載入
              onLoad={() => setImageLoaded(true)} // 新增：圖片載入完成
              onError={e => {
                e.target.src = '/default-avatar.svg';
                setImageLoaded(true);
              }}
              style={{
                opacity: imageLoaded ? 1 : 0.5, // 新增：載入時的視覺效果
                transition: 'opacity 0.3s ease',
              }}
            />
            <div className="user-info">
              <div className="user-name">
                {post.userNickname}
                {post.targetUserId && (
                  <span className="to-label">
                    {' '}
                    →{' '}
                    {post.targetUserNickname ||
                      t('community.friend.badgeFriend')}
                  </span>
                )}
              </div>
              <div className="post-time">{formatTime(post.timestamp)}</div>
            </div>
          </div>
          {/* 刪除按鈕 - 只有動態作者可以看到 */}
          {post.userId === currentUserId && (
            <button
              onClick={() => onDeletePost(post.id)}
              className="delete-post-btn"
              title={t('community.titles.deletePost')}
            >
              🗑️
            </button>
          )}
        </div>

        {/* 動態內容 */}
        <div className="post-content">{post.content}</div>

        {/* 互動按鈕 */}
        <div className="post-actions">
          <button
            onClick={() => onToggleLike(post.id, post.likes)}
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            disabled={likeProcessing.has(post.id)}
          >
            <span className="action-icon">
              {likeProcessing.has(post.id) ? '⏳' : '👍'}
            </span>
            <span className="action-text">
              {likeProcessing.has(post.id)
                ? t('community.processing')
                : `${likeCount > 0 ? likeCount : ''} ${t('community.like')}`}
            </span>
          </button>

          <button
            onClick={handleToggleComments} // 修改：使用新的處理函數
            className="action-btn"
          >
            <span className="action-icon">💬</span>
            <span className="action-text">
              {commentCount > 0 ? commentCount : ''} {t('community.comment')}
            </span>
          </button>
        </div>

        {/* 留言區域 */}
        {showComments && (
          <div className="comments-section">
            {/* 留言列表 */}
            {post.comments.length > 0 && (
              <div className="comments-list">
                {post.comments.map(comment => {
                  const isPostOwner = post.userId === currentUserId;
                  const isCommentOwner = comment.userId === currentUserId;
                  const canDelete = isPostOwner || isCommentOwner;

                  return (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <div className="comment-user-info">
                          <img
                            src={comment.userAvatarUrl || '/guest-avatar.svg'}
                            alt={t('community.ui.avatarAlt')}
                            className="comment-avatar"
                            onError={e => {
                              e.target.src = '/guest-avatar.svg';
                            }}
                          />
                          <div className="comment-text-info">
                            <div className="comment-name">
                              {comment.userNickname}
                            </div>
                            <div className="comment-time">
                              {formatTime(comment.timestamp)}
                            </div>
                          </div>
                        </div>
                        {canDelete && (
                          <button
                            onClick={() => onDeleteComment(post.id, comment.id)}
                            className="comment-delete-btn"
                            title={
                              isPostOwner
                                ? t('community.titles.deleteComment')
                                : t('community.titles.deleteMyComment')
                            }
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <div className="comment-content">{comment.content}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 添加留言 */}
            <div className="comment-input">
              <input
                type="text"
                placeholder={t('community.writeComment')}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    handleAddComment();
                  }
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || commentProcessing.has(post.id)}
                className="comment-btn"
              >
                {commentProcessing.has(post.id)
                  ? t('community.sending')
                  : t('community.send')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    userNickname: PropTypes.string.isRequired,
    userAvatarUrl: PropTypes.string,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.any.isRequired,
    likes: PropTypes.array.isRequired,
    comments: PropTypes.array.isRequired,
  }).isRequired,
  currentUserId: PropTypes.string.isRequired,
  onToggleLike: PropTypes.func.isRequired,
  onAddComment: PropTypes.func.isRequired,
  onDeleteComment: PropTypes.func.isRequired,
  onDeletePost: PropTypes.func.isRequired,
  onLoadComments: PropTypes.func.isRequired, // 新增：添加 propTypes
  formatTime: PropTypes.func.isRequired,
  likeProcessing: PropTypes.instanceOf(Set).isRequired,
  commentProcessing: PropTypes.instanceOf(Set).isRequired,
};

export default Community;
