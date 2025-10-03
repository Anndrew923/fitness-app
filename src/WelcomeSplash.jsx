import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from './firebase';
import './WelcomeSplash.css';

function WelcomeSplash() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 模擬載入進度
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // 2秒後跳轉到首頁
    const timer = setTimeout(() => {
      setIsLoading(false);
      // 檢查用戶登入狀態，決定跳轉目標
      if (auth.currentUser) {
        navigate('/user-info');
      } else {
        navigate('/landing');
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  return (
    <div className="welcome-splash">
      {/* 背景動畫 */}
      <div className="splash-background">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* 主要內容 - 只保留讀條 */}
      <div className="splash-content">
        {/* 載入進度 */}
        <div className="loading-container">
          <div className="loading-bar">
            <div
              className="loading-progress"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(WelcomeSplash);
