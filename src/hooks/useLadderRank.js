import { useState, useCallback, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import logger from '../utils/logger';

export const useLadderRank = (userData, submittedLadderScore, db) => {
  const [userRank, setUserRank] = useState(null);

  // Rank Fetching Logic
  const fetchUserRank = useCallback(async () => {
    if (
      !userData?.userId ||
      !submittedLadderScore ||
      submittedLadderScore <= 0
    ) {
      setUserRank(null);
      return;
    }
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('ladderScore', 'desc'), limit(200));
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach(doc => {
        const docData = doc.data();
        if (docData.ladderScore > 0) {
          users.push({ id: doc.id, ...docData });
        }
      });
      const userIndex = users.findIndex(user => user.id === userData.userId);
      if (userIndex !== -1) {
        setUserRank(userIndex + 1);
      } else {
        setUserRank(null);
      }
    } catch (error) {
      logger.error('Fetch user rank failed:', error);
      setUserRank(null);
    }
  }, [userData?.userId, submittedLadderScore, db]);

  // Debounced Fetching
  const fetchUserRankRef = useRef(null);
  const lastFetchParamsRef = useRef({ userId: null, score: null });
  useEffect(() => {
    if (fetchUserRankRef.current) {
      if (window.cancelIdleCallback)
        cancelIdleCallback(fetchUserRankRef.current);
      else clearTimeout(fetchUserRankRef.current);
    }
    const userId = userData?.userId;
    const score = submittedLadderScore;
    if (
      lastFetchParamsRef.current.userId === userId &&
      lastFetchParamsRef.current.score === score
    ) {
      return;
    }
    lastFetchParamsRef.current = { userId, score };

    if (userId && score > 0) {
      if (window.requestIdleCallback) {
        fetchUserRankRef.current = requestIdleCallback(() => fetchUserRank(), {
          timeout: 2000,
        });
      } else {
        fetchUserRankRef.current = setTimeout(() => fetchUserRank(), 800);
      }
    }
    return () => {
      if (fetchUserRankRef.current) {
        if (window.cancelIdleCallback)
          cancelIdleCallback(fetchUserRankRef.current);
        else clearTimeout(fetchUserRankRef.current);
      }
    };
  }, [userData?.userId, submittedLadderScore, fetchUserRank]);

  return {
    userRank,
  };
};

