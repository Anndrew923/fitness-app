import { useTranslation } from 'react-i18next';

function About() {
  const { i18n } = useTranslation();
  const isZh = i18n.language && i18n.language.toLowerCase().startsWith('zh');

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
        {isZh ? '關於 Ultimate Physique' : 'About Ultimate Physique'}
      </h1>
      <p style={{ lineHeight: 1.8, color: '#444' }}>
        {isZh
          ? 'Ultimate Physique（最強肉體）是一款以科學化指標為核心的健身評測應用，提供力量、爆發力、心肺、肌肉量與體脂等指標的自我檢測與追蹤。目標是協助你以簡單清楚的方式了解自身狀態並持續進步。'
          : 'Ultimate Physique is a fitness assessment app built on science-based metrics. It helps you assess and track strength, explosive power, cardio endurance, muscle mass, and body fat, so you can understand your current status and keep improving.'}
      </p>
    </div>
  );
}

export default About;
