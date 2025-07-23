import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useUser } from '../UserContext';
import { getGuestData, saveGuestData, clearGuestData } from '../utils';
import './GuestMode.css';

const GuestMode = ({ onComplete, onRegister }) => {
  const { userData, setUserData } = useUser();
  const [isGuest, setIsGuest] = useState(false);
  const [guestData, setGuestData] = useState(null);

  useEffect(() => {
    // 檢查是否為訪客模式
    const guestData = getGuestData();
    if (guestData) {
      setGuestData(guestData);
      setIsGuest(true);
      // 將訪客資料載入到 UserContext
      setUserData(guestData);
    }
  }, [setUserData]);

  const startGuestMode = () => {
    const initialGuestData = {
      gender: '',
      height: 0,
      weight: 0,
      age: 0,
      nickname: '訪客用戶',
      avatarUrl: '',
      ageGroup: '',
      friends: [],
      friendRequests: [],
      blockedUsers: [],
      ladderScore: 0,
      ladderRank: 0,
      ladderHistory: [],
      isGuest: true,
      lastActive: new Date().toISOString(),
      scores: {
        strength: 0,
        explosivePower: 0,
        cardio: 0,
        muscleMass: 0,
        bodyFat: 0,
      },
      history: [],
      testInputs: {},
    };

    setGuestData(initialGuestData);
    setIsGuest(true);
    setUserData(initialGuestData);
    saveGuestData(initialGuestData);

    // 導航到用戶資料頁面
    window.location.href = '/user-info';
  };

  const handleRegister = () => {
    if (guestData) {
      // 將訪客資料傳遞給註冊流程
      onRegister(guestData);
    }
  };

  const handleComplete = data => {
    if (isGuest) {
      // 更新訪客資料
      const updatedGuestData = {
        ...guestData,
        ...data,
        lastActive: new Date().toISOString(),
      };
      setGuestData(updatedGuestData);
      setUserData(updatedGuestData);
      saveGuestData(updatedGuestData);
    }
    onComplete(data);
  };

  const exitGuestMode = () => {
    setIsGuest(false);
    setGuestData(null);
    clearGuestData();
    setUserData({
      gender: '',
      height: 0,
      weight: 0,
      age: 0,
      nickname: '',
      avatarUrl: '',
      ageGroup: '',
      friends: [],
      friendRequests: [],
      blockedUsers: [],
      ladderScore: 0,
      ladderRank: 0,
      ladderHistory: [],
      isGuest: false,
      lastActive: new Date().toISOString(),
      scores: {
        strength: 0,
        explosivePower: 0,
        cardio: 0,
        muscleMass: 0,
        bodyFat: 0,
      },
      history: [],
      testInputs: {},
    });
  };

  if (!isGuest) {
    return (
      <div className="guest-mode">
        <div className="guest-mode__container">
          <div className="guest-mode__header">
            <h2>歡迎使用最強肉體</h2>
            <p>您可以選擇註冊帳號或直接體驗</p>
          </div>

          <div className="guest-mode__options">
            <button
              className="guest-mode__btn guest-mode__btn--primary"
              onClick={startGuestMode}
            >
              立即體驗（訪客模式）
            </button>

            <div className="guest-mode__divider">
              <span>或</span>
            </div>

            <button
              className="guest-mode__btn guest-mode__btn--secondary"
              onClick={() => onRegister()}
            >
              註冊帳號
            </button>
          </div>

          <div className="guest-mode__info">
            <p>訪客模式功能：</p>
            <ul>
              <li>✓ 完整體驗所有評測功能</li>
              <li>✓ 本地儲存評測結果</li>
              <li>✓ 隨時可註冊同步資料</li>
              <li>⚠ 無法使用好友、天梯等社交功能</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guest-mode__banner">
      <div className="guest-mode__banner-content">
        <span className="guest-mode__banner-text">
          訪客模式 - 您的資料僅儲存在本地
        </span>
        <div className="guest-mode__banner-actions">
          <button className="guest-mode__banner-btn" onClick={handleRegister}>
            註冊同步
          </button>
          <button
            className="guest-mode__banner-btn guest-mode__banner-btn--exit"
            onClick={exitGuestMode}
          >
            退出
          </button>
        </div>
      </div>
    </div>
  );
};

GuestMode.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
};

export default GuestMode;
