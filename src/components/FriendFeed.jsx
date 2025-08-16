import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../UserContext';
import { auth, db } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  where,
  deleteDoc,
} from 'firebase/firestore';
import firebaseWriteMonitor from '../utils/firebaseMonitor';
import './FriendFeed.css';
import PropTypes from 'prop-types';

const FriendFeed = () => {
  const { userData } = useUser();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [friendData, setFriendData] = useState(null);

  // 防抖狀態
  const [likeProcessing, setLikeProcessing] = useState(new Set());
  const [commentProcessing, setCommentProcessing] = useState(new Set());

  // 留言防抖計時器
  const commentDebounceTimers = useRef(new Map());

  // 追蹤載入狀態
  const hasLoadedPostsRef = useRef(false);

  // 載入好友資料
  const loadFriendData = useCallback(async () => {
    try {
      if (!userId) {
        setError('用戶ID為空');
        return;
      }

      console.log('🔄 開始載入用戶資料:', userId);
      console.log('🔄 當前登入用戶:', auth.currentUser?.uid);

      const userDocRef = doc(db, 'users', userId);
      console.log('🔄 查詢文檔路徑:', userDocRef.path);

      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ 用戶資料:', userData);
        setFriendData({
          id: userDoc.id,
          ...userData,
        });
        console.log(
          '✅ 好友資料載入成功:',
          userData.nickname || userData.email
        );
      } else {
        console.error('❌ 找不到用戶:', userId);
        console.error('❌ 文檔路徑:', userDocRef.path);
        setError('找不到該用戶');
      }
    } catch (error) {
      console.error('載入好友資料失敗:', error);
      console.error('錯誤詳情:', {
        code: error.code,
        message: error.message,
        userId: userId,
      });
      setError('載入用戶資料失敗');
    }
  }, [userId]);

  // 載入好友的動態
  const loadPosts = useCallback(async () => {
    try {
      if (hasLoadedPostsRef.current) {
        return;
      }

      setLoading(true);
      console.log('🔄 開始載入好友動態...');

      // 只顯示：
      // 1) 該用戶自己發布且 privacy 為 friends（或未設置）的動態
      // 2) 發給該用戶的目標留言
      const userPostsQuery = query(
        collection(db, 'communityPosts'),
        where('userId', '==', userId),
        limit(50)
      );

      const targetUserPostsQuery = query(
        collection(db, 'communityPosts'),
        where('targetUserId', '==', userId),
        limit(50)
      );

      // 簡化查詢，避免索引問題
      let userSnapshot, targetUserSnapshot;

      try {
        // 先嘗試查詢用戶發布的動態
        userSnapshot = await getDocs(userPostsQuery);
        console.log('✅ 用戶動態查詢成功');
      } catch (queryError) {
        console.warn('查詢用戶動態失敗，使用空結果:', queryError);
        userSnapshot = { docs: [] };
      }

      try {
        // 再嘗試查詢發給該用戶的動態
        targetUserSnapshot = await getDocs(targetUserPostsQuery);
        console.log('✅ 目標用戶動態查詢成功');
      } catch (queryError) {
        console.warn('查詢目標用戶動態失敗，使用空結果:', queryError);
        targetUserSnapshot = { docs: [] };
      }

      const postsData = [];

      // 處理用戶發布的動態
      if (userSnapshot && userSnapshot.docs) {
        userSnapshot.docs.forEach(doc => {
          const postData = doc.data();

          // 處理留言的頭像資訊
          if (postData.comments && postData.comments.length > 0) {
            console.log(
              `🔍 處理好友動態 ${doc.id} 的 ${postData.comments.length} 條留言`
            );
            postData.comments = postData.comments.map(comment => {
              // 如果留言沒有 userAvatarUrl，使用預設頭像
              if (!comment.userAvatarUrl) {
                console.log(`📝 好友留言 ${comment.id} 缺少頭像，使用預設頭像`);
                return {
                  ...comment,
                  userAvatarUrl: '/guest-avatar.svg',
                };
              }
              console.log(
                `✅ 好友留言 ${comment.id} 已有頭像: ${comment.userAvatarUrl}`
              );
              return comment;
            });
          }

          // 僅保留好友可見或未設置隱私的貼文
          const privacy = postData.privacy || 'friends';
          if (privacy === 'friends') {
            postsData.push({
              id: doc.id,
              ...postData,
            });
          }
        });
      }

      // 處理發給該用戶的動態
      if (targetUserSnapshot && targetUserSnapshot.docs) {
        targetUserSnapshot.docs.forEach(doc => {
          const postData = doc.data();
          // 避免重複添加
          if (!postsData.find(p => p.id === doc.id)) {
            // 處理留言的頭像資訊
            if (postData.comments && postData.comments.length > 0) {
              console.log(
                `🔍 處理發給好友的動態 ${doc.id} 的 ${postData.comments.length} 條留言`
              );
              postData.comments = postData.comments.map(comment => {
                // 如果留言沒有 userAvatarUrl，使用預設頭像
                if (!comment.userAvatarUrl) {
                  console.log(
                    `📝 發給好友的留言 ${comment.id} 缺少頭像，使用預設頭像`
                  );
                  return {
                    ...comment,
                    userAvatarUrl: '/guest-avatar.svg',
                  };
                }
                console.log(
                  `✅ 發給好友的留言 ${comment.id} 已有頭像: ${comment.userAvatarUrl}`
                );
                return comment;
              });
            }

            // 目標留言一律顯示在好友頁
            postsData.push({
              id: doc.id,
              ...postData,
            });
          }
        });
      }

      // 按時間排序
      postsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log(`📊 載入到 ${postsData.length} 條動態`);

      // 收集缺少頭像的 userId
      const missingAvatarUserIds = new Set();
      postsData.forEach(p => {
        (p.comments || []).forEach(c => {
          if (!c.userAvatarUrl && c.userId) {
            missingAvatarUserIds.add(c.userId);
          }
        });
      });

      if (missingAvatarUserIds.size > 0) {
        const avatarMap = {};
        await Promise.all(
          Array.from(missingAvatarUserIds).map(async uid => {
            try {
              const userDoc = await getDoc(doc(db, 'users', uid));
              if (userDoc.exists()) {
                const data = userDoc.data();
                avatarMap[uid] = data.avatarUrl || '/guest-avatar.svg';
              } else {
                avatarMap[uid] = '/guest-avatar.svg';
              }
            } catch (err) {
              console.warn(`取得用戶 ${uid} 頭像失敗`, err);
              avatarMap[uid] = '/guest-avatar.svg';
            }
          })
        );

        // 填補缺少頭像的留言
        postsData.forEach(p => {
          (p.comments || []).forEach(c => {
            if (!c.userAvatarUrl && c.userId === p.userId) {
              c.userAvatarUrl = p.userAvatarUrl;
            }
            if (!c.userAvatarUrl && avatarMap[c.userId]) {
              c.userAvatarUrl = avatarMap[c.userId];
            }
          });
        });
      }

      // 最終更新狀態
      setPosts([...postsData]);

      // 標記已載入
      hasLoadedPostsRef.current = true;
    } catch (error) {
      console.error('❌ 載入動態失敗:', error);
      // 動態載入失敗不影響整個頁面，只顯示空狀態
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
        targetUserId: userId, // 發給特定好友
      };

      const docRef = await addDoc(collection(db, 'communityPosts'), postData);

      // 記錄寫入操作
      firebaseWriteMonitor.logWrite('addDoc', 'communityPosts', docRef.id);

      console.log('✅ 動態發布成功，ID:', docRef.id);

      // 清空輸入框
      setNewPostContent('');
      setSuccess('動態發布成功！');

      // 重新載入動態
      await loadPosts();

      // 3秒後清除成功訊息
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ 發布動態失敗:', error);
      setError('發布失敗: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 點讚/取消點讚
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

    try {
      // 設置處理狀態
      setLikeProcessing(prev => new Set(prev).add(postId));

      const currentUserId = auth.currentUser.uid;
      const isLiked = currentLikes.includes(currentUserId);

      // 計算新的點讚列表
      const newLikes = isLiked
        ? currentLikes.filter(id => id !== currentUserId)
        : [...currentLikes, currentUserId];

      // 使用 setDoc 替代 updateDoc，減少讀取操作
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, { likes: newLikes });

      // 記錄寫入操作
      firebaseWriteMonitor.logWrite('updateDoc', 'communityPosts', postId, {
        likes: `更新為 ${newLikes.length} 個點讚`,
      });

      // 更新本地狀態
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

      console.log(`👍 ${isLiked ? '取消點讚' : '點讚'}成功`);
    } catch (error) {
      console.error('❌ 點讚操作失敗:', error);
      setError('操作失敗，請稍後再試');
    } finally {
      // 清除處理狀態
      setLikeProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // 添加留言
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
          setError('動態不存在');
          return;
        }

        // 計算新的留言列表
        const newComments = [...currentPost.comments, comment];

        // 使用 updateDoc
        const postRef = doc(db, 'communityPosts', postId);
        await updateDoc(postRef, { comments: newComments });

        // 記錄寫入操作
        firebaseWriteMonitor.logWrite('updateDoc', 'communityPosts', postId, {
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
      await updateDoc(postRef, { comments: newComments });

      // 記錄寫入操作
      firebaseWriteMonitor.logWrite('updateDoc', 'communityPosts', postId, {
        comments: `刪除留言，總計 ${newComments.length} 條`,
      });

      // 更新本地狀態
      setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post =>
          post.id === postId ? { ...post, comments: newComments } : post
        );
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
  const formatTime = useCallback(timestamp => {
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
  }, []);

  // 動態卡片組件 - 使用 React.memo 優化
  const PostCard = React.memo(
    ({
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
                src={post.userAvatarUrl || '/default-avatar.svg'}
                alt="頭像"
                className="user-avatar"
                loading="lazy"
                onError={e => {
                  e.target.src = '/default-avatar.svg';
                }}
              />
              <div className="user-info">
                <div className="user-name">
                  {post.userNickname}
                  {post.targetUserId && (
                    <span className="to-label">
                      {' '}
                      → {friendData?.nickname || '好友'}
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
                              src={comment.userAvatarUrl || '/guest-avatar.svg'}
                              alt="頭像"
                              className="comment-avatar"
                              loading="lazy"
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
                              onClick={() =>
                                onDeleteComment(post.id, comment.id)
                              }
                              className="comment-delete-btn"
                              title={
                                isPostOwner ? '刪除此留言' : '刪除我的留言'
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
                  disabled={
                    !newComment.trim() || commentProcessing.has(post.id)
                  }
                  className="comment-btn"
                >
                  {commentProcessing.has(post.id) ? '發送中...' : '發送'}
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
    formatTime: PropTypes.func.isRequired,
    likeProcessing: PropTypes.instanceOf(Set).isRequired,
    commentProcessing: PropTypes.instanceOf(Set).isRequired,
  };

  // 初始載入
  useEffect(() => {
    // 檢查用戶是否已登入
    if (!auth.currentUser) {
      console.error('❌ 用戶未登入');
      setError('請先登入');
      return;
    }

    console.log('🔄 開始載入好友頁面數據...');
    console.log('🔄 目標用戶ID:', userId);

    // 重置載入狀態
    hasLoadedPostsRef.current = false;

    loadFriendData();
    loadPosts();

    // 組件卸載時清理計時器
    return () => {
      const timers = commentDebounceTimers.current;
      if (timers) {
        timers.forEach(timer => clearTimeout(timer));
        timers.clear();
      }
    };
  }, [loadFriendData, loadPosts, userId]);

  if (loading) {
    return (
      <div className="friend-feed-page">
        <div className="loading">載入中...</div>
      </div>
    );
  }

  // 如果用戶未登入，顯示錯誤並提供返回選項
  if (error && !auth.currentUser) {
    return (
      <div className="friend-feed-page">
        <div className="error-message">
          <p>請先登入後再訪問此頁面</p>
          <button onClick={() => navigate('/login')} className="login-btn">
            前往登入
          </button>
        </div>
        <button onClick={() => navigate('/community')} className="back-btn">
          返回社群
        </button>
      </div>
    );
  }

  if (error && !friendData) {
    return (
      <div className="friend-feed-page">
        <div className="friend-feed-header">
          <button onClick={() => navigate('/community')} className="back-btn">
            ← 返回社群
          </button>
          <div className="friend-info">
            <img
              src="/default-avatar.svg"
              alt="頭像"
              className="friend-avatar"
              loading="lazy"
              onError={e => {
                e.target.src = '/default-avatar.svg';
              }}
            />
            <div className="friend-details">
              <h1>用戶 {userId?.substring(0, 8)}...</h1>
              <p>無法載入用戶資料，但您仍可以留言</p>
            </div>
          </div>
        </div>

        {/* 狀態訊息 */}
        <div className="alert alert-error">
          <p>{error}</p>
          <p>用戶資料載入失敗，但您仍可以發送留言</p>
        </div>

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
                alt="頭像"
                loading="lazy"
                onError={e => {
                  e.target.src = '/default-avatar.svg';
                }}
              />
            </div>
            <div className="composer-input">
              <textarea
                placeholder="給用戶留言..."
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                maxLength={500}
                disabled={submitting}
              />
              <div className="composer-footer">
                <span className="char-count">{newPostContent.length}/500</span>
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
              <p>來寫下第一條留言吧！</p>
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
      </div>
    );
  }

  return (
    <div className="friend-feed-page">
      <div className="friend-feed-header">
        <button onClick={() => navigate('/community')} className="back-btn">
          ← 返回社群
        </button>
        <div className="friend-info">
          <img
            src={friendData?.avatarUrl || '/default-avatar.svg'}
            alt="頭像"
            className="friend-avatar"
            loading="lazy"
            onError={e => {
              e.target.src = '/default-avatar.png';
            }}
          />
          <div className="friend-details">
            <h1>{friendData?.nickname || '用戶'} 的個人版</h1>
            <p>在這裡給 {friendData?.nickname || '用戶'} 留言吧！</p>
          </div>
        </div>
      </div>

      {/* 狀態訊息 */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* 發布動態區域 */}
      <div className="post-composer">
        <div className="composer-header">
          <div className="user-avatar">
            <img
              src={(() => {
                const isGuest = sessionStorage.getItem('guestMode') === 'true';
                return isGuest
                  ? '/guest-avatar.svg'
                  : userData?.avatarUrl || '/default-avatar.svg';
              })()}
              alt="頭像"
              loading="lazy"
              onError={e => {
                e.target.src = '/default-avatar.svg';
              }}
            />
          </div>
          <div className="composer-input">
            <textarea
              placeholder={`給 ${friendData?.nickname || '用戶'} 留言...`}
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              maxLength={500}
              disabled={submitting}
            />
            <div className="composer-footer">
              <span className="char-count">{newPostContent.length}/500</span>
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
            <p>來寫下第一條留言吧！</p>
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
    </div>
  );
};

export default FriendFeed;
