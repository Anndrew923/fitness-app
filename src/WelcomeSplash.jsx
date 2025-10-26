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
    // 使用更穩定的進度更新方式
    let progressValue = 0;
    const updateProgress = () => {
      progressValue += Math.random() * 8 + 7; // 更穩定的增量
      if (progressValue >= 100) {
        progressValue = 100;
        setProgress(100);
        return;
      }
      setProgress(progressValue);

      // 使用 requestAnimationFrame 替代 setInterval
      if (progressValue < 100) {
        requestAnimationFrame(updateProgress);
      }
    };

    // 延遲開始進度更新
    const startProgress = setTimeout(() => {
      updateProgress();
    }, 200);

    // 2.5秒後跳轉（給更多時間）
    const timer = setTimeout(() => {
      setIsLoading(false);
      // 檢查用戶登入狀態，決定跳轉目標
      if (auth.currentUser) {
        navigate('/user-info');
      } else {
        navigate('/landing');
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(startProgress);
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
