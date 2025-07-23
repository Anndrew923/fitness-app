import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 中文語言包
const zhTW = {
  translation: {
    // 通用
    common: {
      loading: '載入中...',
      save: '儲存',
      cancel: '取消',
      confirm: '確認',
      back: '返回',
      next: '下一步',
      submit: '提交',
      edit: '編輯',
      delete: '刪除',
      search: '搜尋',
      filter: '篩選',
      all: '全部',
    },

    // 導航
    navigation: {
      home: '首頁',
      profile: '個人資料',
      history: '歷史紀錄',
      ladder: '天梯排行榜',
      friends: '好友',
      settings: '設定',
      logout: '登出',
    },

    // 歡迎頁面
    welcome: {
      title: '歡迎來到最強肉體',
      subtitle: '留下運動數據,進步多少馬上知道',
      login: '登入',
      guestMode: '立即體驗（訪客模式）',
      register: '註冊帳號',
      guestInfo: {
        title: '訪客模式功能：',
        features: [
          '完整體驗所有評測功能',
          '本地儲存評測結果',
          '隨時可註冊同步資料',
          '無法使用好友、天梯等社交功能',
        ],
      },
    },

    // 用戶資料
    userInfo: {
      title: '身體狀態與表現總覽',
      nickname: '暱稱',
      nicknamePlaceholder: '請輸入暱稱',
      generateNickname: '生成暱稱',
      gender: '性別',
      selectGender: '請選擇性別',
      male: '男性',
      female: '女性',
      height: '身高 (cm)',
      weight: '體重 (kg)',
      age: '年齡',
      saveData: '儲存資料',
      saving: '儲存中...',
      dataSaved: '資料已儲存成功！',
      saveFailed: '儲存失敗，請稍後再試',
    },

    // 評測
    tests: {
      strength: '力量評測',
      explosivePower: '爆發力測試',
      cardio: '心肺耐力測試',
      muscleMass: '骨骼肌肉量',
      bodyFat: '體脂肪率與FFMI',
      startTest: '開始評測',
      completeTest: '完成評測',
      testComplete: '評測完成',
      score: '分數',
      averageScore: '平均分數',
    },

    // 天梯排行榜
    ladder: {
      title: '天梯排行榜',
      myScore: '我的天梯分數',
      myRank: '我的排名',
      notParticipated: '未參與',
      notRanked: '未上榜',
      rank: '第 {{rank}} 名',
      ageGroups: {
        all: '全部年齡',
        under20: '20歲以下',
        '21to30': '21~30歲',
        '31to40': '31~40歲',
        '41to50': '41~50歲',
        '51to60': '51~60歲',
        '61to70': '61~70歲',
        over70: '70歲以上',
        unknown: '未知年齡',
      },
      empty: {
        title: '暫無排行榜數據',
        subtitle: '完成評測即可上榜！',
      },
      footer: {
        scoreFormula: '完成所有評測項目即可計算天梯分數',
        formula: '天梯分數 = (力量 + 爆發力 + 心肺 + 肌肉量 + 體脂) ÷ 5',
      },
    },

    // 訪客模式
    guestMode: {
      title: '歡迎使用最強肉體',
      subtitle: '您可以選擇註冊帳號或直接體驗',
      startGuest: '立即體驗（訪客模式）',
      register: '註冊帳號',
      or: '或',
      banner: '訪客模式 - 您的資料僅儲存在本地',
      syncData: '註冊同步',
      exit: '退出',
    },

    // 錯誤訊息
    errors: {
      required: '此欄位為必填',
      invalidFormat: '格式不正確',
      networkError: '網路錯誤，請稍後再試',
      authError: '認證失敗',
      saveError: '儲存失敗',
      loadError: '載入失敗',
    },
  },
};

// 英文語言包
const enUS = {
  translation: {
    // 通用
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
    },

    // 導航
    navigation: {
      home: 'Home',
      profile: 'Profile',
      history: 'History',
      ladder: 'Ladder',
      friends: 'Friends',
      settings: 'Settings',
      logout: 'Logout',
    },

    // 歡迎頁面
    welcome: {
      title: 'Welcome to Fitness Assessment',
      subtitle: 'Track your progress with detailed fitness metrics',
      login: 'Login',
      guestMode: 'Try Now (Guest Mode)',
      register: 'Register',
      guestInfo: {
        title: 'Guest Mode Features:',
        features: [
          'Full access to all assessment features',
          'Local storage of assessment results',
          'Register anytime to sync data',
          'Social features like friends and ladder not available',
        ],
      },
    },

    // 用戶資料
    userInfo: {
      title: 'Body Status & Performance Overview',
      nickname: 'Nickname',
      nicknamePlaceholder: 'Enter nickname',
      generateNickname: 'Generate',
      gender: 'Gender',
      selectGender: 'Select gender',
      male: 'Male',
      female: 'Female',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      age: 'Age',
      saveData: 'Save Data',
      saving: 'Saving...',
      dataSaved: 'Data saved successfully!',
      saveFailed: 'Save failed, please try again',
    },

    // 評測
    tests: {
      strength: 'Strength Assessment',
      explosivePower: 'Explosive Power Test',
      cardio: 'Cardio Endurance Test',
      muscleMass: 'Muscle Mass',
      bodyFat: 'Body Fat & FFMI',
      startTest: 'Start Test',
      completeTest: 'Complete Test',
      testComplete: 'Test Complete',
      score: 'Score',
      averageScore: 'Average Score',
    },

    // 天梯排行榜
    ladder: {
      title: 'Ladder Rankings',
      myScore: 'My Ladder Score',
      myRank: 'My Rank',
      notParticipated: 'Not Participated',
      notRanked: 'Not Ranked',
      rank: 'Rank {{rank}}',
      ageGroups: {
        all: 'All Ages',
        under20: 'Under 20',
        '21to30': '21-30',
        '31to40': '31-40',
        '41to50': '41-50',
        '51to60': '51-60',
        '61to70': '61-70',
        over70: 'Over 70',
        unknown: 'Unknown Age',
      },
      empty: {
        title: 'No ladder data available',
        subtitle: 'Complete assessments to rank!',
      },
      footer: {
        scoreFormula: 'Complete all assessment items to calculate ladder score',
        formula:
          'Ladder Score = (Strength + Explosive Power + Cardio + Muscle Mass + Body Fat) ÷ 5',
      },
    },

    // 訪客模式
    guestMode: {
      title: 'Welcome to Fitness Assessment',
      subtitle: 'You can choose to register or try directly',
      startGuest: 'Try Now (Guest Mode)',
      register: 'Register',
      or: 'or',
      banner: 'Guest Mode - Your data is stored locally only',
      syncData: 'Register to Sync',
      exit: 'Exit',
    },

    // 錯誤訊息
    errors: {
      required: 'This field is required',
      invalidFormat: 'Invalid format',
      networkError: 'Network error, please try again later',
      authError: 'Authentication failed',
      saveError: 'Save failed',
      loadError: 'Load failed',
    },
  },
};

// 初始化 i18n
i18n.use(initReactI18next).init({
  resources: {
    'zh-TW': zhTW,
    'en-US': enUS,
  },
  lng: 'zh-TW', // 強制預設語言為中文
  fallbackLng: 'zh-TW',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// 清除 localStorage 可能殘留的語言設定
try {
  localStorage.removeItem('language');
} catch (e) {}

export default i18n;
