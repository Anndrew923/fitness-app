import { useState, useEffect, useCallback, useRef } from 'react';
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

const Community = () => {
  const { userData, setUserData } = useUser();
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
  const pendingComments = useRef(new Map());

  // 追蹤載入狀態，避免重複載入
  const hasLoadedFriendsRef = useRef(false);
  const hasLoadedPostsRef = useRef(false);
  const hasLoadedRequestsRef = useRef(false);

  // 載入動態
  const loadPosts = useCallback(async () => {
    try {
      // 檢查是否已經載入過
      if (hasLoadedPostsRef.current) {
        return;
      }

      setLoading(true);
      console.log('🔄 開始載入社群動態...');

      // 獲取好友的用戶ID列表
      const friendIds = userData?.friends || [];
      const currentUserId = auth.currentUser?.uid;

      // 創建查詢：當前用戶 + 好友的動態
      const userIds = [currentUserId, ...friendIds].filter(Boolean);

      if (userIds.length === 0) {
        console.log('📝 沒有好友，只顯示自己的動態');
        setPosts([]);
        return;
      }

      // 查詢動態（限制為最近50條）
      const postsQuery = query(
        collection(db, 'communityPosts'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(postsQuery);
      const postsData = [];

      snapshot.forEach(doc => {
        const postData = doc.data();
        // 只顯示當前用戶和好友的動態
        if (userIds.includes(postData.userId)) {
          postsData.push({
            id: doc.id,
            ...postData,
          });
        }
      });

      console.log(`📊 載入到 ${postsData.length} 條動態`);
      setPosts(postsData);

      // 標記已載入
      hasLoadedPostsRef.current = true;
    } catch (error) {
      console.error('❌ 載入動態失敗:', error);
      setError('載入動態失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [userData?.friends]);

  // 發布新動態
  const publishPost = async () => {
    if (!newPostContent.trim()) {
      setError('請輸入動態內容');
      return;
    }

    if (!auth.currentUser) {
      setError('請先登入');
      return;
    }

    try {
      setSubmitting(true);
      console.log('📝 準備發布動態...');

      const postData = {
        userId: auth.currentUser.uid,
        userNickname:
          userData?.nickname || userData?.email?.split('@')[0] || '匿名用戶',
        userAvatarUrl: (() => {
          const isGuest = sessionStorage.getItem('guestMode') === 'true';
          return isGuest ? '/guest-avatar.svg' : userData?.avatarUrl || '';
        })(),
        content: newPostContent.trim(),
        type: 'status', // 一般動態
        likes: [],
        comments: [],
        timestamp: new Date().toISOString(),
        privacy: 'friends', // 好友可見
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
      setSuccess('動態發布成功！');

      // 3秒後清除成功訊息
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ 發布動態失敗:', error);
      setError('發布失敗: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 點讚/取消點讚 - 優化版本（使用樂觀更新）
  const toggleLike = async (postId, currentLikes) => {
    if (!auth.currentUser) {
      setError('請先登入');
      return;
    }

    // 防抖：避免重複點擊
    if (likeProcessing.has(postId)) {
      console.log('🔄 點讚操作進行中，請稍候...');
      return;
    }

    const currentUserId = auth.currentUser.uid;
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
      setError('點讚失敗，請稍後再試');

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
  };

  // 添加留言 - 優化版本（使用防抖 + 批量操作）
  const addComment = async (postId, commentContent) => {
    if (!commentContent.trim()) return;
    if (!auth.currentUser) {
      setError('請先登入');
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
        userData?.nickname || userData?.email?.split('@')[0] || '匿名用戶',
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

    // 設置新的防抖計時器（500ms）
    const timer = setTimeout(async () => {
      try {
        // 找到對應的動態
        const currentPost = posts.find(post => post.id === postId);
        if (!currentPost) {
          setError('動態不存在');
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
        setError('留言失敗，請稍後再試');

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
  };

  // 刪除留言
  const deleteComment = async (postId, commentId) => {
    if (!auth.currentUser) {
      setError('請先登入');
      return;
    }

    try {
      // 找到對應的動態
      const currentPost = posts.find(post => post.id === postId);
      if (!currentPost) {
        setError('動態不存在');
        return;
      }

      // 找到要刪除的留言
      const commentToDelete = currentPost.comments.find(
        comment => comment.id === commentId
      );
      if (!commentToDelete) {
        setError('留言不存在');
        return;
      }

      // 檢查刪除權限
      const currentUserId = auth.currentUser.uid;
      const isPostOwner = currentPost.userId === currentUserId;
      const isCommentOwner = commentToDelete.userId === currentUserId;

      if (!isPostOwner && !isCommentOwner) {
        setError('您沒有權限刪除此留言');
        return;
      }

      // 確認刪除
      const confirmMessage = isPostOwner
        ? '確定要刪除此留言嗎？'
        : '確定要刪除您的留言嗎？';

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

      setSuccess('留言已刪除');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ 刪除留言失敗:', error);
      setError('刪除留言失敗，請稍後再試');
    }
  };

  // 刪除動態（主要留言）
  const deletePost = async postId => {
    if (!auth.currentUser) {
      setError('請先登入');
      return;
    }

    try {
      // 找到對應的動態
      const currentPost = posts.find(post => post.id === postId);
      if (!currentPost) {
        setError('動態不存在');
        return;
      }

      // 檢查刪除權限（只有動態作者可以刪除）
      const currentUserId = auth.currentUser.uid;
      if (currentPost.userId !== currentUserId) {
        setError('您沒有權限刪除此動態');
        return;
      }

      // 確認刪除
      if (!window.confirm('確定要刪除此動態嗎？此操作無法撤銷。')) {
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

      setSuccess('動態已刪除');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ 刪除動態失敗:', error);
      setError('刪除動態失敗，請稍後再試');
    }
  };

  // 格式化時間
  const formatTime = timestamp => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now - postTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '剛剛';
    if (diffMins < 60) return `${diffMins}分鐘前`;
    if (diffHours < 24) return `${diffHours}小時前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return postTime.toLocaleDateString();
  };

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
                averageScore > 0 ? Number(averageScore).toFixed(1) : null,
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

      if (process.env.NODE_ENV === 'development') {
        console.log('好友列表載入完成:', validFriendsData);
      }

      // 標記已載入
      hasLoadedFriendsRef.current = true;
    } catch (error) {
      console.error('載入好友數據失敗:', error);
      setError('載入好友數據失敗，請稍後再試');
      // 即使載入失敗也要標記為已嘗試載入，避免無限重試
      hasLoadedFriendsRef.current = true;
    } finally {
      setLoading(false);
    }
  }, []);

  // 載入好友邀請
  const loadFriendRequests = useCallback(async () => {
    try {
      const requestsQuery = query(
        collection(db, 'friendInvitations'),
        where('toUserId', '==', auth.currentUser.uid),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(requestsQuery);
      const requests = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        try {
          const userDoc = await getDoc(doc(db, 'users', data.fromUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            requests.push({
              id: doc.id,
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

      setFriendRequests(requests);
      // 標記已載入
      hasLoadedRequestsRef.current = true;
    } catch (error) {
      console.error('載入好友邀請失敗:', error);
      // 即使載入失敗也要標記為已嘗試載入
      hasLoadedRequestsRef.current = true;
    }
  }, []);

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
      setError('搜尋失敗');
    } finally {
      setLoading(false);
    }
  };

  // 發送好友邀請
  const sendFriendRequest = async toUserId => {
    try {
      setLoading(true);

      // 檢查是否已經發送過邀請
      const existingQuery = query(
        collection(db, 'friendInvitations'),
        where('fromUserId', '==', auth.currentUser.uid),
        where('toUserId', '==', toUserId)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        setError('已經發送過好友邀請');
        return;
      }

      // 發送邀請
      const docRef = await addDoc(collection(db, 'friendInvitations'), {
        fromUserId: auth.currentUser.uid,
        toUserId: toUserId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // 記錄寫入操作
      firebaseWriteMonitor.logWrite('addDoc', 'friendInvitations', docRef.id);

      setSuccess('好友邀請已發送');

      // 更新搜尋結果狀態
      setSearchResults(prev =>
        prev.map(user =>
          user.id === toUserId ? { ...user, hasPendingRequest: true } : user
        )
      );
    } catch (error) {
      console.error('發送好友邀請失敗:', error);
      setError('發送邀請失敗');
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

      setSuccess('已接受好友邀請');
    } catch (error) {
      console.error('接受好友邀請失敗:', error);
      setError('接受邀請失敗: ' + error.message);
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
      setSuccess('已拒絕好友邀請');
    } catch (error) {
      console.error('拒絕好友邀請失敗:', error);
      setError('拒絕邀請失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 跳轉到好友個人版
  const navigate = useNavigate();

  const goToFriendBoard = friendId => {
    if (!friendId) {
      console.error('好友ID為空');
      return;
    }

    const friend = friendsList.find(f => f.id === friendId);
    if (friend) {
      // 使用 React Router 跳轉到好友的個人版（動態牆）
      navigate(`/friend-feed/${friendId}`);
    } else {
      console.error('找不到好友:', friendId);
    }
  };

  // 移除好友
  const removeFriend = async friendId => {
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
          where('toUserId', 'in', [auth.currentUser.uid, friendId]),
          where('status', '==', 'accepted')
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

      setSuccess('已移除好友');
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
      loadPosts();
      loadFriendsData();
      loadFriendRequests();
    } catch (error) {
      console.error('初始載入失敗:', error);
      setError('載入數據失敗，請稍後再試');
    }

    // 組件卸載時清理計時器
    return () => {
      commentDebounceTimers.current.forEach(timer => clearTimeout(timer));
      commentDebounceTimers.current.clear();
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
        <h1>🏠 精神時光屋</h1>

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
          <span className="tab-label">動態牆</span>
        </div>
        <div
          className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <span className="tab-label">
            好友 ({!hasLoadedFriendsRef.current ? '...' : friendsList.length})
          </span>
        </div>
        <div
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <span className="tab-label">邀請通知</span>
          {friendRequests.length > 0 && (
            <span className="notification-badge">{friendRequests.length}</span>
          )}
        </div>
        <div
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <span className="tab-label">搜尋好友</span>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="tab-content">
        {loading && <div className="loading">載入中...</div>}

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
                        : userData?.avatarUrl || '/default-avatar.png';
                    })()}
                    alt="頭像"
                    onError={e => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </div>
                <div className="composer-input">
                  <textarea
                    placeholder="分享你的健身成果..."
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
                      {submitting ? '發布中...' : '發布'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 動態列表 */}
            <div className="posts-container">
              {posts.length === 0 ? (
                <div className="empty-state">
                  <p>還沒有動態</p>
                  <p>發布第一條動態吧！</p>
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
                <p>還沒有好友</p>
                <p>去搜尋好友吧！</p>
              </div>
            ) : (
              <div className="friends-list">
                {friendsList
                  .filter(friend => friend && friend.id)
                  .map(friend => (
                    <div key={friend.id || 'unknown'} className="friend-item">
                      <div className="friend-info">
                        <img
                          src={friend.avatarUrl || '/default-avatar.png'}
                          alt="頭像"
                          className="friend-avatar"
                          onError={e => {
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                        <div className="friend-details">
                          <div className="friend-name">
                            {friend.nickname || '未命名用戶'}
                          </div>
                          <div className="friend-score">
                            {friend.averageScore ? (
                              <>
                                <span className="score-value">
                                  🏆 {friend.averageScore}分
                                </span>
                              </>
                            ) : (
                              <span className="no-score">尚未評測</span>
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
                          title="查看留言板"
                        >
                          💬
                        </button>
                        <button
                          className="btn-remove"
                          onClick={() => friend.id && removeFriend(friend.id)}
                          title="移除好友"
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
                <p>沒有待處理的邀請</p>
              </div>
            ) : (
              <div className="requests-list">
                {friendRequests.map(request => (
                  <div key={request.id} className="request-item">
                    <div className="request-info">
                      <img
                        src={request.avatarUrl || '/default-avatar.png'}
                        alt="頭像"
                        className="request-avatar"
                        onError={e => {
                          e.target.src = '/default-avatar.png';
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
                      >
                        ✅ 接受
                      </button>
                      <button
                        className="btn-decline"
                        onClick={() => declineFriendRequest(request.id)}
                      >
                        ❌ 拒絕
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
                placeholder="搜尋暱稱或電子郵件..."
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
                搜尋
              </button>
            </div>

            <div className="search-results">
              {searchResults.length === 0 && searchQuery.trim() ? (
                <div className="empty-state">
                  <p>沒有找到相關用戶</p>
                </div>
              ) : (
                searchResults.map(user => (
                  <div key={user.id} className="user-item">
                    <div className="user-info">
                      <img
                        src={user.avatarUrl || '/default-avatar.png'}
                        alt="頭像"
                        className="user-avatar"
                        onError={e => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                      <div className="user-details">
                        <div className="user-name">{user.nickname}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="user-actions">
                      {user.isFriend ? (
                        <span className="status-badge">已是好友</span>
                      ) : user.hasPendingRequest ? (
                        <span className="status-badge">邀請已發送</span>
                      ) : (
                        <button
                          className="btn-add"
                          onClick={() => sendFriendRequest(user.id)}
                          disabled={loading}
                        >
                          加好友
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

// 動態卡片組件
const PostCard = ({
  post,
  currentUserId,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onDeletePost,
  formatTime,
  likeProcessing,
  commentProcessing,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const isLiked = post.likes.includes(currentUserId);
  const likeCount = post.likes.length;
  const commentCount = post.comments.length;

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
            src={post.userAvatarUrl || '/default-avatar.png'}
            alt="頭像"
            className="user-avatar"
            onError={e => {
              e.target.src = '/default-avatar.png';
            }}
          />
          <div className="user-info">
            <div className="user-name">{post.userNickname}</div>
            <div className="post-time">{formatTime(post.timestamp)}</div>
          </div>
        </div>
        {/* 刪除按鈕 - 只有動態作者可以看到 */}
        {post.userId === currentUserId && (
          <button
            onClick={() => onDeletePost(post.id)}
            className="delete-post-btn"
            title="刪除此動態"
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
              ? '處理中...'
              : `${likeCount > 0 ? likeCount : ''} 讚`}
          </span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="action-btn"
        >
          <span className="action-icon">💬</span>
          <span className="action-text">
            {commentCount > 0 ? commentCount : ''} 留言
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
                          src="/default-avatar.png"
                          alt="頭像"
                          className="comment-avatar"
                          onError={e => {
                            e.target.src = '/default-avatar.png';
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
                          title={isPostOwner ? '刪除此留言' : '刪除我的留言'}
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
              placeholder="寫留言..."
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
              {commentProcessing.has(post.id) ? '發送中...' : '發送'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
