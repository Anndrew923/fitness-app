import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../UserContext';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  limit,
  writeBatch,
} from 'firebase/firestore';
import firebaseWriteMonitor from '../utils/firebaseMonitor';
import './Friends.css';

const Friends = () => {
  const { userData, setUserData, loadUserData } = useUser();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'search', 'challenges'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 好友相關狀態
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // 挑戰相關狀態
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [challengeInput, setChallengeInput] = useState('');
  const [selectedChallengeType, setSelectedChallengeType] =
    useState('strength');
  // const [showChallengeForm, setShowChallengeForm] = useState(false);

  // 挑戰類型定義
  const challengeTypes = useMemo(
    () => [
      {
        id: 'strength',
        name: '力量挑戰',
        icon: '💪',
        description: '深蹲、卧推等重量挑戰',
        examples: ['深蹲 100kg x 5次', '卧推 80kg x 3次', '硬舉 120kg x 1次'],
      },
      {
        id: 'endurance',
        name: '耐力挑戰',
        icon: '🏃',
        description: '跑步、游泳等耐力挑戰',
        examples: ['跑步 5km 25分鐘內', '游泳 1000m', '騎車 20km'],
      },
      {
        id: 'power',
        name: '爆發力挑戰',
        icon: '⚡',
        description: '短時間高強度挑戰',
        examples: ['30秒波比跳 15次', '1分鐘引體向上 10次', '2分鐘平板支撐'],
      },
      {
        id: 'comprehensive',
        name: '綜合挑戰',
        icon: '🎯',
        description: '多項目組合挑戰',
        examples: ['深蹲 + 跑步 + 引體向上', '卧推 + 游泳 + 平板支撐'],
      },
    ],
    []
  );

  // 挑戰狀態
  const challengeStatus = useMemo(
    () => ({
      pending: { label: '等待回應', color: '#ffa726', icon: '⏳' },
      accepted: { label: '已接受', color: '#66bb6a', icon: '✅' },
      declined: { label: '已拒絕', color: '#ef5350', icon: '❌' },
      completed: { label: '已完成', color: '#42a5f5', icon: '🏆' },
      expired: { label: '已過期', color: '#9e9e9e', icon: '⏰' },
    }),
    []
  );

  // 調試函數：檢查雙方好友關係
  /*
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
      // await loadMessages(friendId); // 暫時註釋，等待實現

      console.log('=== 🎯 調試完成 ===');
    } catch (error) {
      console.error('❌ 調試失敗:', error);
      setError('調試失敗: ' + error.message);
    }
  };
  */

  // 載入好友列表
  const loadFriendsData = useCallback(async () => {
    try {
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
          if (process.env.NODE_ENV === 'development') {
            console.log(`載入好友 ${friendId} 的資料`);
          }
          const friendDoc = await getDocs(
            query(collection(db, 'users'), where('userId', '==', friendId))
          );

          if (!friendDoc.empty) {
            const friendData = friendDoc.docs[0].data();
            if (process.env.NODE_ENV === 'development') {
              console.log(
                `找到好友資料:`,
                friendData.nickname || friendData.email
              );
            }
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
            if (process.env.NODE_ENV === 'development') {
              console.log(`未找到好友 ${friendId} 的資料`);
            }
          }
        } catch (error) {
          console.error(`載入好友 ${friendId} 資料失敗:`, error);
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`成功載入 ${friendsData.length} 位好友`, friendsData);
      }
      setFriendsList(friendsData);

      // 同時更新 userData 中的 friends 陣列，保持一致性
      setUserData(prev => ({
        ...prev,
        friends: Array.from(friendIds),
      }));
    } catch (error) {
      console.error('載入好友列表失敗:', error);
      setError(t('friends.messages.loadFriendsFail'));
    } finally {
      setLoading(false);
    }
  }, [setUserData]); // 移除依賴，改為手動觸發

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

      // 只顯示pending狀態的邀請
      const requestsQuery = query(
        collection(db, 'friendInvitations'),
        where('toUserId', '==', auth.currentUser.uid),
        where('status', '==', 'pending')
      );

      const requestsSnapshot = await getDocs(requestsQuery);
      console.log('📋 找到pending邀請數量:', requestsSnapshot.docs.length);
      const requests = [];

      for (const doc of requestsSnapshot.docs) {
        const requestData = doc.data();

        try {
          // 直接使用 doc() 查詢發送者資料，而不是使用 where 查詢
          const senderDocRef = doc(db, 'users', requestData.fromUserId);
          const senderDocSnap = await getDoc(senderDocRef);

          if (senderDocSnap.exists()) {
            const senderData = senderDocSnap.data();
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
          } else {
            console.warn(`找不到發送者資料: ${requestData.fromUserId}`);
            // 即使找不到發送者資料，也顯示邀請
            requests.push({
              id: doc.id,
              fromUserId: requestData.fromUserId,
              senderName: '未知用戶',
              senderAvatar: '',
              createdAt: requestData.createdAt,
            });
          }
        } catch (error) {
          console.error(
            `載入發送者 ${requestData.fromUserId} 資料失敗:`,
            error
          );
          // 錯誤時也顯示邀請
          requests.push({
            id: doc.id,
            fromUserId: requestData.fromUserId,
            senderName: '未知用戶',
            senderAvatar: '',
            createdAt: requestData.createdAt,
          });
        }
      }

      console.log('✅ 載入完成，邀請列表:', requests);
      setFriendRequests(requests);
    } catch (error) {
      console.error('❌ 載入好友邀請失敗:', error);
      setError(t('friends.messages.loadInvitesFail'));
    }
  }, [setFriendRequests]);

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
      setError(t('friends.messages.searchFail'));
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

      // 檢查好友數量限制 - 使用 userData.friends 作為更可靠的來源
      const currentFriendsCount = userData?.friends?.length || friendsList.length;
      const FRIEND_LIMIT = 100;

      if (currentFriendsCount >= FRIEND_LIMIT) {
        setError(t('community.messages.friendLimitMessage'));
        return;
      }

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
          setError(t('friends.messages.alreadyInvited'));

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
      setSuccess(t('friends.messages.inviteSent'));

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
        console.log('🔄 重新載入邀請列表...');
        loadFriendRequests();
      }, 1000);
    } catch (error) {
      console.error('發送好友邀請失敗:', error);
      setError(t('friends.messages.inviteSendFail'));
    } finally {
      setLoading(false);
    }
  };

  // 接受好友邀請
  const acceptFriendRequest = async (requestId, fromUserId) => {
    try {
      setLoading(true);

      // 檢查好友數量限制 - 使用 userData.friends 作為更可靠的來源
      const currentFriendsCount = userData?.friends?.length || friendsList.length;
      const FRIEND_LIMIT = 100;

      if (currentFriendsCount >= FRIEND_LIMIT) {
        setError(t('community.messages.friendLimitMessage'));
        return;
      }

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

      // 2. 只更新當前用戶的好友列表
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

      // 3. 創建一個反向邀請，狀態直接設為已接受
      // 這樣對方也會有一個已接受的邀請記錄
      const reverseDocRef = await addDoc(collection(db, 'friendInvitations'), {
        fromUserId: auth.currentUser.uid,
        toUserId: fromUserId,
        status: 'accepted',
        createdAt: new Date().toISOString(),
        acceptedAt: new Date().toISOString(),
        isReverse: true, // 標記為反向邀請
      });

      // 記錄寫入操作
      firebaseWriteMonitor.logWrite(
        'addDoc',
        'friendInvitations',
        reverseDocRef.id
      );

      // 4. 立即更新本地狀態
      setUserData(prev => ({
        ...prev,
        friends: [...(prev.friends || []), fromUserId],
      }));

      // 5. 移除已處理的邀請
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));

      setSuccess(t('friends.messages.inviteAccepted'));

      // 6. 重新載入相關資料
      await loadUserData();
      await loadFriendsData();
    } catch (error) {
      console.error('接受好友邀請失敗:', error);
      setError(t('friends.messages.inviteAcceptFail'));
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

      setSuccess(t('friends.messages.inviteRejected'));
    } catch (error) {
      console.error('拒絕好友邀請失敗:', error);
      setError(t('friends.messages.inviteRejectFail'));
    }
  };

  // 移除好友
  const removeFriend = async friendId => {
    if (!confirm(t('friends.messages.removeConfirm'))) return;

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

      setSuccess(t('friends.messages.removed'));
    } catch (error) {
      console.error('移除好友失敗:', error);
      setError(t('friends.messages.removeFail'));
    } finally {
      setLoading(false);
    }
  };

  // 發送挑戰
  const sendChallenge = useCallback(async () => {
    if (!selectedFriend || !challengeInput.trim()) return;

    const selectedType = challengeTypes.find(
      type => type.id === selectedChallengeType
    );

    console.log('準備發送挑戰:', {
      type: selectedChallengeType,
      challenge: challengeInput,
      from: auth.currentUser.uid,
      to: selectedFriend.id,
      toNickname: selectedFriend.nickname,
    });

    try {
      const challengeData = {
        fromUserId: auth.currentUser.uid,
        toUserId: selectedFriend.id,
        fromUserNickname:
          userData?.nickname || userData?.email?.split('@')[0] || '匿名用戶',
        toUserNickname: selectedFriend.nickname,
        type: selectedType,
        challenge: challengeInput.trim(),
        status: 'pending',
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天後過期
        isRead: false,
      };

      console.log('發送挑戰數據:', challengeData);

      const docRef = await addDoc(
        collection(db, 'friendChallenges'),
        challengeData
      );
      console.log('挑戰發送成功，文檔ID:', docRef.id);

      setChallengeInput('');
      setSuccess(t('friends.messages.challengeSent'));

      // 立即重新載入挑戰
      await loadChallenges(selectedFriend.id);
    } catch (error) {
      console.error('發送挑戰失敗:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
      });
      setError(t('friends.messages.challengeSendFail'));
    }
  }, [
    selectedFriend,
    challengeInput,
    selectedChallengeType,
    challengeTypes,
    userData,
    loadChallenges,
  ]);

  // 載入挑戰
  const loadChallenges = useCallback(async friendId => {
    try {
      console.log('🔄 開始載入挑戰，參數:', {
        friendId,
        currentUser: auth.currentUser?.uid,
      });

      // 簡化查詢：只查詢所有相關挑戰，然後在客戶端過濾和排序
      const challengesQuery = query(collection(db, 'friendChallenges'));

      console.log('📡 執行查詢...');
      const snapshot = await getDocs(challengesQuery);

      console.log('📊 查詢結果:', {
        total: snapshot.docs.length,
      });

      // 處理挑戰數據：在客戶端過濾相關挑戰
      const allChallenges = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(
          challenge =>
            (challenge.fromUserId === auth.currentUser.uid &&
              challenge.toUserId === friendId) ||
            (challenge.fromUserId === friendId &&
              challenge.toUserId === auth.currentUser.uid)
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('📤 過濾後的挑戰數量:', allChallenges.length);

      // 檢查過期挑戰（僅在客戶端標記，不觸發數據庫寫入）
      const now = new Date();
      const validChallenges = allChallenges.map(challenge => {
        const expiresAt = new Date(challenge.expiresAt);
        if (expiresAt < now && challenge.status === 'pending') {
          // 僅在客戶端標記為過期，不觸發數據庫更新
          return { ...challenge, status: 'expired', isClientExpired: true };
        }
        return challenge;
      });

      console.log(
        '✅ 最終挑戰列表 (共 ' + validChallenges.length + ' 條):',
        validChallenges
      );

      setChallenges(validChallenges);
    } catch (error) {
      console.error('❌ 載入挑戰失敗:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        friendId: friendId,
        currentUser: auth.currentUser?.uid,
      });
      setError(t('friends.messages.loadChallengesFail'));
    }
  }, []);

  // 更新挑戰狀態
  const updateChallengeStatus = useCallback(async (challengeId, newStatus) => {
    try {
      const challengeRef = doc(db, 'friendChallenges', challengeId);
      await updateDoc(challengeRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      console.log(`挑戰 ${challengeId} 狀態更新為: ${newStatus}`);
    } catch (error) {
      console.error('更新挑戰狀態失敗:', error);
    }
  }, []);

  // 批量更新過期挑戰（可選功能，減少寫入次數）
  const batchUpdateExpiredChallenges = useCallback(async expiredChallenges => {
    if (expiredChallenges.length === 0) return;

    try {
      const batch = writeBatch(db);
      expiredChallenges.forEach(challenge => {
        const challengeRef = doc(db, 'friendChallenges', challenge.id);
        batch.update(challengeRef, {
          status: 'expired',
          updatedAt: new Date().toISOString(),
        });
      });
      await batch.commit();
      console.log(`批量更新了 ${expiredChallenges.length} 個過期挑戰`);
    } catch (error) {
      console.error('批量更新過期挑戰失敗:', error);
    }
  }, []);

  // 回應挑戰
  const respondToChallenge = useCallback(
    async (challengeId, response) => {
      try {
        await updateChallengeStatus(challengeId, response);
        setSuccess(`挑戰已${response === 'accepted' ? '接受' : '拒絕'}！`);

        // 優化：直接更新本地狀態，避免重新載入
        setChallenges(prevChallenges =>
          prevChallenges.map(challenge =>
            challenge.id === challengeId
              ? {
                  ...challenge,
                  status: response,
                  updatedAt: new Date().toISOString(),
                }
              : challenge
          )
        );
      } catch (error) {
        console.error('回應挑戰失敗:', error);
        setError(t('friends.messages.respondFail'));
      }
    },
    [updateChallengeStatus]
  );

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
     const FRIEND_LIMIT = 100;
     const currentFriendsCount = userData?.friends?.length || friendsList.length;
     const remainingSlots = FRIEND_LIMIT - currentFriendsCount;

    return (
      <div className="friends-list">
        {/* 好友數量限制資訊 */}
        <div className="friends-limit-info">
          <div className="limit-info-item">
            <span className="limit-icon">👥</span>
            <span className="limit-text">
              {t('community.messages.friendLimitInfo')}
            </span>
          </div>
          <div className="limit-info-item">
            <span className="limit-icon">📊</span>
            <span className="limit-text">
              當前好友：{currentFriendsCount} / {FRIEND_LIMIT}
              {remainingSlots <= 10 && (
                <span className="limit-warning">
                  {' '}
                  (僅剩 {remainingSlots} 個名額)
                </span>
              )}
            </span>
          </div>
        </div>

        {friendsList.length === 0 ? (
          <div className="empty-state">
            <p>{t('friends.emptyFriends')}</p>
          </div>
        ) : (
          friendsList.map(friend => (
            <div key={friend.id} className="friends-list__friend-card">
              <div className="friends-list__friend-avatar">
                {friend.avatarUrl && friend.avatarUrl.trim() !== '' ? (
                  <img
                    src={friend.avatarUrl}
                    alt={friend.nickname}
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="friends-list__avatar-placeholder">
                    {friend.nickname?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="friends-list__friend-info">
                {/* 第一行：名稱 */}
                <div className="friends-list__friend-name">
                  {friend.nickname}
                </div>
                {/* 第二行：分數 + 按鈕 */}
                <div className="friends-list__friend-info-row">
                  <div className="friends-list__friend-score">
                    {friend.ladderScore}
                    {t('community.ui.pointsUnit')}
                  </div>
                  <div className="friends-list__friend-actions">
                <button
                  className="friends-list__btn-challenge"
                  onClick={() => {
                    setSelectedFriend(friend);
                    setActiveTab('challenges');
                    loadChallenges(friend.id);
                  }}
                >
                  🏆
                </button>
                <button
                  className="friends-list__btn-remove"
                  onClick={() => removeFriend(friend.id)}
                >
                  ×
                </button>
                  </div>
                </div>
                {/* 第三行：信箱 - 已移除，避免長信箱影響佈局 */}
                {/* <div className="friends-list__friend-email">{friend.email}</div> */}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // 清除舊邀請的函數
  const clearOldInvitations = async () => {
    try {
      console.log('🧹 開始清除舊邀請...');

      // 查詢所有發送給當前用戶的邀請
      const allRequestsQuery = query(
        collection(db, 'friendInvitations'),
        where('toUserId', '==', auth.currentUser.uid)
      );

      const allRequestsSnapshot = await getDocs(allRequestsQuery);
      console.log('找到邀請數量:', allRequestsSnapshot.docs.length);

      // 顯示所有邀請的詳細資訊
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

      setSuccess(t('friends.messages.shownInvitesInfo'));
    } catch (error) {
      console.error('清除舊邀請失敗:', error);
      setError(t('friends.messages.clearFail'));
    }
  };

  // 渲染好友邀請標籤頁
     const renderRequestsTab = () => {
     const FRIEND_LIMIT = 100;
     const currentFriendsCount = userData?.friends?.length || friendsList.length;
     const remainingSlots = FRIEND_LIMIT - currentFriendsCount;

    return (
    <div className="friend-requests">
        {/* 邀請頁面的好友數量限制資訊 */}
        <div className="friends-limit-info">
          <div className="limit-info-item">
            <span className="limit-icon">👥</span>
            <span className="limit-text">
              {t('community.messages.friendLimitInfo')}
            </span>
          </div>
          <div className="limit-info-item">
            <span className="limit-icon">📊</span>
            <span className="limit-text">
              當前好友：{currentFriendsCount} / {FRIEND_LIMIT}
              {remainingSlots <= 10 && (
                <span className="limit-warning"> (僅剩 {remainingSlots} 個名額)</span>
              )}
            </span>
          </div>
          {currentFriendsCount >= FRIEND_LIMIT && (
            <div className="limit-info-item">
              <span className="limit-icon">⚠️</span>
              <span className="limit-text limit-warning">
                已達好友數量上限，無法接受更多邀請
              </span>
            </div>
          )}
        </div>

      <div style={{ marginBottom: '10px', textAlign: 'right' }}>
        <button
          onClick={() => {
            console.log('🔄 手動重新載入邀請...');
            loadFriendRequests();
          }}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            background: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '8px',
          }}
        >
          🔄 {t('friends.buttons.reload')}
        </button>
        <button
          onClick={clearOldInvitations}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            background: '#ff6b6b',
            color: 'white',
            border: '1px solid #ff5252',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          🧹 {t('friends.buttons.checkInvitations')}
        </button>
      </div>
      {friendRequests.length === 0 ? (
        <div className="empty-state">
          <p>{t('friends.emptyRequests')}</p>
        </div>
      ) : (
        friendRequests.map(request => (
          <div key={request.id} className="friends-list__request-card">
            <div className="friends-list__friend-avatar">
              {request.senderAvatar && request.senderAvatar.trim() !== '' ? (
                <img
                  src={request.senderAvatar}
                  alt={request.senderName}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="friends-list__avatar-placeholder">
                  {request.senderName?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="friends-list__friend-info">
              {/* 第一行：名稱 */}
              <div className="friends-list__friend-name">
                {request.senderName}
              </div>
              {/* 第二行：訊息文字 + 按鈕 */}
              <div className="friends-list__friend-info-row">
                <div className="friends-list__friend-email">
                  {t('friends.requestAction.wantsToAdd')}
                </div>
                <div className="friends-list__friend-actions">
              <button
                className="friends-list__btn-accept"
                onClick={() =>
                  acceptFriendRequest(request.id, request.fromUserId)
                }
                                  disabled={(userData?.friends?.length || friendsList.length) >= 100}
                 title={(userData?.friends?.length || friendsList.length) >= 100 ? t('community.messages.friendLimitReached') : t('friends.requestAction.accept')}
               >
                 {(userData?.friends?.length || friendsList.length) >= 100 ? '已達上限' : t('friends.requestAction.accept')}
              </button>
              <button
                className="friends-list__btn-reject"
                onClick={() => rejectFriendRequest(request.id)}
              >
                {t('friends.requestAction.reject')}
              </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // 渲染搜尋標籤頁
     const renderSearchTab = () => {
     const FRIEND_LIMIT = 100;
     const currentFriendsCount = userData?.friends?.length || friendsList.length;
     const remainingSlots = FRIEND_LIMIT - currentFriendsCount;

    return (
    <div className="search-section">
        {/* 搜尋頁面的好友數量限制資訊 */}
        <div className="friends-limit-info">
          <div className="limit-info-item">
            <span className="limit-icon">👥</span>
            <span className="limit-text">
              {t('community.messages.friendLimitInfo')}
            </span>
          </div>
          <div className="limit-info-item">
            <span className="limit-icon">📊</span>
            <span className="limit-text">
              當前好友：{currentFriendsCount} / {FRIEND_LIMIT}
              {remainingSlots <= 10 && (
                <span className="limit-warning"> (僅剩 {remainingSlots} 個名額)</span>
              )}
            </span>
          </div>
          {currentFriendsCount >= FRIEND_LIMIT && (
            <div className="limit-info-item">
              <span className="limit-icon">⚠️</span>
              <span className="limit-text limit-warning">
                已達好友數量上限，無法添加更多好友
              </span>
            </div>
          )}
        </div>

      <div className="search-box">
        <input
          type="text"
          placeholder={t('friends.search.placeholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? t('common.searching') : t('common.search')}
        </button>
      </div>

      <div className="search-tips">
        <p>💡 {t('friends.search.tips.title')}</p>
        <ul>
          <li>{t('friends.search.tips.nicknamePrefix')}</li>
          <li>{t('friends.search.tips.fullEmail')}</li>
          <li>{t('friends.search.tips.excludeSelf')}</li>
        </ul>
      </div>

      <div className="search-results">
        {searchResults.length === 0 && searchQuery.trim() && !loading ? (
          <div className="empty-state">
            <p>{t('friends.search.empty.title')}</p>
            <p>{t('friends.search.empty.try')}</p>
            <ul>
              <li>{t('friends.search.empty.checkSpelling')}</li>
              <li>{t('friends.search.empty.prefix')}</li>
              <li>{t('friends.search.empty.fullEmail')}</li>
            </ul>
          </div>
        ) : (
          searchResults.map(user => (
            <div key={user.id} className="friends-list__user-card">
              <div className="friends-list__friend-avatar">
                {user.avatarUrl && user.avatarUrl.trim() !== '' ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.nickname}
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="friends-list__avatar-placeholder">
                    {user.nickname?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="friends-list__friend-info">
                {/* 第一行：名稱 */}
                <div className="friends-list__friend-name">{user.nickname}</div>
                {/* 第二行：分數 + 按鈕 */}
                <div className="friends-list__friend-info-row">
                  <div className="friends-list__friend-score">
                    {user.ladderScore}
                    {t('community.ui.pointsUnit')}
                  </div>
                  <div className="friends-list__friend-actions">
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
                    className="friends-list__btn-add"
                    onClick={() => sendFriendRequest(user.id)}
                                          disabled={loading || (userData?.friends?.length || friendsList.length) >= 100}
                     title={(userData?.friends?.length || friendsList.length) >= 100 ? t('community.messages.friendLimitReached') : ''}
                   >
                     {(userData?.friends?.length || friendsList.length) >= 100 ? '已達上限' : t('community.friend.add')}
                  </button>
                )}
                  </div>
                </div>
                {/* 第三行：信箱 */}
                <div className="friends-list__friend-email">{user.email}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // 渲染挑戰標籤頁
  const renderChallengesTab = useCallback(() => {
    // 只在開發環境下輸出日誌，避免頻繁日誌
    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 渲染挑戰標籤頁:', {
        selectedFriend,
        challengesCount: challenges.length,
        activeTab,
      });
    }

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
                    // setMessages([]); // 移除這行
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
              {/* 挑戰留言板內容 */}
              <div className="challenge-board">
                <h4>{t('friends.challenge.boardTitle')}</h4>
                <div className="challenge-types">
                  {challengeTypes.map(type => (
                    <button
                      key={type.id}
                      className={`challenge-type-btn ${
                        selectedChallengeType === type.id ? 'active' : ''
                      }`}
                      onClick={() => setSelectedChallengeType(type.id)}
                    >
                      {type.icon} {t(`friends.challenge.types.${type.id}`)}
                    </button>
                  ))}
                </div>
                <div className="challenge-input-container">
                  <textarea
                    placeholder={t('friends.challenge.inputPlaceholder', {
                      example:
                        challengeTypes.find(
                          type => type.id === selectedChallengeType
                        )?.examples[0] || 'challenge',
                    })}
                    value={challengeInput}
                    onChange={e => setChallengeInput(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChallenge();
                      }
                    }}
                  />
                  <button
                    onClick={sendChallenge}
                    disabled={!challengeInput.trim()}
                  >
                    {t('friends.challenge.publish')}
                  </button>
                </div>
                <div className="challenge-list">
                  {/* 過期挑戰更新提示 */}
                  {challenges.some(c => c.isClientExpired) && (
                    <div
                      style={{
                        background: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '15px',
                        fontSize: '14px',
                        color: '#856404',
                      }}
                    >
                      <p style={{ margin: '0 0 8px 0' }}>
                        {t('friends.challenge.expiredWarning')}
                      </p>
                      <button
                        onClick={() => {
                          const expiredChallenges = challenges.filter(
                            c => c.isClientExpired
                          );
                          batchUpdateExpiredChallenges(expiredChallenges);
                          // 移除客戶端過期標記
                          setChallenges(prev =>
                            prev.map(c => ({ ...c, isClientExpired: false }))
                          );
                        }}
                        style={{
                          background: '#ffc107',
                          color: '#212529',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        {t('friends.challenge.updateExpired')}
                      </button>
                    </div>
                  )}

                  {challenges.length === 0 ? (
                    <div className="empty-state">
                      <p>{t('friends.challenge.empty.title')}</p>
                      <p>{t('friends.challenge.empty.subtitle')}</p>
                    </div>
                  ) : (
                    challenges.map(challenge => (
                      <div key={challenge.id} className="challenge-item">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '10px',
                          }}
                        >
                          <span
                            style={{ fontSize: '18px', marginRight: '10px' }}
                          >
                            {challenge.type.icon}
                          </span>
                          <span
                            style={{ fontWeight: 'bold', fontSize: '16px' }}
                          >
                            {challenge.type.name}
                          </span>
                        </div>
                        <div className="challenge-content">
                          {challenge.challenge}
                        </div>
                        <div className="challenge-meta">
                          <span>
                            {challenge.fromUserNickname}{' '}
                            {t('friends.challenge.publishedBy')}{' '}
                            {new Date(challenge.timestamp).toLocaleDateString()}
                          </span>
                          <span
                            style={{
                              color: challengeStatus[challenge.status].color,
                              fontWeight: 'bold',
                            }}
                          >
                            {challengeStatus[challenge.status].icon}{' '}
                            {challengeStatus[challenge.status].label}
                          </span>
                        </div>

                        {/* 挑戰回應按鈕 - 只有接收方且狀態為pending時顯示 */}
                        {challenge.toUserId === auth.currentUser.uid &&
                          challenge.status === 'pending' && (
                            <div className="challenge-actions">
                              <button
                                className="btn-accept"
                                onClick={() =>
                                  respondToChallenge(challenge.id, 'accepted')
                                }
                              >
                                ✅ {t('friends.challenge.accept')}
                              </button>
                              <button
                                className="btn-decline"
                                onClick={() =>
                                  respondToChallenge(challenge.id, 'declined')
                                }
                              >
                                ❌ {t('friends.challenge.reject')}
                              </button>
                            </div>
                          )}

                        {/* 完成挑戰按鈕 - 只有發起方且狀態為accepted時顯示 */}
                        {challenge.fromUserId === auth.currentUser.uid &&
                          challenge.status === 'accepted' && (
                            <div className="challenge-actions">
                              <button
                                className="btn-complete"
                                onClick={() =>
                                  respondToChallenge(challenge.id, 'completed')
                                }
                              >
                                🏆 {t('friends.challenge.complete')}
                              </button>
                            </div>
                          )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 移除浮動輸入框容器 */}
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
              {t('friends.challenge.selectFriend.title')}
            </p>
            <p style={{ fontSize: '14px', color: '#999' }}>
              {t('friends.challenge.selectFriend.subtitle')}
            </p>
          </div>
        )}
      </div>
    );
  }, [
    selectedFriend,
    activeTab,
    challengeTypes,
    selectedChallengeType,
    challengeInput,
    challenges,
    challengeStatus,
    batchUpdateExpiredChallenges,
    respondToChallenge,
    sendChallenge,
    t,
  ]);

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1>{t('friends.title')}</h1>

        {/* 狀態訊息 */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
      </div>

      {/* 標籤導航 - 只在非挑戰模式下顯示 */}
      {activeTab !== 'challenges' && (
        <div className="tab-navigation">
          <div
            className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <span className="tab-label">
              {t('friends.tabs.friends')} ({friendsList.length})
            </span>
          </div>
          <div
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <span className="tab-label">
              {t('friends.tabs.requests')}{' '}
              {friendRequests.length > 0 && `(${friendRequests.length})`}
            </span>
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
            <span className="tab-label">{t('friends.tabs.search')}</span>
          </div>
        </div>
      )}

      {/* 內容區域 */}
      <div className="tab-content">
        {loading && <div className="loading">{t('common.loading')}</div>}

        {activeTab === 'friends' && renderFriendsTab()}
        {activeTab === 'requests' && renderRequestsTab()}
        {activeTab === 'search' && renderSearchTab()}
        {activeTab === 'challenges' && renderChallengesTab()}
      </div>
    </div>
  );
};

export default Friends;
