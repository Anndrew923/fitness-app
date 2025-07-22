import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../UserContext';
import { auth, db } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  where,
  deleteDoc,
} from 'firebase/firestore';
import firebaseWriteMonitor from '../utils/firebaseMonitor';
import './FriendFeed.css';

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

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFriendData({
          id: userDoc.id,
          ...userData,
        });
        console.log(
          '✅ 好友資料載入成功:',
          userData.nickname || userData.email
        );
      } else {
        setError('找不到該用戶');
        console.error('❌ 找不到用戶:', userId);
      }
    } catch (error) {
      console.error('載入好友資料失敗:', error);
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

      // 查詢好友的動態（限制為最近50條）
      const postsQuery = query(
        collection(db, 'communityPosts'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(postsQuery);
      const postsData = [];

      snapshot.forEach(doc => {
        const postData = doc.data();
        postsData.push({
          id: doc.id,
          ...postData,
        });
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
        targetUserId: userId, // 標記這是發給特定好友的動態
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

  // 初始載入
  useEffect(() => {
    // 檢查用戶是否已登入
    if (!auth.currentUser) {
      console.error('❌ 用戶未登入');
      setError('請先登入');
      return;
    }

    console.log('🔄 開始載入好友頁面數據...');
    loadFriendData();
    loadPosts();

    // 組件卸載時清理計時器
    return () => {
      commentDebounceTimers.current.forEach(timer => clearTimeout(timer));
      commentDebounceTimers.current.clear();
    };
  }, [loadFriendData, loadPosts]);

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
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/community')} className="back-btn">
          返回社群
        </button>
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
            src={friendData?.avatarUrl || '/default-avatar.png'}
            alt="頭像"
            className="friend-avatar"
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
