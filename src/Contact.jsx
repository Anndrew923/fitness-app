import { useTranslation } from 'react-i18next';

function Contact() {
  const { i18n } = useTranslation();
  const isZh = i18n.language && i18n.language.toLowerCase().startsWith('zh');

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
        {isZh ? '聯絡我們' : 'Contact Us'}
      </h1>
      <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '8px' }}>
        {isZh
          ? '若您對本應用有任何建議或合作洽詢，歡迎來信，我們會在 48 小時內回覆。'
          : 'For feedback or partnership inquiries, please email us and we will respond within 48 hours.'}
      </p>
      <p style={{ lineHeight: 1.8, color: '#444' }}>Email: topaj01@gmail.com</p>
    </div>
  );
}

export default Contact;
