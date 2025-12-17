import React from 'react';
import PropTypes from 'prop-types';

const SaveSuccessModal = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.container} onClick={e => e.stopPropagation()}>
        {/* Icon & Title */}
        <div style={styles.header}>
          <div style={styles.icon}>💾</div>
          <h3 style={styles.title}>戰果已封存</h3>
        </div>

        {/* Description */}
        <div style={styles.content}>
          <p style={styles.quote}>「今天的汗水，是明天的傳說。」</p>
          <p style={styles.text}>
            您的修練數據已成功寫入歷史卷軸。
            <br />
            隨時前往「成就」頁面，見證您的變強之路。
          </p>
        </div>

        {/* Actions */}
        <div style={styles.footer}>
          <button
            onClick={onClose}
            style={{ ...styles.button, ...styles.secondaryButton }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#4a5568';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            留在這裡
          </button>
          <button
            onClick={onNavigate}
            style={{ ...styles.button, ...styles.primaryButton }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#38a169';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#48BB78';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            前往成就 📜
          </button>
        </div>
      </div>

      {/* 動畫樣式 */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.95); /* ✅ 置頂組：動畫從上方滑入（向下移動） */
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1); /* ✅ 置頂組：動畫結束狀態包含 translateX(-50%) */
          }
        }
      `}</style>
    </div>
  );
};

// Styles - 內聯樣式以確保獨立性，不依賴外部 CSS
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10002, // 比一般 Modal 高一點
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start', // ✅ 置頂組：改為 flex-start，配合頂部定位
    paddingTop: '18%', // ✅ 置頂組：往上移動到 18%
    paddingBottom: 0,
  },
  container: {
    width: '90%', // ✅ UI 優化：留 5% 間距在兩側
    maxWidth: '340px', // ✅ UI 優化：限制最大寬度，避免在大螢幕上過寬
    backgroundColor: '#1E1E1E', // 深色背景
    borderRadius: '16px', // ✅ UI 優化：現代化圓角
    border: '2px solid #48BB78', // 綠色邊框代表成功
    padding: '24px 20px', // ✅ UI 優化：調整內邊距
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)', // ✅ UI 優化：更精緻的陰影效果
    animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'fixed', // ✅ 置頂組：保持 fixed 定位
    top: '18%', // ✅ 置頂組：往上移動到 18%（大頭貼下方，覆蓋「狂戰士」標籤區域）
    bottom: 'auto', // ✅ 置頂組：重置底部定位
    left: '50%',
    transform: 'translateX(-50%)', // ✅ 水平居中
    margin: 0, // ✅ 重置 margin
  },
  header: {
    textAlign: 'center',
    marginBottom: '15px',
    borderBottom: '1px solid rgba(72, 187, 120, 0.3)',
    paddingBottom: '15px',
  },
  icon: {
    fontSize: '40px',
    marginBottom: '10px',
  },
  title: {
    margin: 0,
    color: '#48BB78', // 成功綠
    fontSize: '22px',
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(72, 187, 120, 0.3)',
  },
  content: {
    marginBottom: '25px',
    textAlign: 'center',
  },
  quote: {
    color: '#E0E0E0',
    fontStyle: 'italic',
    marginBottom: '12px',
    fontSize: '15px',
    opacity: 0.9,
  },
  text: {
    color: '#A0AEC0',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
  },
  footer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    backgroundColor: '#48BB78',
    color: 'white',
    boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    border: '1px solid #718096',
    color: '#CBD5E0',
  },
};

SaveSuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default SaveSuccessModal;
