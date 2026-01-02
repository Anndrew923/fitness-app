// ✅ Phase 1 新增：職業分類選項
export const JOB_CATEGORIES = {
  engineering: {
    id: 'engineering',
    name: '工程師',
    nameEn: 'Software/Hardware Engineer',
  },
  medical: { id: 'medical', name: '醫療人員', nameEn: 'Doctor/Nurse' },
  coach: { id: 'coach', name: '健身教練', nameEn: 'Personal Trainer' },
  student: { id: 'student', name: '學生', nameEn: 'Student' },
  police_military: {
    id: 'police_military',
    name: '軍警消',
    nameEn: 'Military/Police',
  },
  business: { id: 'business', name: '商業/金融', nameEn: 'Business/Finance' },
  freelance: {
    id: 'freelance',
    name: '自由業/設計',
    nameEn: 'Freelancer/Design',
  },
  other: { id: 'other', name: '其他', nameEn: 'Other' },
};

// ✅ Phase 1 新增：城市選項（台灣主要城市）
export const CITY_OPTIONS = [
  { id: 'taipei', name: '台北' },
  { id: 'newtaipei', name: '新北' },
  { id: 'taoyuan', name: '桃園' },
  { id: 'taichung', name: '台中' },
  { id: 'tainan', name: '台南' },
  { id: 'kaohsiung', name: '高雄' },
  { id: 'other', name: '其他' },
];

export const initialState = {
  gender: '',
  height: 0,
  weight: 0,
  age: 0,
  nickname: '',
  avatarUrl: '',
  ageGroup: '',
  friends: [],
  friendRequests: [],
  blockedUsers: [],
  ladderScore: 0,
  ladderRank: 0,
  ladderHistory: [],
  isGuest: false,
  isAnonymousInLadder: false,
  lastActive: new Date().toISOString(),
  lastLoginDate: null,
  stats_loginStreak: 0,
  stats_totalLoginDays: 0,
  country: '',
  region: '',
  city: '',
  job_category: '',
  gym_name: '',
  rpg_class: '',
  subscription: {
    status: 'active',
    isEarlyAdopter: false,
  },
  rpgStats: {
    lastGachaDate: null,
    totalExp: 0,
    level: 1,
  },
  record_5km: {
    bestTime: 0,
    date: null,
    pace: 0,
    location: '',
  },
  record_arm_girth: {
    value: 0,
    date: null,
    photoUrl: '',
  },
  scores: {
    strength: 0,
    explosivePower: 0,
    cardio: 0,
    muscleMass: 0,
    bodyFat: 0,
  },
  history: [],
  testInputs: {},
};

