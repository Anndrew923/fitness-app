import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminSystem from '../utils/adminSystem';
import BottomNavBar from '../components/BottomNavBar';
import './AdminPanel.css';

function AdminPanel() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('verification'); // 'verification', 'reports', 'actions'
  
  // 認證審核相關狀態
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [loadingVerification, setLoadingVerification] = useState(false);
  
  // 檢舉審核相關狀態
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  
  // 操作記錄相關狀態
  const [adminActions, setAdminActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState(false);
  
  // 審核操作狀態
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewType, setReviewType] = useState(null); // 'approve' | 'reject'
  const [reviewTarget, setReviewTarget] = useState(null); // 'verification' | 'report'

  // 檢查管理員權限
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await AdminSystem.checkAdminStatus();
        setIsAdmin(adminStatus);
        if (!adminStatus) {
          // 非管理員，重定向到首頁
          navigate('/user-info');
        }
      } catch (error) {
        console.error('檢查管理員權限失敗:', error);
        navigate('/user-info');
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  // 載入認證申請列表
  const loadVerificationRequests = async () => {
    setLoadingVerification(true);
    try {
      const requests = await AdminSystem.getPendingVerificationRequests(50);
      setVerificationRequests(requests);
    } catch (error) {
      console.error('載入認證申請失敗:', error);
    } finally {
      setLoadingVerification(false);
    }
  };

  // 載入檢舉列表
  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const reports = await AdminSystem.getPendingReports(50);
      setReports(reports);
    } catch (error) {
      console.error('載入檢舉列表失敗:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  // 載入操作記錄
  const loadAdminActions = async () => {
    setLoadingActions(true);
    try {
      const actions = await AdminSystem.getAdminActions(100);
      setAdminActions(actions);
    } catch (error) {
      console.error('載入操作記錄失敗:', error);
    } finally {
      setLoadingActions(false);
    }
  };

  // 切換標籤時載入對應資料
  useEffect(() => {
    if (!isAdmin) return;
    
    if (activeTab === 'verification') {
      loadVerificationRequests();
    } else if (activeTab === 'reports') {
      loadReports();
    } else if (activeTab === 'actions') {
      loadAdminActions();
    }
  }, [activeTab, isAdmin]);

  // 處理認證審核
  const handleVerificationReview = async (requestId, action) => {
    setReviewingId(requestId);
    setReviewType(action);
    setReviewTarget('verification');
    setReviewNotes('');
    setShowReviewModal(true);
  };

  // 處理檢舉審核
  const handleReportReview = async (reportId, action) => {
    setReviewingId(reportId);
    setReviewType(action);
    setReviewTarget('report');
    setReviewNotes('');
    setShowReviewModal(true);
  };

  // 提交審核結果
  const handleSubmitReview = async () => {
    if (!reviewingId || !reviewType || !reviewTarget) return;

    try {
      let result;
      if (reviewTarget === 'verification') {
        if (reviewType === 'approve') {
          result = await AdminSystem.approveVerificationRequest(reviewingId, reviewNotes);
        } else {
          result = await AdminSystem.rejectVerificationRequest(reviewingId, reviewNotes);
        }
      } else {
        if (reviewType === 'approve') {
          result = await AdminSystem.approveReport(reviewingId, reviewNotes);
        } else {
          result = await AdminSystem.rejectReport(reviewingId, reviewNotes);
        }
      }

      if (result.success) {
        alert(result.message);
        setShowReviewModal(false);
        // 重新載入列表
        if (reviewTarget === 'verification') {
          loadVerificationRequests();
        } else {
          loadReports();
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('提交審核失敗:', error);
      alert('操作失敗，請稍後再試');
    } finally {
      setReviewingId(null);
      setReviewType(null);
      setReviewTarget(null);
      setReviewNotes('');
    }
  };

  // 格式化時間
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-loading">載入中...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // 已重定向，不顯示內容
  }

  return (
    <>
      <div className="admin-panel">
        <div className="admin-container">
          <div className="admin-header">
            <h1>管理員系統</h1>
          </div>

          {/* 標籤導航 */}
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'verification' ? 'active' : ''}`}
              onClick={() => setActiveTab('verification')}
            >
              <span className="tab-icon">🏅</span>
              <span className="tab-text">認證審核</span>
              {verificationRequests.length > 0 && (
                <span className="tab-badge">{verificationRequests.length}</span>
              )}
            </button>
            <button
              className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="tab-icon">🚨</span>
              <span className="tab-text">檢舉審核</span>
              {reports.length > 0 && (
                <span className="tab-badge">{reports.length}</span>
              )}
            </button>
            <button
              className={`admin-tab ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              <span className="tab-icon">📋</span>
              <span className="tab-text">操作記錄</span>
            </button>
          </div>

          {/* 認證審核內容 */}
          {activeTab === 'verification' && (
            <div className="admin-content">
              <div className="admin-section-header">
                <h2>待審核認證申請</h2>
                <button onClick={loadVerificationRequests} disabled={loadingVerification}>
                  {loadingVerification ? '載入中...' : '重新整理'}
                </button>
              </div>
              
              {loadingVerification ? (
                <div className="admin-loading">載入中...</div>
              ) : verificationRequests.length === 0 ? (
                <div className="admin-empty">目前沒有待審核的申請</div>
              ) : (
                <div className="admin-list">
                  {verificationRequests.map((request) => (
                    <div key={request.id} className="admin-card">
                      <div className="card-header">
                        <div className="card-user-info">
                          <div className="user-avatar">
                            {request.userData?.avatarUrl ? (
                              <img src={request.userData.avatarUrl} alt="avatar" />
                            ) : (
                              <div className="avatar-placeholder">
                                {request.userData?.nickname?.[0] || 'U'}
                              </div>
                            )}
                          </div>
                          <div className="user-details">
                            <div className="user-name">
                              {request.userData?.nickname || '未設定暱稱'}
                            </div>
                            <div className="user-meta">
                              申請時間：{formatDate(request.createdAt)}
                            </div>
                            {request.userData?.ladderScore && (
                              <div className="user-meta">
                                天梯分數：{request.userData.ladderScore}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <div className="info-row">
                          <span className="info-label">申請編號：</span>
                          <span className="info-value">{request.applicationNumber || request.id}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">社群平台：</span>
                          <span className="info-value">
                            {typeof request.socialAccount === 'object' && request.socialAccount?.type
                              ? request.socialAccount.type === 'facebook'
                                ? 'Facebook'
                                : request.socialAccount.type === 'instagram'
                                ? 'Instagram'
                                : request.socialAccount.type
                              : request.socialPlatform || '-'}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">社群帳號：</span>
                          <span className="info-value">
                            {typeof request.socialAccount === 'object' && request.socialAccount?.account
                              ? request.socialAccount.account
                              : typeof request.socialAccount === 'string'
                              ? request.socialAccount
                              : '-'}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">影片連結：</span>
                          <a 
                            href={request.videoLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="info-link"
                          >
                            {request.videoLink || '-'}
                          </a>
                        </div>
                        {request.description && (
                          <div className="info-row">
                            <span className="info-label">備註：</span>
                            <span className="info-value">{request.description}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="card-actions">
                        <button
                          className="btn-approve"
                          onClick={() => handleVerificationReview(request.id, 'approve')}
                        >
                          ✅ 通過
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleVerificationReview(request.id, 'reject')}
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

          {/* 檢舉審核內容 */}
          {activeTab === 'reports' && (
            <div className="admin-content">
              <div className="admin-section-header">
                <h2>待審核檢舉</h2>
                <button onClick={loadReports} disabled={loadingReports}>
                  {loadingReports ? '載入中...' : '重新整理'}
                </button>
              </div>
              
              {loadingReports ? (
                <div className="admin-loading">載入中...</div>
              ) : reports.length === 0 ? (
                <div className="admin-empty">目前沒有待審核的檢舉</div>
              ) : (
                <div className="admin-list">
                  {reports.map((report) => (
                    <div key={report.id} className="admin-card">
                      <div className="card-header">
                        <div className="card-user-info">
                          <div className="user-avatar">
                            {report.reportedUserData?.avatarUrl ? (
                              <img src={report.reportedUserData.avatarUrl} alt="avatar" />
                            ) : (
                              <div className="avatar-placeholder">
                                {report.reportedUserData?.nickname?.[0] || 'U'}
                              </div>
                            )}
                          </div>
                          <div className="user-details">
                            <div className="user-name">
                              被檢舉：{report.reportedUserData?.nickname || '未設定暱稱'}
                            </div>
                            <div className="user-meta">
                              檢舉時間：{formatDate(report.createdAt)}
                            </div>
                            <div className="user-meta">
                              檢舉類型：{report.reportType === 'nickname' ? '暱稱' : 
                                        report.reportType === 'avatar' ? '頭像' : '兩者'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <div className="info-row">
                          <span className="info-label">檢舉原因：</span>
                          <span className="info-value">{report.reason || '-'}</span>
                        </div>
                        {report.description && (
                          <div className="info-row">
                            <span className="info-label">詳細描述：</span>
                            <span className="info-value">{report.description}</span>
                          </div>
                        )}
                        <div className="info-row">
                          <span className="info-label">檢舉者：</span>
                          <span className="info-value">
                            {report.reporterData?.nickname || report.reporterId}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button
                          className="btn-approve"
                          onClick={() => handleReportReview(report.id, 'approve')}
                        >
                          ✅ 通過
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReportReview(report.id, 'reject')}
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

          {/* 操作記錄內容 */}
          {activeTab === 'actions' && (
            <div className="admin-content">
              <div className="admin-section-header">
                <h2>管理員操作記錄</h2>
                <button onClick={loadAdminActions} disabled={loadingActions}>
                  {loadingActions ? '載入中...' : '重新整理'}
                </button>
              </div>
              
              {loadingActions ? (
                <div className="admin-loading">載入中...</div>
              ) : adminActions.length === 0 ? (
                <div className="admin-empty">目前沒有操作記錄</div>
              ) : (
                <div className="admin-list">
                  {adminActions.map((action) => (
                    <div key={action.id} className="admin-card action-card">
                      <div className="card-header">
                        <div className="action-type">
                          {action.action === 'approve_verification' && '✅ 通過認證'}
                          {action.action === 'reject_verification' && '❌ 拒絕認證'}
                          {action.action === 'approve_report' && '✅ 通過檢舉'}
                          {action.action === 'reject_report' && '❌ 拒絕檢舉'}
                          {action.action === 'delete_content' && '🗑️ 刪除內容'}
                          {!['approve_verification', 'reject_verification', 'approve_report', 'reject_report', 'delete_content'].includes(action.action) && action.action}
                        </div>
                        <div className="action-time">{formatDate(action.timestamp)}</div>
                      </div>
                      <div className="card-body">
                        <div className="info-row">
                          <span className="info-label">目標用戶：</span>
                          <span className="info-value">
                            {action.targetUserId || '-'}
                          </span>
                        </div>
                        {action.details && Object.keys(action.details).length > 0 && (
                          <div className="info-row">
                            <span className="info-label">詳情：</span>
                            <span className="info-value">
                              {JSON.stringify(action.details, null, 2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 審核模態框 */}
      {showReviewModal && (
        <div className="review-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {reviewType === 'approve' ? '通過' : '拒絕'}審核
              </h3>
              <button className="modal-close" onClick={() => setShowReviewModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <label>
                備註（選填）：
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="請輸入審核備註..."
                  rows={4}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowReviewModal(false)}>取消</button>
              <button
                className={reviewType === 'approve' ? 'btn-approve' : 'btn-reject'}
                onClick={handleSubmitReview}
              >
                確認{reviewType === 'approve' ? '通過' : '拒絕'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </>
  );
}

export default AdminPanel;

