import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LadderEmptyState.css';

const LadderEmptyState = ({ division }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getEmptyStateConfig = () => {
    switch (division) {
      case 'stats_sbdTotal':
        return {
          icon: '💪',
          title: t('ladder.empty.title', 'Position Vacant'),
          description: t('ladder.empty.desc.strength', '還沒有大力士來挑戰。你是全服最強壯的人嗎？'),
          buttonText: t('ladder.empty.button', '成為第一名'),
          link: '/strength',
        };
      case 'stats_ffmi':
        return {
          icon: '💪',
          title: t('ladder.empty.title', 'Position Vacant'),
          description: t('ladder.empty.desc.muscle', '尋找肌肉巨獸中... 快來秀出你的維度！'),
          buttonText: t('ladder.empty.button', '成為第一名'),
          link: '/body-fat',
        };
      case 'stats_cooper':
        return {
          icon: '🫁',
          title: t('ladder.empty.title', 'Position Vacant'),
          description: t('ladder.empty.desc.cardio', '跑道空蕩蕩的。去跑一場，讓大家看看你的背影！'),
          buttonText: t('ladder.empty.button', '成為第一名'),
          link: '/cardio',
        };
      case 'stats_vertical':
        return {
          icon: '⚡',
          title: t('ladder.empty.title', 'Position Vacant'),
          description: t('ladder.empty.desc.power', '爆發力排行榜等待第一位挑戰者！展現你的跳躍力！'),
          buttonText: t('ladder.empty.button', '成為第一名'),
          link: '/explosive-power',
        };
      case 'stats_bodyFat':
        return {
          icon: '🔥',
          title: t('ladder.empty.title', 'Position Vacant'),
          description: t('ladder.empty.desc.bodyFat', '極致體脂排行榜等待第一位挑戰者！展現你的自律！'),
          buttonText: t('ladder.empty.button', '成為第一名'),
          link: '/body-fat',
        };
      case 'stats_totalLoginDays':
        return {
          icon: '📅',
          title: t('ladder.empty.title', 'Position Vacant'),
          description: t('ladder.empty.desc.login', '自律狂人排行榜等待第一位挑戰者！開始你的連續登入之旅！'),
          buttonText: t('ladder.empty.buttonLogin', '開始登入'),
          link: '/user-info',
        };
      case 'local_district':
        return {
          icon: '📍',
          title: t('ladder.empty.title', 'Position Vacant'),
          description: t('ladder.empty.desc.local', '你的地區還沒有其他挑戰者。成為本地第一人！'),
          buttonText: t('ladder.empty.button', '成為第一名'),
          link: '/user-info',
        };
      default:
        return {
          icon: '🏆',
          title: t('ladder.empty.title', 'Position Vacant'),
          description: t('ladder.empty.desc.default', '目前尚無數據，快來搶佔第一名！'),
          buttonText: t('ladder.empty.button', '成為第一名'),
          link: '/user-info',
        };
    }
  };

  const config = getEmptyStateConfig();

  const handleButtonClick = () => {
    navigate(config.link);
  };

  return (
    <div className="ladder-empty-state">
      <div className="ladder-empty-state__icon">{config.icon}</div>
      <h3 className="ladder-empty-state__title">{config.title}</h3>
      <p className="ladder-empty-state__description">{config.description}</p>
      <button
        className="ladder-empty-state__button"
        onClick={handleButtonClick}
        style={{
          background: 'linear-gradient(to right, #111827 0%, #000000 100%)',
          backgroundImage: 'linear-gradient(to right, #111827 0%, #000000 100%)',
          color: '#fbbf24',
          border: '1px solid #f59e0b',
          borderColor: '#f59e0b',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3), 0 0 8px rgba(245, 158, 11, 0.2)',
        }}
      >
        {config.buttonText}
      </button>
    </div>
  );
};

LadderEmptyState.propTypes = {
  division: PropTypes.string.isRequired,
};

export default LadderEmptyState;

