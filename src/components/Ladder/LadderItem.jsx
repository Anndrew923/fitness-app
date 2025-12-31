import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { formatScore } from '../../utils.js';
import { recalculateSMMScore } from '../../utils/calculateSMMScore';
import './LadderItem.css';

/**
 * LadderItem - Single row component for ladder list
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const LadderItem = React.memo(
  ({
    user,
    rank,
    isCurrentUser,
    onUserClick,
    onToggleLike,
    isLiked,
    isLikeProcessing,
    displayMode = 'ladderScore',
    filterProject = 'total',
  }) => {
    const { t } = useTranslation();

    const getRankBadge = rank => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      if (rank <= 10) return '🏆';
      if (rank <= 50) return '⭐';
      return '';
    };

    const getAgeGroupLabel = ageGroup => {
      if (!ageGroup) return t('ladder.ageGroups.unknown');
      return t(`ladder.ageGroups.${ageGroup}`) || ageGroup;
    };

    const formatLastUpdate = timestamp => {
      if (!timestamp) return '未知';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return '剛剛';
      if (diffMins < 60) return `${diffMins}分鐘前`;
      if (diffHours < 24) return `${diffHours}小時前`;
      if (diffDays < 7) return `${diffDays}天前`;
      return date.toLocaleDateString('zh-TW');
    };

    const handleLikeClick = e => {
      e.stopPropagation();
      if (!isLikeProcessing && onToggleLike) {
        onToggleLike(user.id, e);
      }
    };

    // Get display value, unit, and label based on displayMode
    const getDisplayMetrics = () => {
      switch (displayMode) {
        case 'stats_totalLoginDays':
          return {
            value: user.stats_totalLoginDays || 0,
            unit: '天',
            label: '累計天數',
            icon: '🔥',
            formatValue: val => Math.floor(val).toLocaleString('zh-TW'),
          };
        case 'stats_sbdTotal':
          // Check if filtering by specific lift
          if (filterProject === 'total_five') {
            const fiveItemTotal =
              (user.stats_sbdTotal || 0) +
              (user.stats_ohp || 0) +
              (user.stats_latPull || 0);
            return {
              value: fiveItemTotal,
              unit: 'kg',
              label: t('ladder.filter.totalFive'),
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'squat') {
            return {
              value: user.stats_squat || 0,
              unit: 'kg',
              label: t('tests.strengthExercises.squat'),
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'bench') {
            return {
              value: user.stats_bench || 0,
              unit: 'kg',
              label: t('tests.strengthExercises.benchPress'),
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'deadlift') {
            return {
              value: user.stats_deadlift || 0,
              unit: 'kg',
              label: t('tests.strengthExercises.deadlift'),
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'ohp') {
            return {
              value: user.stats_ohp || 0,
              unit: 'kg',
              label: t('tests.strengthExercises.shoulderPress'),
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'latPull') {
            return {
              value: user.stats_latPull || 0,
              unit: 'kg',
              label: t('tests.strengthExercises.latPulldown'),
              formatValue: val => Number(val).toFixed(1),
            };
          }
          // Default: show total
          return {
            value: user.stats_sbdTotal || 0,
            unit: 'kg',
            label: user.weight
              ? `BW: ${user.weight}kg`
              : t('tests.strengthLabels.maxStrength', 'SBD 總和'),
            formatValue: val => Number(val).toFixed(1),
          };
        case 'stats_bodyFat':
          // Body Fat / FFMI: Check project filter
          if (filterProject === 'ffmi') {
            return {
              value: user.stats_ffmi || 0,
              unit: '',
              label: t('tests.ffmiLabels.ffmi'),
              formatValue: val => Number(val).toFixed(2),
            };
          }
          // Default: Body Fat %
          return {
            value: user.stats_bodyFat || 0,
            unit: '%',
            label: '體脂率',
            icon: '💧',
            formatValue: val => Number(val).toFixed(1),
          };
        case 'local_district':
          // Local district uses ladderScore for display
          return {
            value: user.ladderScore || 0,
            unit: t('community.ui.pointsUnit'),
            label: t('userInfo.profileCard.combatPower', '戰鬥力'),
            formatValue: val => formatScore(val),
          };
        case 'stats_cooper':
          // Endurance: Check project filter
          // ✅ Fix: Check for '5km' (matching config), NOT '5k'
          if (filterProject === '5km') {
            // Format 5K time: convert seconds to minutes:seconds
            const format5KTime = val => {
              if (!val || val === 0) return '0:00';
              const minutes = Math.floor(val / 60);
              const seconds = Math.floor(val % 60);
              return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            };

            if (rank <= 3) {
              // Only log top 3 to reduce noise
              console.log(`🏃 5KM Data Check [Rank ${rank}]:`, {
                id: user.id,
                name: user.displayName,
                stats_5k: user.stats_5k,
                stats_5k_time: user.stats_5k_time,
                run_5km: user.scores?.run_5km, // Check nested score
                raw: user, // Dump full object if needed
              });
            }

            return {
              // ✅ Fix: Read 'stats_5k_time' or 'stats_5k' (seconds)
              value: user.stats_5k_time || user.stats_5k || 0,
              unit: 'mins',
              label: '5K Run',
              formatValue: format5KTime,
            };
          }

          // ... existing default Cooper logic ...
          // Default: Cooper Test (distance in meters, convert to km)
          return {
            value: user.stats_cooper || 0,
            unit: 'km',
            label: 'Cooper Test',
            formatValue: val => (Number(val) / 1000).toFixed(2),
          };
        case 'stats_vertical':
          // Power: Check project filter
          if (filterProject === 'broad') {
            return {
              value: user.stats_broad || 0,
              unit: 'cm',
              label: t('tests.powerLabels.standingLongJump'),
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'sprint') {
            return {
              value: user.stats_100m || 0,
              unit: 's',
              label: t('tests.powerLabels.sprint'),
              formatValue: val => Number(val).toFixed(2),
            };
          }
          // Default: Vertical Jump
          return {
            value: user.stats_vertical || 0,
            unit: 'cm',
            label: t('tests.powerLabels.verticalJump'),
            formatValue: val => Number(val).toFixed(1),
          };
        case 'stats_ffmi':
          // Muscle Mass: Check project filter (score, weight, ratio)
          if (filterProject === 'score') {
            // SMM 分数：从 scores.muscleMass 读取
            // ✅ 终极修复：使用数值转换后的宽松判断，处理字符串类型
            const storedScore = user.scores?.muscleMass;
            const numStoredScore = Number(storedScore);
            const isSuspicious100 =
              !isNaN(numStoredScore) && Math.abs(numStoredScore - 100) < 0.1;
            const hasSmm =
              user.stats_smm > 0 || user.testInputs?.muscle?.smm > 0;
            const hasWeight = user.weight > 0;
            const hasData = hasSmm && hasWeight;

            // 诊断：检查显示 100 分的用户
            if (isSuspicious100) {
              const displayName =
                user.displayName ||
                user.nickname ||
                user.email?.split('@')[0] ||
                'Unknown';
              if (
                displayName === 'Melody' ||
                displayName === 'Feynman0418' ||
                displayName.includes('Melody') ||
                displayName.includes('Feynman')
              ) {
                console.log('🔍 Bug User Diagnostic (LadderItem):', {
                  displayName,
                  storedScore,
                  storedScoreType: typeof storedScore,
                  numStoredScore,
                  isSuspicious100,
                  stats_smm: user.stats_smm,
                  weight: user.weight,
                  hasSmm,
                  hasWeight,
                  hasData,
                  testInputs_muscle: user.testInputs?.muscle,
                  scores: user.scores,
                });
              }
            }

            let displayScore = 0;

            // ✅ Kill Switch: 如果存储分数为 100（无论类型），必须处理（不能 fallback 回 100）
            if (isSuspicious100) {
              // 情况 A: 有数据，尝试重算
              if (hasSmm && hasWeight) {
                const recalculatedScore = recalculateSMMScore(user);

                if (recalculatedScore !== null && recalculatedScore !== 100) {
                  // 重算成功，使用新分数
                  displayScore = recalculatedScore;
                  const displayName =
                    user.displayName ||
                    user.nickname ||
                    user.email?.split('@')[0] ||
                    'Unknown';
                  console.log(
                    `✅ 强制重算成功: ${displayName} - 从 100 分重算为 ${recalculatedScore} 分`
                  );
                } else if (recalculatedScore === null) {
                  // 重算失败（缺少数据），强制显示为 --
                  displayScore = null;
                  const displayName =
                    user.displayName ||
                    user.nickname ||
                    user.email?.split('@')[0] ||
                    'Unknown';
                  console.warn(
                    `⚠️ 强制重算失败: ${displayName} - 缺少必要数据，显示为 --`
                  );
                } else {
                  // 重算结果仍为 100，使用原值（可能是真实 100 分）
                  displayScore = storedScore;
                }
              } else {
                // 情况 B: 无数据，强制归零（Kill Switch）
                displayScore = null;
                const displayName =
                  user.displayName ||
                  user.nickname ||
                  user.email?.split('@')[0] ||
                  'Unknown';
                console.warn(
                  `🚫 Kill Switch 触发: ${displayName} - muscleMass=100 但缺少必要数据，强制显示为 --`
                );
              }
            } else if (storedScore !== undefined && storedScore !== null) {
              // 正常情况：非 100 分，直接使用存储值
              const numScore = Number(storedScore);
              if (!isNaN(numScore) && isFinite(numScore)) {
                displayScore = numScore;
              }
            }

            // ✅ 显示层强制拦截：即使排序逻辑漏了，UI 层也要拦截
            const finalDisplayScore = displayScore;
            const finalNumScore = Number(finalDisplayScore);
            const isFinalSuspicious100 =
              !isNaN(finalNumScore) && Math.abs(finalNumScore - 100) < 0.1;
            const finalHasData =
              user.stats_smm > 0 ||
              user.testInputs?.muscle?.smm > 0 ||
              user.weight > 0;

            // 强制拦截：如果是可疑的 100 分且没有数据，直接显示为 --
            if (isFinalSuspicious100 && !finalHasData) {
              const displayName =
                user.displayName ||
                user.nickname ||
                user.email?.split('@')[0] ||
                'Unknown';
              console.warn(
                `🛡️ 显示层强制拦截: ${displayName} - 检测到可疑 100 分且无数据，强制显示为 --`
              );
              return {
                value: null,
                unit: t('community.ui.pointsUnit', '分'),
                label: t('tests.muscleLabels.smmScore', '骨骼肌分數'),
                formatValue: () => '--',
              };
            }

            return {
              value: displayScore,
              unit: t('community.ui.pointsUnit', '分'),
              label: t('tests.muscleLabels.smmScore', '骨骼肌分數'),
              formatValue: val => {
                // 如果值为 null、undefined、0 或无效，显示为 --
                if (val === null || val === undefined) return '--';
                const numVal = Number(val);
                if (isNaN(numVal) || !isFinite(numVal) || numVal === 0)
                  return '--';
                return numVal.toFixed(2);
              },
            };
          } else if (filterProject === 'weight') {
            // SMM 重量：从 stats_smm 读取
            return {
              value: user.stats_smm || 0,
              unit: 'kg',
              label: t('tests.muscleLabels.smmKg', '骨骼肌重'),
              formatValue: val => Number(val).toFixed(1),
            };
          } else if (filterProject === 'ratio') {
            // SMM 比率：计算 (smm / weight) * 100
            // ✅ 修复：防止除以零导致的 Infinity/NaN
            const smm = Number(user.stats_smm) || 0;
            const weight = Number(user.weight) || 0;

            // 防御性检查：如果缺少必要数据，返回 0
            if (!smm || !weight || weight <= 0) {
              return {
                value: 0,
                unit: '%',
                label: t('tests.muscleLabels.smPercentShort', '骨骼肌率'),
                formatValue: val => {
                  const numVal = Number(val);
                  if (isNaN(numVal) || numVal === 0) return '--';
                  return numVal.toFixed(1);
                },
              };
            }

            // 安全计算：确保不会产生 Infinity 或 NaN
            const ratio = (smm / weight) * 100;
            const safeRatio = isFinite(ratio) && !isNaN(ratio) ? ratio : 0;

            return {
              value: safeRatio,
              unit: '%',
              label: t('tests.muscleLabels.smPercentShort', '骨骼肌率'),
              formatValue: val => {
                const numVal = Number(val);
                if (isNaN(numVal) || !isFinite(numVal) || numVal === 0)
                  return '--';
                return numVal.toFixed(1);
              },
            };
          }
          // Default: SMM 分数
          // ✅ 终极修复：使用数值转换后的宽松判断，处理字符串类型
          const storedScore = user.scores?.muscleMass;
          const numStoredScore = Number(storedScore);
          const isSuspicious100 =
            !isNaN(numStoredScore) && Math.abs(numStoredScore - 100) < 0.1;
          const hasSmm = user.stats_smm > 0 || user.testInputs?.muscle?.smm > 0;
          const hasWeight = user.weight > 0;
          const hasData = hasSmm && hasWeight;

          let displayScore = 0;

          if (isSuspicious100) {
            // 情况 A: 有数据，尝试重算
            if (hasSmm && hasWeight) {
              const recalculatedScore = recalculateSMMScore(user);

              if (recalculatedScore !== null && recalculatedScore !== 100) {
                displayScore = recalculatedScore;
              } else if (recalculatedScore === null) {
                displayScore = null;
              } else {
                displayScore = storedScore;
              }
            } else {
              // 情况 B: 无数据，强制归零（Kill Switch）
              displayScore = null;
              const displayName =
                user.displayName ||
                user.nickname ||
                user.email?.split('@')[0] ||
                'Unknown';
              console.warn(
                `🚫 Kill Switch 触发: ${displayName} - muscleMass=100 但缺少必要数据，强制显示为 --`
              );
            }
          } else if (storedScore !== undefined && storedScore !== null) {
            // 正常情况：非 100 分，直接使用存储值
            const numScore = Number(storedScore);
            if (!isNaN(numScore) && isFinite(numScore)) {
              displayScore = numScore;
            }
          }

          // ✅ 显示层强制拦截：即使排序逻辑漏了，UI 层也要拦截
          const finalDisplayScore = displayScore;
          const finalNumScore = Number(finalDisplayScore);
          const isFinalSuspicious100 =
            !isNaN(finalNumScore) && Math.abs(finalNumScore - 100) < 0.1;
          const finalHasData =
            user.stats_smm > 0 ||
            user.testInputs?.muscle?.smm > 0 ||
            user.weight > 0;

          // 强制拦截：如果是可疑的 100 分且没有数据，直接显示为 --
          if (isFinalSuspicious100 && !finalHasData) {
            const displayName =
              user.displayName ||
              user.nickname ||
              user.email?.split('@')[0] ||
              'Unknown';
            console.warn(
              `🛡️ 显示层强制拦截 (默认): ${displayName} - 检测到可疑 100 分且无数据，强制显示为 --`
            );
            return {
              value: null,
              unit: t('community.ui.pointsUnit', '分'),
              label: t('tests.muscleLabels.smmScore', '骨骼肌分數'),
              formatValue: () => '--',
            };
          }

          return {
            value: displayScore,
            unit: t('community.ui.pointsUnit', '分'),
            label: t('tests.muscleLabels.smmScore', '骨骼肌分數'),
            formatValue: val => {
              if (val === null || val === undefined) return '--';
              const numVal = Number(val);
              if (isNaN(numVal) || !isFinite(numVal) || numVal === 0)
                return '--';
              return numVal.toFixed(2);
            },
          };
        case 'armSize': {
          // 🔥 修正：從 record_arm_girth 讀取所有數據
          const armSizeRecord = user.record_arm_girth || {};
          const armSizeScore = armSizeRecord.score || 0;
          const armSizeValue = armSizeRecord.value || 0;
          const bodyFatValue = armSizeRecord.bodyFat || 0;

          // 如果 record_arm_girth 沒有數據，fallback 到 testInputs（向後兼容）
          const fallbackInputs = user.testInputs?.armSize;
          const finalArmSize =
            armSizeValue || fallbackInputs?.arm || fallbackInputs?.armSize || 0;
          const finalBodyFat = bodyFatValue || fallbackInputs?.bodyFat || 0;
          const finalScore = armSizeScore || fallbackInputs?.score || 0;

          return {
            value: finalScore,
            unit: t('community.ui.pointsUnit'),
            label:
              finalArmSize && finalBodyFat
                ? `${Number(finalArmSize).toFixed(1)} cm / ${Number(
                    finalBodyFat
                  ).toFixed(1)}%`
                : 'N/A',
            formatValue: val => formatScore(val),
            // 添加副信息显示标志
            showSubInfo: true,
            subInfo:
              finalArmSize && finalBodyFat
                ? `${Number(finalArmSize).toFixed(1)} cm / ${Number(
                    finalBodyFat
                  ).toFixed(1)}%`
                : null,
          };
        }
        case 'ladderScore':
        default:
          return {
            value: user.ladderScore || 0,
            unit: t('community.ui.pointsUnit'),
            label: t('userInfo.profileCard.combatPower', '戰鬥力'),
            formatValue: val => formatScore(val),
          };
      }
    };

    const displayMetrics = getDisplayMetrics();

    // Modular badge system - returns array of active badges sorted by priority
    const getBadges = user => {
      const badges = [];

      // Priority 1: Verification (Highest Priority - always closest to name)
      if (!user.isAnonymous && user.isVerified) {
        badges.push({
          id: 'verified',
          icon: '🏅',
          text: '已認證',
          className: 'badge-verified',
          title: '榮譽認證',
        });
      }

      // Priority 2: 1000lb Club
      if (!user.isAnonymous && user.stats_sbdTotal >= 453.6) {
        badges.push({
          id: '1k',
          icon: '🏆',
          text: '1000lb',
          shortText: '1K',
          className: 'badge-1000lb',
          title: '1000lb Club',
        });
      }

      // Future badges can be added here with priority order

      return badges;
    };

    const badges = getBadges(user);

    return (
      <div
        id={`user-row-${user.id}`}
        data-user-id={user.id}
        className={`ladder__item ${
          isCurrentUser ? 'ladder__item--current-user' : ''
        } ${!user.isAnonymous ? 'clickable' : ''}`}
        style={{
          ...(isCurrentUser
            ? {
                background:
                  'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.1) 100%)',
                borderLeft: '4px solid #ff6b35',
                fontWeight: '600',
              }
            : {}),
        }}
        onClick={!user.isAnonymous ? e => onUserClick?.(user, e) : undefined}
        title={!user.isAnonymous ? t('ladder.tooltips.viewTraining') : ''}
      >
        <div className="ladder__rank">
          <span
            className={`ladder__rank-number ${
              isCurrentUser ? 'rank-changing' : ''
            }`}
          >
            {rank}
          </span>
          <span className="ladder__rank-badge">{getRankBadge(rank)}</span>
        </div>

        <div className="ladder__user">
          <div
            className="ladder__avatar"
            style={{
              // 1. STRICT Box Model
              boxSizing: 'border-box',

              // 2. THE IRONCLAD FLEX LOCK (The most important part)
              // flex-grow: 0 (Don't grow)
              // flex-shrink: 0 (NEVER shrink)
              // flex-basis: 40px (Always start at 40px)
              flex: '0 0 40px',

              // 3. Explicit Dimensions (Redundant but necessary for safety)
              width: '40px',
              height: '40px',

              // 4. Perfect Circle Styling
              borderRadius: '50%',
              overflow: 'hidden',

              // 5. Placeholder & Layout Styling
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px', // Add spacing between avatar and name
            }}
          >
            {user.avatarUrl &&
            user.avatarUrl.trim() !== '' &&
            !user.isAnonymous ? (
              <img
                src={user.avatarUrl}
                alt="avatar"
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={e => {
                  e.target.style.display = 'none';
                  const placeholder = e.target.nextSibling;
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className={`ladder__avatar-placeholder ${
                user.isAnonymous ? 'anonymous' : ''
              }`}
              style={{
                width: '100%',
                height: '100%',
                display:
                  user.avatarUrl &&
                  user.avatarUrl.trim() !== '' &&
                  !user.isAnonymous
                    ? 'none'
                    : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user.isAnonymous
                ? '👤'
                : user.displayName.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="ladder__user-info">
            <div
              className={`ladder__user-name ${
                user.isAnonymous ? 'anonymous' : ''
              } ${isCurrentUser ? 'current-user-flame' : ''}`}
            >
              <div className="ladder__user-name-container">
                <span className="ladder__user-name-text">
                  {user.displayName}
                  {user.isAnonymous && ' 🔒'}
                </span>
                {badges.length > 0 && (
                  <div className="ladder__badges">
                    {badges.map(badge => (
                      <span
                        key={badge.id}
                        className={badge.className}
                        title={badge.title}
                      >
                        <span className="badge-icon">{badge.icon}</span>
                        {badge.id === '1k' ? (
                          <>
                            <span className="badge-label">{badge.text}</span>
                            <span className="badge-short-label">
                              {badge.shortText}
                            </span>
                          </>
                        ) : (
                          <span className="badge-label">{badge.text}</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="ladder__user-details">
              {user.isAnonymous ? (
                '匿名用戶'
              ) : (
                <>
                  {getAgeGroupLabel(user.ageGroup)} •{' '}
                  {user.gender === 'male'
                    ? t('userInfo.male')
                    : t('userInfo.female')}
                  {(user.lastLadderSubmission || user.lastActive) && (
                    <>
                      <br />
                      <span className="last-update">
                        {t('ladder.labels.updatedAt')}{' '}
                        {formatLastUpdate(
                          user.lastLadderSubmission || user.lastActive
                        )}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="ladder__score-section">
          <div className="ladder__score">
            <span className="ladder__score-value">
              {displayMetrics.icon && (
                <span className="ladder__score-icon">
                  {displayMetrics.icon}
                </span>
              )}
              {displayMetrics.formatValue(displayMetrics.value)}
            </span>
            <span className="ladder__score-label">{displayMetrics.unit}</span>
            <span className="ladder__score-sublabel">
              {displayMetrics.subInfo || displayMetrics.label}
            </span>
          </div>

          {user.isAnonymous ? (
            <div className="ladder__like-btn ladder__like-btn--placeholder">
              <span className="ladder__like-icon">👍</span>
              <span className="ladder__like-count">
                {user.ladderLikeCount || 0}
              </span>
            </div>
          ) : (
            <button
              className={`ladder__like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLikeClick}
              disabled={isLikeProcessing}
              title={isLiked ? t('ladder.unlike') : t('ladder.like')}
            >
              <span className="ladder__like-icon">👍</span>
              <span className="ladder__like-count">
                {user.ladderLikeCount || 0}
              </span>
            </button>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for React.memo
    const prevValue =
      prevProps.user[prevProps.displayMode || 'ladderScore'] || 0;
    const nextValue =
      nextProps.user[nextProps.displayMode || 'ladderScore'] || 0;

    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.rank === nextProps.rank &&
      prevProps.isCurrentUser === nextProps.isCurrentUser &&
      prevValue === nextValue &&
      prevProps.user.ladderLikeCount === nextProps.user.ladderLikeCount &&
      prevProps.isLiked === nextProps.isLiked &&
      prevProps.isLikeProcessing === nextProps.isLikeProcessing &&
      prevProps.displayMode === nextProps.displayMode &&
      // ✅ ADD THIS LINE:
      prevProps.filterProject === nextProps.filterProject
    );
  }
);

LadderItem.displayName = 'LadderItem';

LadderItem.propTypes = {
  user: PropTypes.object.isRequired,
  rank: PropTypes.number.isRequired,
  isCurrentUser: PropTypes.bool,
  onUserClick: PropTypes.func,
  onToggleLike: PropTypes.func,
  isLiked: PropTypes.bool,
  isLikeProcessing: PropTypes.bool,
  displayMode: PropTypes.string,
  filterProject: PropTypes.string,
};

export default LadderItem;
