import { useTranslation } from 'react-i18next';

function Disclaimer() {
  const { i18n } = useTranslation();
  const isZh = i18n.language && i18n.language.toLowerCase().startsWith('zh');

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
        {isZh ? '免責聲明' : 'Disclaimer'}
      </h1>
      <p style={{ lineHeight: 1.8, color: '#444' }}>
        {isZh
          ? '本應用提供之內容與建議僅供健康與運動參考，並非醫療意見或診斷。請依自身狀況與專業醫療人員建議採取行動。使用本應用所產生之風險，使用者需自行承擔。'
          : 'The content and recommendations provided by this app are for health and fitness reference only and do not constitute medical advice or diagnosis. Act according to your own condition and consult professional medical personnel when necessary. You assume all risks arising from the use of this app.'}
      </p>
    </div>
  );
}

export default Disclaimer;
