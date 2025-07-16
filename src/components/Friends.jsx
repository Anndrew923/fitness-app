import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../UserContext';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  arrayUnion,
  arrayRemove,
  orderBy,
  limit,
} from 'firebase/firestore';
import './Friends.css';

const Friends = () => {
  const { userData, setUserData, loadUserData } = useUser();
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'search', 'messages'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 好友相關狀態
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // 訊息相關狀態
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  // 表情符號 - 改為5個訓練指標相關符號
  const stickers = ['💪', '🏃', '⚡', '🏆', '🎯']; // 力量、跑步、爆發力、成就、目標

  // 調試函數：檢查雙方好友關係
  const debugFriendship = async friendId => {
    try {
      console.log('=== 🔍 開始全面調試 ===');
      console.log('目標好友ID:', friendId);
      console.log('當前用戶ID:', auth.currentUser.uid);

      // 1. 檢查好友邀請記錄
      console.log('--- 檢查好友邀請記錄 ---');
      const invitationsQuery = query(
        collection(db, 'friendInvitations'),
        where('status', '==', 'accepted')
      );
      const invitationsSnapshot = await getDocs(invitationsQuery);

      console.log('所有已接受的邀請:', invitationsSnapshot.docs.length);
      let foundRelation = false;

      invitationsSnapshot.forEach(doc => {
        const data = doc.data();
        if (
          (data.fromUserId === auth.currentUser.uid &&
            data.toUserId === friendId) ||
          (data.fromUserId === friendId &&
            data.toUserId === auth.currentUser.uid)
        ) {
          console.log('✅ 找到好友關係:', data);
          foundRelation = true;
        }
      });

      if (!foundRelation) {
        console.log('❌ 未找到好友關係！');
        console.log('提示：確保雙方已完成好友邀請流程');
        setError('未找到好友關係，請重新添加好友');
        return;
      }

      // 2. 檢查歷史訊息
      console.log('--- 檢查歷史訊息 ---');
      const allMessagesQuery = query(collection(db, 'friendMessages'));
      const allMessagesSnapshot = await getDocs(allMessagesQuery);

      console.log('資料庫中總訊息數:', allMessagesSnapshot.docs.length);

      let relatedMessages = [];
      allMessagesSnapshot.forEach(doc => {
        const data = doc.data();
        if (
          (data.fromUserId === auth.currentUser.uid &&
            data.toUserId === friendId) ||
          (data.fromUserId === friendId &&
            data.toUserId === auth.currentUser.uid)
        ) {
          relatedMessages.push({ id: doc.id, ...data });
        }
      });

      console.log('相關訊息數量:', relatedMessages.length);
      console.log('相關訊息詳情:', relatedMessages);

      // 3. 測試發送功能
      console.log('--- 測試發送功能 ---');
      const testMessage = {
        fromUserId: auth.currentUser.uid,
        toUserId: friendId,
        message: '🔧 測試訊息 ' + new Date().toLocaleTimeString(),
        type: 'text',
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      const testDoc = await addDoc(
        collection(db, 'friendMessages'),
        testMessage
      );
      console.log('✅ 測試訊息發送成功，ID:', testDoc.id);

      // 重新載入訊息
      await loadMessages(friendId);

      console.log('=== 🎯 調試完成 ===');
    } catch (error) {
      console.error('❌ 調試失敗:', error);
      setError('調試失敗: ' + error.message);
    }
  };

  // 載入好友列表
  const loadFriendsData = useCallback(async () => {
    try {
      setLoading(true);

      console.log('開始載入好友列表，使用邀請記錄方式');

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

      console.log(`找到 ${friendIds.size} 位好友:`, Array.from(friendIds));

      if (friendIds.size === 0) {
        setFriendsList([]);
        // 同時更新 userData 中的 friends
        setUserData(prev => ({
          ...prev,
          friends: [],
        }));
        return;
      }

      const friendsData = [];

      // 獲取每個好友的詳細資料
      for (const friendId of friendIds) {
        try {
          console.log(`載入好友 ${friendId} 的資料`);
          const friendDoc = await getDocs(
            query(collection(db, 'users'), where('userId', '==', friendId))
          );

          if (!friendDoc.empty) {
            const friendData = friendDoc.docs[0].data();
            console.log(
              `找到好友資料:`,
              friendData.nickname || friendData.email
            );
            friendsData.push({
              id: friendId,
              nickname:
                friendData.nickname ||
                friendData.email?.split('@')[0] ||
                '匿名用戶',
              avatarUrl: friendData.avatarUrl || '',
              ladderScore: friendData.ladderScore || 0,
              lastActive: friendData.lastActive || '',
            });
          } else {
            console.log(`未找到好友 ${friendId} 的資料`);
          }
        } catch (error) {
          console.error(`載入好友 ${friendId} 資料失敗:`, error);
        }
      }

      console.log(`成功載入 ${friendsData.length} 位好友`, friendsData);
      setFriendsList(friendsData);

      // 同時更新 userData 中的 friends 陣列，保持一致性
      setUserData(prev => ({
        ...prev,
        friends: Array.from(friendIds),
      }));
    } catch (error) {
      console.error('載入好友列表失敗:', error);
      setError('載入好友列表失敗');
    } finally {
      setLoading(false);
    }
  }, []); // 移除依賴，改為手動觸發

  // 載入好友邀請
  const loadFriendRequests = useCallback(async () => {
    try {
      const requestsQuery = query(
        collection(db, 'friendInvitations'),
        where('toUserId', '==', auth.currentUser.uid),
        where('status', '==', 'pending')
      );

      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = [];

      for (const doc of requestsSnapshot.docs) {
        const requestData = doc.data();
        const senderDoc = await getDocs(
          query(
            collection(db, 'users'),
            where('userId', '==', requestData.fromUserId)
          )
        );

        if (!senderDoc.empty) {
          const senderData = senderDoc.docs[0].data();
          requests.push({
            id: doc.id,
            fromUserId: requestData.fromUserId,
            senderName:
              senderData.nickname ||
              senderData.email?.split('@')[0] ||
              '匿名用戶',
            senderAvatar: senderData.avatarUrl || '',
            createdAt: requestData.createdAt,
          });
        }
      }

      setFriendRequests(requests);
    } catch (error) {
      console.error('載入好友邀請失敗:', error);
      setError('載入好友邀請失敗');
    }
  }, []);

  useEffect(() => {
    if (auth.currentUser) {
      loadFriendRequests();
    }
  }, [loadFriendRequests]);

  // 組件加載時載入好友列表
  useEffect(() => {
    if (auth.currentUser) {
      loadFriendsData();
    }
  }, [loadFriendsData]);

  // 檢查兩個用戶是否為好友關係
  const checkFriendship = async (userId1, userId2) => {
    try {
      // 檢查是否有已接受的邀請（雙向檢查）
      const friendshipQuery = query(
        collection(db, 'friendInvitations'),
        where('status', '==', 'accepted')
      );

      const snapshot = await getDocs(friendshipQuery);

      let isFriend = false;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (
          (data.fromUserId === userId1 && data.toUserId === userId2) ||
          (data.fromUserId === userId2 && data.toUserId === userId1)
        ) {
          isFriend = true;
        }
      });

      return isFriend;
    } catch (error) {
      console.error('檢查好友關係失敗:', error);
      return false;
    }
  };

  // 搜尋用戶
  const handleSearch = async () => {
    const searchTerm = searchQuery.toLowerCase();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = [];
      const foundUserIds = new Set();

      // 策略1：搜尋暱稱（支持部分匹配）
      try {
        const nicknameQuery = query(
          collection(db, 'users'),
          where('nickname', '>=', searchTerm),
          where('nickname', '<=', searchTerm + '\uf8ff'),
          limit(10)
        );

        const nicknameSnapshot = await getDocs(nicknameQuery);

        for (const doc of nicknameSnapshot.docs) {
          const userData = doc.data();
          if (
            userData.userId !== auth.currentUser.uid &&
            !foundUserIds.has(userData.userId)
          ) {
            foundUserIds.add(userData.userId);

            // 檢查好友關係
            const isFriend = await checkFriendship(
              auth.currentUser.uid,
              userData.userId
            );

            results.push({
              id: userData.userId,
              nickname:
                userData.nickname ||
                userData.email?.split('@')[0] ||
                '匿名用戶',
              email: userData.email,
              avatarUrl: userData.avatarUrl || '',
              ladderScore: userData.ladderScore || 0,
              isFriend: isFriend,
              hasPendingRequest: false,
            });
          }
        }
      } catch (error) {
        console.log('暱稱搜尋失敗:', error);
      }

      // 策略2：搜尋電子郵件（支持部分匹配）
      try {
        let emailQuery;
        if (searchTerm.includes('@')) {
          emailQuery = query(
            collection(db, 'users'),
            where('email', '==', searchTerm),
            limit(5)
          );
        } else {
          emailQuery = query(
            collection(db, 'users'),
            where('email', '>=', searchTerm),
            where('email', '<=', searchTerm + '\uf8ff'),
            limit(10)
          );
        }

        const emailSnapshot = await getDocs(emailQuery);

        for (const doc of emailSnapshot.docs) {
          const userData = doc.data();
          if (
            userData.userId !== auth.currentUser.uid &&
            !foundUserIds.has(userData.userId)
          ) {
            foundUserIds.add(userData.userId);

            // 檢查好友關係
            const isFriend = await checkFriendship(
              auth.currentUser.uid,
              userData.userId
            );

            results.push({
              id: userData.userId,
              nickname:
                userData.nickname ||
                userData.email?.split('@')[0] ||
                '匿名用戶',
              email: userData.email,
              avatarUrl: userData.avatarUrl || '',
              ladderScore: userData.ladderScore || 0,
              isFriend: isFriend,
              hasPendingRequest: false,
            });
          }
        }
      } catch (error) {
        console.log('電子郵件搜尋失敗:', error);
      }

      // 檢查待處理的邀請
      try {
        const pendingQuery = query(
          collection(db, 'friendInvitations'),
          where('fromUserId', '==', auth.currentUser.uid),
          where('status', '==', 'pending')
        );

        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingUserIds = new Set();

        pendingSnapshot.forEach(doc => {
          pendingUserIds.add(doc.data().toUserId);
        });

        // 更新搜尋結果中的待處理狀態
        results.forEach(user => {
          if (pendingUserIds.has(user.id)) {
            user.hasPendingRequest = true;
          }
        });
      } catch (error) {
        console.log('檢查待處理邀請失敗:', error);
      }

      setSearchResults(results);
    } catch (error) {
      console.error('搜尋失敗:', error);
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
        where('toUserId', '==', toUserId),
        where('status', '==', 'pending')
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        setError('已經發送過好友邀請');
        return;
      }

      // 發送邀請
      await addDoc(collection(db, 'friendInvitations'), {
        fromUserId: auth.currentUser.uid,
        toUserId: toUserId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

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

      // 2. 只更新當前用戶的好友列表
      const currentUserRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(currentUserRef, {
        friends: arrayUnion(fromUserId),
      });

      // 3. 創建一個反向邀請，狀態直接設為已接受
      // 這樣對方也會有一個已接受的邀請記錄
      await addDoc(collection(db, 'friendInvitations'), {
        fromUserId: auth.currentUser.uid,
        toUserId: fromUserId,
        status: 'accepted',
        createdAt: new Date().toISOString(),
        acceptedAt: new Date().toISOString(),
        isReverse: true, // 標記為反向邀請
      });

      // 4. 立即更新本地狀態
      setUserData(prev => ({
        ...prev,
        friends: [...(prev.friends || []), fromUserId],
      }));

      // 5. 移除已處理的邀請
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));

      setSuccess('已接受好友邀請');

      // 6. 重新載入相關資料
      await loadUserData();
      await loadFriendsData();
    } catch (error) {
      console.error('接受好友邀請失敗:', error);
      setError(`接受邀請失敗: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 拒絕好友邀請
  const rejectFriendRequest = async requestId => {
    try {
      await updateDoc(doc(db, 'friendInvitations', requestId), {
        status: 'rejected',
      });

      setFriendRequests(prev => prev.filter(req => req.id !== requestId));

      setSuccess('已拒絕好友邀請');
    } catch (error) {
      console.error('拒絕好友邀請失敗:', error);
      setError('拒絕邀請失敗');
    }
  };

  // 移除好友
  const removeFriend = async friendId => {
    if (!confirm('確定要移除這位好友嗎？')) return;

    try {
      setLoading(true);

      // 1. 只更新當前用戶的好友列表
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

      // 4. 如果正在與該好友聊天，退出聊天
      if (selectedFriend?.id === friendId) {
        setSelectedFriend(null);
        setActiveTab('friends');
      }

      setSuccess('已移除好友');
    } catch (error) {
      console.error('移除好友失敗:', error);
      setError(`移除好友失敗: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 發送訊息
  const sendMessage = async (type = 'text', content = messageInput) => {
    if (!selectedFriend || (!content.trim() && type === 'text')) return;

    console.log('準備發送訊息:', {
      type,
      content,
      from: auth.currentUser.uid,
      to: selectedFriend.id,
      toNickname: selectedFriend.nickname,
    });

    try {
      const messageData = {
        fromUserId: auth.currentUser.uid,
        toUserId: selectedFriend.id,
        message: content,
        type: type,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      console.log('發送訊息數據:', messageData);

      const docRef = await addDoc(
        collection(db, 'friendMessages'),
        messageData
      );
      console.log('訊息發送成功，文檔ID:', docRef.id);

      if (type === 'text') {
        setMessageInput('');
      }

      // 立即重新載入訊息
      await loadMessages(selectedFriend.id);
    } catch (error) {
      console.error('發送訊息失敗:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
      });
      setError('發送訊息失敗: ' + error.message);
    }
  };

  // 載入訊息
  const loadMessages = async friendId => {
    try {
      console.log('🔄 開始載入訊息，參數:', {
        friendId,
        currentUser: auth.currentUser?.uid,
      });

      // 分別查詢兩個方向的訊息，避免複合索引需求
      const sentMessagesQuery = query(
        collection(db, 'friendMessages'),
        where('fromUserId', '==', auth.currentUser.uid),
        where('toUserId', '==', friendId)
      );

      const receivedMessagesQuery = query(
        collection(db, 'friendMessages'),
        where('fromUserId', '==', friendId),
        where('toUserId', '==', auth.currentUser.uid)
      );

      console.log('📡 執行查詢...');
      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(sentMessagesQuery),
        getDocs(receivedMessagesQuery),
      ]);

      console.log('📊 查詢結果:', {
        sent: sentSnapshot.docs.length,
        received: receivedSnapshot.docs.length,
      });

      // 詳細顯示查詢到的訊息
      const sentMessages = sentSnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        console.log('📤 發送的訊息:', data);
        return data;
      });

      const receivedMessages = receivedSnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        console.log('📥 接收的訊息:', data);
        return data;
      });

      // 合併並排序所有訊息
      const allMessages = [...sentMessages, ...receivedMessages].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      // 限制總數為50條最新訊息
      const recentMessages = allMessages.slice(-50);

      console.log(
        '✅ 最終訊息列表 (共 ' + recentMessages.length + ' 條):',
        recentMessages
      );
      console.log('🎯 即將設置 messages 狀態...');

      setMessages(recentMessages);

      console.log(
        '✨ 訊息狀態已更新，當前 messages.length:',
        recentMessages.length
      );
    } catch (error) {
      console.error('❌ 載入訊息失敗:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        friendId: friendId,
        currentUser: auth.currentUser?.uid,
      });
      setError('載入訊息失敗，請稍後再試');
    }
  };

  // 清除提示訊息
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // 渲染好友列表標籤頁
  const renderFriendsTab = () => {
    return (
      <div className="friends-list">
        {friendsList.length === 0 ? (
          <div className="empty-state">
            <p>還沒有好友，去搜尋一些吧！</p>
          </div>
        ) : (
          friendsList.map(friend => (
            <div key={friend.id} className="friend-card">
              <div className="friend-avatar">
                {friend.avatarUrl ? (
                  <img src={friend.avatarUrl} alt={friend.nickname} />
                ) : (
                  <div className="avatar-placeholder">
                    {friend.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="friend-info">
                <h4>{friend.nickname}</h4>
                <p>天梯分數: {friend.ladderScore}</p>
              </div>
              <div className="friend-actions">
                <button
                  className="btn-message"
                  onClick={() => {
                    console.log('💬 點擊訊息按鈕，好友資訊:', friend);
                    console.log('🎯 設置 selectedFriend 為:', friend);
                    setSelectedFriend(friend);
                    console.log('📋 切換到 messages 標籤');
                    setActiveTab('messages');
                    console.log('📥 開始載入訊息...');
                    loadMessages(friend.id);
                  }}
                  style={{
                    background:
                      'linear-gradient(135deg, #81D8D0 0%, #5F9EA0 100%)' /* Tiffany 藍漸變 */,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  💬
                </button>
                <button
                  className="btn-remove"
                  onClick={() => removeFriend(friend.id)}
                >
                  ❌
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // 渲染好友邀請標籤頁
  const renderRequestsTab = () => (
    <div className="friend-requests">
      {friendRequests.length === 0 ? (
        <div className="empty-state">
          <p>沒有待處理的好友邀請</p>
        </div>
      ) : (
        friendRequests.map(request => (
          <div key={request.id} className="request-card">
            <div className="friend-avatar">
              {request.senderAvatar ? (
                <img src={request.senderAvatar} alt={request.senderName} />
              ) : (
                <div className="avatar-placeholder">
                  {request.senderName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="friend-info">
              <h4>{request.senderName}</h4>
              <p>想要加您為好友</p>
            </div>
            <div className="request-actions">
              <button
                className="btn-accept"
                onClick={() =>
                  acceptFriendRequest(request.id, request.fromUserId)
                }
              >
                接受
              </button>
              <button
                className="btn-reject"
                onClick={() => rejectFriendRequest(request.id)}
              >
                拒絕
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // 渲染搜尋標籤頁
  const renderSearchTab = () => (
    <div className="search-section">
      <div className="search-box">
        <input
          type="text"
          placeholder="搜尋用戶暱稱或電子郵件..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? '搜尋中...' : '搜尋'}
        </button>
      </div>

      <div className="search-tips">
        <p>💡 搜尋提示：</p>
        <ul>
          <li>輸入暱稱的開頭部分進行搜尋</li>
          <li>輸入完整的電子郵件地址</li>
          <li>搜尋結果會自動排除自己</li>
        </ul>
      </div>

      <div className="search-results">
        {searchResults.length === 0 && searchQuery.trim() && !loading ? (
          <div className="empty-state">
            <p>沒有找到匹配的用戶</p>
            <p>請嘗試：</p>
            <ul>
              <li>檢查拼寫是否正確</li>
              <li>嘗試暱稱的開頭部分</li>
              <li>使用完整的電子郵件地址</li>
            </ul>
          </div>
        ) : (
          searchResults.map(user => (
            <div key={user.id} className="user-card">
              <div className="friend-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.nickname} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="friend-info">
                <h4>{user.nickname}</h4>
                <p>{user.email}</p>
                <p>天梯分數: {user.ladderScore}</p>
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
  );

  // 渲染訊息標籤頁
  const renderMessagesTab = () => {
    console.log('🎨 渲染訊息標籤頁:', {
      selectedFriend,
      messagesCount: messages.length,
      activeTab,
    });

    return (
      <div className="messages-section">
        {selectedFriend ? (
          <>
            <div className="chat-header">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '8px 0',
                }}
              >
                <button
                  className="back-btn"
                  onClick={() => {
                    console.log('🔙 返回好友列表');
                    setActiveTab('friends');
                    setSelectedFriend(null);
                    setMessages([]);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: 'none',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '12px',
                    marginRight: '12px',
                    width: '10%',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  ←
                </button>

                <div
                  className="friend-avatar"
                  style={{
                    width: '36px',
                    height: '36px',
                    marginRight: '12px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {selectedFriend.avatarUrl ? (
                    <img
                      src={selectedFriend.avatarUrl}
                      alt={selectedFriend.nickname}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background:
                          'linear-gradient(135deg, #81D8D0 0%, #5F9EA0 100%)' /* Tiffany 藍漸變 */,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px',
                      }}
                    >
                      {selectedFriend.nickname.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: '16px',
                      color: 'white',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.2',
                    }}
                  >
                    {selectedFriend.nickname}
                  </h3>
                </div>
              </div>
            </div>

            <div
              className="messages-container"
              style={{
                paddingBottom: '120px' /* 為輸入框和廣告欄位留出空間 */,
              }}
            >
              {messages.length === 0 ? (
                <div
                  className="empty-messages"
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#666',
                    fontSize: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    margin: '10px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <p>還沒有訊息記錄</p>
                  <p>發送第一條訊息開始對話吧！</p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#999',
                      marginTop: '10px',
                    }}
                  >
                    載入的訊息數量: {messages.length}
                  </p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      fontSize: '10px',
                      color: '#1976d2',
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    共載入 {messages.length} 條訊息
                  </div>
                  {messages.map((message, index) => {
                    console.log('🗨️ 渲染訊息:', message);
                    return (
                      <div
                        key={message.id || index}
                        className={`message ${
                          message.fromUserId === auth.currentUser.uid
                            ? 'sent'
                            : 'received'
                        }`}
                        style={{
                          animation: 'fadeIn 0.3s ease-out',
                          animationDelay: `${index * 0.1}s`,
                        }}
                      >
                        <div className="message-bubble">
                          {message.type === 'sticker' ? (
                            <span
                              className="sticker"
                              style={{ fontSize: '24px' }}
                            >
                              {message.message}
                            </span>
                          ) : (
                            <p style={{ margin: 0 }}>{message.message}</p>
                          )}
                        </div>
                        <div
                          className="message-time"
                          style={{
                            fontSize: '11px',
                            color: '#999',
                            marginTop: '4px',
                          }}
                        >
                          {new Date(message.timestamp).toLocaleTimeString(
                            'zh-TW',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* 輸入框容器 - 固定在底部 */}
            <div
              className="message-input-container"
              style={{
                position: 'fixed',
                bottom: window.innerWidth <= 768 ? '64px' : '70px', // 直接放在廣告欄位上方
                left: '0',
                right: '0',
                background: 'white',
                borderTop: '1px solid #e9ecef',
                padding: '12px 16px',
                paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
                zIndex: 1001, // 確保在廣告欄位之上
                boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div
                className="text-input-row"
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  maxWidth: '800px',
                  margin: '0 auto',
                }}
              >
                <input
                  type="text"
                  placeholder="輸入訊息..."
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      console.log('⌨️ 按下 Enter 發送訊息');
                      sendMessage();
                    }
                  }}
                  style={{
                    flex: 9,
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '20px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    minHeight: '40px',
                  }}
                />
                <button
                  onClick={() => {
                    console.log('🚀 點擊發送按鈕');
                    sendMessage();
                  }}
                  disabled={!messageInput.trim()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: messageInput.trim()
                      ? 'linear-gradient(135deg, #81D8D0 0%, #5F9EA0 100%)' /* Tiffany 藍漸變 */
                      : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                    minHeight: '40px',
                    minWidth: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                  }}
                  title="發送訊息"
                >
                  ➤
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            className="empty-state"
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666',
            }}
          >
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>
              請選擇一位好友開始對話
            </p>
            <p style={{ fontSize: '14px', color: '#999' }}>
              點擊好友列表中的 💬 按鈕
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1>好友系統</h1>

        {/* 狀態訊息 */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
      </div>

      {/* 標籤導航 - 只在非訊息模式下顯示 */}
      {activeTab !== 'messages' && (
        <div className="tab-navigation">
          <div
            className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <span className="tab-label">好友列表 ({friendsList.length})</span>
          </div>
          <div
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <span className="tab-label">邀請通知</span>
            {friendRequests.length > 0 && (
              <span className="notification-badge">
                {friendRequests.length}
              </span>
            )}
          </div>
          <div
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <span className="tab-label">搜尋好友</span>
          </div>
        </div>
      )}

      {/* 內容區域 */}
      <div className="tab-content">
        {loading && <div className="loading">載入中...</div>}

        {activeTab === 'friends' && renderFriendsTab()}
        {activeTab === 'requests' && renderRequestsTab()}
        {activeTab === 'search' && renderSearchTab()}
        {activeTab === 'messages' && renderMessagesTab()}
      </div>
    </div>
  );
};

export default Friends;
