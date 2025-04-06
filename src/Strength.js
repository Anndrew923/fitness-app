import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function Strength() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gender, height, weight, age } = location.state || {};

  // 狀態管理：每個項目的重量、次數、最大力量和分數
  const [benchPress, setBenchPress] = useState({ weight: '', reps: '', max: null, score: null });
  const [squat, setSquat] = useState({ weight: '', reps: '', max: null, score: null });
  const [deadlift, setDeadlift] = useState({ weight: '', reps: '', max: null, score: null });
  const [pullUp, setPullUp] = useState({ weight: weight || '', reps: '', max: null, score: null }); // 引體向上的重量預設為用戶體重
  const [pullUpType, setPullUpType] = useState('pullUp'); // 用戶選擇的背部訓練動作（引體向上或滑輪下拉）
  const [shoulderPress, setShoulderPress] = useState({ weight: '', reps: '', max: null, score: null });

  // 男性臥推體重基準標準（單位：公斤）
  const bodyweightStandardsMaleBenchPress = {
    50: { Beginner: 24, Novice: 38, Intermediate: 57, Advanced: 79, Elite: 103 },
    55: { Beginner: 29, Novice: 45, Intermediate: 64, Advanced: 87, Elite: 113 },
    60: { Beginner: 34, Novice: 51, Intermediate: 72, Advanced: 96, Elite: 123 },
    65: { Beginner: 39, Novice: 57, Intermediate: 79, Advanced: 104, Elite: 132 },
    70: { Beginner: 44, Novice: 62, Intermediate: 85, Advanced: 112, Elite: 141 },
    75: { Beginner: 49, Novice: 68, Intermediate: 92, Advanced: 119, Elite: 149 },
    80: { Beginner: 53, Novice: 74, Intermediate: 98, Advanced: 127, Elite: 157 },
    85: { Beginner: 58, Novice: 79, Intermediate: 105, Advanced: 134, Elite: 165 },
    90: { Beginner: 62, Novice: 84, Intermediate: 111, Advanced: 141, Elite: 172 },
    95: { Beginner: 67, Novice: 89, Intermediate: 116, Advanced: 147, Elite: 180 },
    100: { Beginner: 71, Novice: 94, Intermediate: 122, Advanced: 153, Elite: 187 },
    105: { Beginner: 75, Novice: 99, Intermediate: 128, Advanced: 160, Elite: 194 },
    110: { Beginner: 80, Novice: 104, Intermediate: 133, Advanced: 166, Elite: 200 },
    115: { Beginner: 84, Novice: 109, Intermediate: 138, Advanced: 172, Elite: 207 },
    120: { Beginner: 88, Novice: 113, Intermediate: 143, Advanced: 177, Elite: 213 },
    125: { Beginner: 92, Novice: 118, Intermediate: 148, Advanced: 183, Elite: 219 },
    130: { Beginner: 95, Novice: 122, Intermediate: 153, Advanced: 188, Elite: 225 },
    135: { Beginner: 99, Novice: 126, Intermediate: 158, Advanced: 194, Elite: 231 },
    140: { Beginner: 103, Novice: 130, Intermediate: 163, Advanced: 199, Elite: 236 },
  };

  // 女性臥推體重基準標準（單位：公斤）
  const bodyweightStandardsFemaleBenchPress = {
    40: { Beginner: 8, Novice: 18, Intermediate: 32, Advanced: 50, Elite: 70 },
    45: { Beginner: 10, Novice: 21, Intermediate: 36, Advanced: 55, Elite: 76 },
    50: { Beginner: 12, Novice: 24, Intermediate: 40, Advanced: 59, Elite: 82 },
    55: { Beginner: 15, Novice: 27, Intermediate: 43, Advanced: 64, Elite: 87 },
    60: { Beginner: 17, Novice: 29, Intermediate: 47, Advanced: 68, Elite: 92 },
    65: { Beginner: 19, Novice: 32, Intermediate: 50, Advanced: 72, Elite: 96 },
    70: { Beginner: 20, Novice: 34, Intermediate: 53, Advanced: 75, Elite: 101 },
    75: { Beginner: 22, Novice: 37, Intermediate: 56, Advanced: 79, Elite: 105 },
    80: { Beginner: 24, Novice: 39, Intermediate: 59, Advanced: 82, Elite: 109 },
    85: { Beginner: 26, Novice: 41, Intermediate: 62, Advanced: 86, Elite: 112 },
    90: { Beginner: 28, Novice: 44, Intermediate: 64, Advanced: 89, Elite: 116 },
    95: { Beginner: 29, Novice: 46, Intermediate: 67, Advanced: 92, Elite: 119 },
    100: { Beginner: 31, Novice: 48, Intermediate: 69, Advanced: 95, Elite: 123 },
    105: { Beginner: 33, Novice: 50, Intermediate: 72, Advanced: 98, Elite: 126 },
    110: { Beginner: 34, Novice: 52, Intermediate: 74, Advanced: 100, Elite: 129 },
    115: { Beginner: 36, Novice: 54, Intermediate: 76, Advanced: 103, Elite: 132 },
    120: { Beginner: 37, Novice: 56, Intermediate: 79, Advanced: 106, Elite: 135 },
  };

  // 男性深蹲體重基準標準（單位：公斤）
  const bodyweightStandardsMaleSquat = {
    50: { Beginner: 33, Novice: 52, Intermediate: 76, Advanced: 104, Elite: 136 },
    55: { Beginner: 40, Novice: 60, Intermediate: 86, Advanced: 116, Elite: 149 },
    60: { Beginner: 47, Novice: 68, Intermediate: 95, Advanced: 127, Elite: 161 },
    65: { Beginner: 53, Novice: 76, Intermediate: 104, Advanced: 137, Elite: 173 },
    70: { Beginner: 59, Novice: 83, Intermediate: 113, Advanced: 147, Elite: 184 },
    75: { Beginner: 66, Novice: 91, Intermediate: 122, Advanced: 157, Elite: 195 },
    80: { Beginner: 72, Novice: 98, Intermediate: 130, Advanced: 166, Elite: 205 },
    85: { Beginner: 78, Novice: 105, Intermediate: 138, Advanced: 175, Elite: 215 },
    90: { Beginner: 83, Novice: 112, Intermediate: 146, Advanced: 184, Elite: 225 },
    95: { Beginner: 89, Novice: 118, Intermediate: 153, Advanced: 192, Elite: 234 },
    100: { Beginner: 95, Novice: 125, Intermediate: 160, Advanced: 201, Elite: 243 },
    105: { Beginner: 100, Novice: 131, Intermediate: 168, Advanced: 209, Elite: 252 },
    110: { Beginner: 106, Novice: 137, Intermediate: 174, Advanced: 216, Elite: 260 },
    115: { Beginner: 111, Novice: 143, Intermediate: 181, Advanced: 224, Elite: 269 },
    120: { Beginner: 116, Novice: 149, Intermediate: 188, Advanced: 231, Elite: 277 },
    125: { Beginner: 121, Novice: 155, Intermediate: 194, Advanced: 238, Elite: 284 },
    130: { Beginner: 126, Novice: 160, Intermediate: 201, Advanced: 245, Elite: 292 },
    135: { Beginner: 131, Novice: 166, Intermediate: 207, Advanced: 252, Elite: 299 },
    140: { Beginner: 136, Novice: 171, Intermediate: 213, Advanced: 259, Elite: 307 },
  };

  // 女性深蹲體重基準標準（單位：公斤）
  const bodyweightStandardsFemaleSquat = {
    40: { Beginner: 17, Novice: 31, Intermediate: 51, Advanced: 75, Elite: 101 },
    45: { Beginner: 20, Novice: 36, Intermediate: 56, Advanced: 81, Elite: 109 },
    50: { Beginner: 23, Novice: 39, Intermediate: 61, Advanced: 87, Elite: 115 },
    55: { Beginner: 26, Novice: 43, Intermediate: 65, Advanced: 92, Elite: 122 },
    60: { Beginner: 29, Novice: 47, Intermediate: 70, Advanced: 97, Elite: 128 },
    65: { Beginner: 32, Novice: 50, Intermediate: 74, Advanced: 102, Elite: 133 },
    70: { Beginner: 34, Novice: 53, Intermediate: 78, Advanced: 106, Elite: 138 },
    75: { Beginner: 37, Novice: 56, Intermediate: 81, Advanced: 111, Elite: 143 },
    80: { Beginner: 39, Novice: 59, Intermediate: 85, Advanced: 115, Elite: 148 },
    85: { Beginner: 41, Novice: 62, Intermediate: 88, Advanced: 119, Elite: 152 },
    90: { Beginner: 44, Novice: 65, Intermediate: 91, Advanced: 123, Elite: 157 },
    95: { Beginner: 46, Novice: 68, Intermediate: 95, Advanced: 126, Elite: 161 },
    100: { Beginner: 48, Novice: 70, Intermediate: 98, Advanced: 130, Elite: 165 },
    105: { Beginner: 50, Novice: 73, Intermediate: 101, Advanced: 133, Elite: 169 },
    110: { Beginner: 52, Novice: 75, Intermediate: 103, Advanced: 136, Elite: 172 },
    115: { Beginner: 54, Novice: 77, Intermediate: 106, Advanced: 140, Elite: 176 },
    120: { Beginner: 56, Novice: 80, Intermediate: 109, Advanced: 143, Elite: 179 },
  };

  // 男性硬舉體重基準標準（單位：公斤）
  const bodyweightStandardsMaleDeadlift = {
    50: { Beginner: 44, Novice: 65, Intermediate: 93, Advanced: 125, Elite: 160 },
    55: { Beginner: 51, Novice: 74, Intermediate: 103, Advanced: 137, Elite: 174 },
    60: { Beginner: 58, Novice: 83, Intermediate: 114, Advanced: 149, Elite: 187 },
    65: { Beginner: 66, Novice: 92, Intermediate: 124, Advanced: 160, Elite: 200 },
    70: { Beginner: 73, Novice: 100, Intermediate: 133, Advanced: 171, Elite: 212 },
    75: { Beginner: 79, Novice: 108, Intermediate: 142, Advanced: 182, Elite: 224 },
    80: { Beginner: 86, Novice: 116, Intermediate: 151, Advanced: 192, Elite: 235 },
    85: { Beginner: 93, Novice: 123, Intermediate: 160, Advanced: 201, Elite: 245 },
    90: { Beginner: 99, Novice: 131, Intermediate: 168, Advanced: 211, Elite: 256 },
    95: { Beginner: 105, Novice: 138, Intermediate: 176, Advanced: 220, Elite: 266 },
    100: { Beginner: 111, Novice: 145, Intermediate: 184, Advanced: 228, Elite: 275 },
    105: { Beginner: 117, Novice: 151, Intermediate: 192, Advanced: 237, Elite: 284 },
    110: { Beginner: 123, Novice: 158, Intermediate: 199, Advanced: 245, Elite: 293 },
    115: { Beginner: 129, Novice: 164, Intermediate: 206, Advanced: 253, Elite: 302 },
    120: { Beginner: 134, Novice: 171, Intermediate: 213, Advanced: 261, Elite: 311 },
    125: { Beginner: 140, Novice: 177, Intermediate: 220, Advanced: 268, Elite: 319 },
    130: { Beginner: 145, Novice: 183, Intermediate: 227, Advanced: 276, Elite: 327 },
    135: { Beginner: 150, Novice: 188, Intermediate: 233, Advanced: 283, Elite: 335 },
    140: { Beginner: 155, Novice: 194, Intermediate: 240, Advanced: 290, Elite: 342 },
  };

  // 女性硬舉體重基準標準（單位：公斤）
  const bodyweightStandardsFemaleDeadlift = {
    40: { Beginner: 24, Novice: 40, Intermediate: 62, Advanced: 89, Elite: 118 },
    45: { Beginner: 27, Novice: 45, Intermediate: 68, Advanced: 95, Elite: 126 },
    50: { Beginner: 31, Novice: 49, Intermediate: 73, Advanced: 102, Elite: 133 },
    55: { Beginner: 34, Novice: 53, Intermediate: 78, Advanced: 107, Elite: 140 },
    60: { Beginner: 37, Novice: 57, Intermediate: 83, Advanced: 113, Elite: 146 },
    65: { Beginner: 40, Novice: 61, Intermediate: 87, Advanced: 118, Elite: 152 },
    70: { Beginner: 43, Novice: 64, Intermediate: 91, Advanced: 123, Elite: 157 },
    75: { Beginner: 45, Novice: 67, Intermediate: 95, Advanced: 127, Elite: 163 },
    80: { Beginner: 48, Novice: 71, Intermediate: 99, Advanced: 132, Elite: 168 },
    85: { Beginner: 51, Novice: 74, Intermediate: 102, Advanced: 136, Elite: 172 },
    90: { Beginner: 53, Novice: 77, Intermediate: 106, Advanced: 140, Elite: 177 },
    95: { Beginner: 55, Novice: 79, Intermediate: 109, Advanced: 144, Elite: 181 },
    100: { Beginner: 58, Novice: 82, Intermediate: 112, Advanced: 147, Elite: 185 },
    105: { Beginner: 60, Novice: 85, Intermediate: 116, Advanced: 151, Elite: 189 },
    110: { Beginner: 62, Novice: 87, Intermediate: 119, Advanced: 154, Elite: 193 },
    115: { Beginner: 64, Novice: 90, Intermediate: 121, Advanced: 158, Elite: 197 },
    120: { Beginner: 66, Novice: 92, Intermediate: 124, Advanced: 161, Elite: 200 },
  };

  // 男性引體向上體重基準標準（單位：次數）
  const bodyweightStandardsMalePullUp = {
    50: { Beginner: 0, Novice: 5, Intermediate: 15, Advanced: 27, Elite: 40 },
    55: { Beginner: 0, Novice: 6, Intermediate: 15, Advanced: 26, Elite: 39 },
    60: { Beginner: 0, Novice: 6, Intermediate: 15, Advanced: 26, Elite: 37 },
    65: { Beginner: 0, Novice: 6, Intermediate: 15, Advanced: 25, Elite: 36 },
    70: { Beginner: 0, Novice: 6, Intermediate: 14, Advanced: 24, Elite: 35 },
    75: { Beginner: 0, Novice: 6, Intermediate: 14, Advanced: 24, Elite: 34 },
    80: { Beginner: 0, Novice: 6, Intermediate: 14, Advanced: 23, Elite: 33 },
    85: { Beginner: 0, Novice: 6, Intermediate: 13, Advanced: 22, Elite: 32 },
    90: { Beginner: 0, Novice: 6, Intermediate: 13, Advanced: 21, Elite: 30 },
    95: { Beginner: 0, Novice: 6, Intermediate: 12, Advanced: 21, Elite: 29 },
    100: { Beginner: 0, Novice: 6, Intermediate: 12, Advanced: 20, Elite: 28 },
    105: { Beginner: 0, Novice: 5, Intermediate: 11, Advanced: 19, Elite: 27 },
    110: { Beginner: 0, Novice: 5, Intermediate: 11, Advanced: 18, Elite: 26 },
    115: { Beginner: 0, Novice: 5, Intermediate: 10, Advanced: 18, Elite: 25 },
    120: { Beginner: 0, Novice: 4, Intermediate: 10, Advanced: 17, Elite: 25 },
    125: { Beginner: 0, Novice: 4, Intermediate: 10, Advanced: 16, Elite: 24 },
    130: { Beginner: 0, Novice: 4, Intermediate: 9, Advanced: 16, Elite: 23 },
    135: { Beginner: 0, Novice: 4, Intermediate: 9, Advanced: 15, Elite: 22 },
    140: { Beginner: 0, Novice: 3, Intermediate: 9, Advanced: 15, Elite: 21 },
  };

  // 女性引體向上體重基準標準（單位：次數）
  const bodyweightStandardsFemalePullUp = {
    40: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 14, Elite: 25 },
    45: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 14, Elite: 24 },
    50: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 14, Elite: 24 },
    55: { Beginner: 0, Novice: 0, Intermediate: 7, Advanced: 14, Elite: 23 },
    60: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 14, Elite: 22 },
    65: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 13, Elite: 21 },
    70: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 12, Elite: 20 },
    75: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 12, Elite: 19 },
    80: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 11, Elite: 19 },
    85: { Beginner: 0, Novice: 0, Intermediate: 5, Advanced: 11, Elite: 18 },
    90: { Beginner: 0, Novice: 0, Intermediate: 5, Advanced: 10, Elite: 17 },
    95: { Beginner: 0, Novice: 0, Intermediate: 5, Advanced: 10, Elite: 16 },
    100: { Beginner: 0, Novice: 0, Intermediate: 4, Advanced: 9, Elite: 15 },
    105: { Beginner: 0, Novice: 0, Intermediate: 4, Advanced: 9, Elite: 15 },
    110: { Beginner: 0, Novice: 0, Intermediate: 3, Advanced: 9, Elite: 14 },
    115: { Beginner: 0, Novice: 0, Intermediate: 3, Advanced: 8, Elite: 13 },
    120: { Beginner: 0, Novice: 0, Intermediate: 3, Advanced: 8, Elite: 12 },
  };

  // 男性滑輪下拉體重基準標準（單位：公斤）
  const bodyweightStandardsMaleLatPulldown = {
    50: { Beginner: 25, Novice: 39, Intermediate: 58, Advanced: 81, Elite: 105 },
    55: { Beginner: 28, Novice: 43, Intermediate: 63, Advanced: 86, Elite: 112 },
    60: { Beginner: 31, Novice: 47, Intermediate: 67, Advanced: 92, Elite: 118 },
    65: { Beginner: 34, Novice: 51, Intermediate: 72, Advanced: 97, Elite: 124 },
    70: { Beginner: 37, Novice: 54, Intermediate: 76, Advanced: 101, Elite: 129 },
    75: { Beginner: 39, Novice: 57, Intermediate: 80, Advanced: 106, Elite: 134 },
    80: { Beginner: 42, Novice: 61, Intermediate: 84, Advanced: 110, Elite: 139 },
    85: { Beginner: 45, Novice: 64, Intermediate: 87, Advanced: 115, Elite: 144 },
    90: { Beginner: 47, Novice: 67, Intermediate: 91, Advanced: 119, Elite: 149 },
    95: { Beginner: 50, Novice: 70, Intermediate: 94, Advanced: 122, Elite: 153 },
    100: { Beginner: 52, Novice: 72, Intermediate: 97, Advanced: 126, Elite: 157 },
    105: { Beginner: 54, Novice: 75, Intermediate: 101, Advanced: 130, Elite: 161 },
    110: { Beginner: 57, Novice: 78, Intermediate: 104, Advanced: 133, Elite: 165 },
    115: { Beginner: 59, Novice: 80, Intermediate: 107, Advanced: 137, Elite: 169 },
    120: { Beginner: 61, Novice: 83, Intermediate: 110, Advanced: 140, Elite: 172 },
    125: { Beginner: 63, Novice: 85, Intermediate: 112, Advanced: 143, Elite: 176 },
    130: { Beginner: 65, Novice: 88, Intermediate: 115, Advanced: 146, Elite: 179 },
    135: { Beginner: 67, Novice: 90, Intermediate: 118, Advanced: 149, Elite: 183 },
    140: { Beginner: 69, Novice: 92, Intermediate: 120, Advanced: 152, Elite: 186 },
  };

  // 女性滑輪下拉體重基準標準（單位：公斤）
  const bodyweightStandardsFemaleLatPulldown = {
    40: { Beginner: 14, Novice: 24, Intermediate: 36, Advanced: 52, Elite: 70 },
    45: { Beginner: 15, Novice: 25, Intermediate: 39, Advanced: 55, Elite: 72 },
    50: { Beginner: 17, Novice: 27, Intermediate: 41, Advanced: 57, Elite: 75 },
    55: { Beginner: 18, Novice: 28, Intermediate: 42, Advanced: 59, Elite: 78 },
    60: { Beginner: 19, Novice: 30, Intermediate: 44, Advanced: 61, Elite: 80 },
    65: { Beginner: 20, Novice: 31, Intermediate: 46, Advanced: 63, Elite: 82 },
    70: { Beginner: 21, Novice: 32, Intermediate: 47, Advanced: 65, Elite: 84 },
    75: { Beginner: 22, Novice: 34, Intermediate: 49, Advanced: 66, Elite: 86 },
    80: { Beginner: 23, Novice: 35, Intermediate: 50, Advanced: 68, Elite: 88 },
    85: { Beginner: 24, Novice: 36, Intermediate: 51, Advanced: 69, Elite: 89 },
    90: { Beginner: 24, Novice: 37, Intermediate: 52, Advanced: 71, Elite: 91 },
    95: { Beginner: 25, Novice: 38, Intermediate: 54, Advanced: 72, Elite: 93 },
    100: { Beginner: 26, Novice: 39, Intermediate: 55, Advanced: 74, Elite: 94 },
    105: { Beginner: 27, Novice: 40, Intermediate: 56, Advanced: 75, Elite: 95 },
    110: { Beginner: 27, Novice: 40, Intermediate: 57, Advanced: 76, Elite: 97 },
    115: { Beginner: 28, Novice: 41, Intermediate: 58, Advanced: 77, Elite: 98 },
    120: { Beginner: 29, Novice: 42, Intermediate: 59, Advanced: 78, Elite: 99 },
  };

  // 男性臥推年齡基準標準（單位：公斤）
  const ageStandardsMaleBenchPress = {
    15: { Beginner: 40, Novice: 59, Intermediate: 84, Advanced: 112, Elite: 144 },
    20: { Beginner: 46, Novice: 68, Intermediate: 96, Advanced: 129, Elite: 164 },
    25: { Beginner: 47, Novice: 70, Intermediate: 98, Advanced: 132, Elite: 169 },
    30: { Beginner: 47, Novice: 70, Intermediate: 98, Advanced: 132, Elite: 169 },
    35: { Beginner: 47, Novice: 70, Intermediate: 98, Advanced: 132, Elite: 169 },
    40: { Beginner: 47, Novice: 70, Intermediate: 98, Advanced: 132, Elite: 169 },
    45: { Beginner: 44, Novice: 66, Intermediate: 93, Advanced: 125, Elite: 160 },
    50: { Beginner: 42, Novice: 62, Intermediate: 88, Advanced: 118, Elite: 150 },
    55: { Beginner: 39, Novice: 57, Intermediate: 81, Advanced: 109, Elite: 139 },
    60: { Beginner: 35, Novice: 52, Intermediate: 74, Advanced: 99, Elite: 127 },
    65: { Beginner: 32, Novice: 47, Intermediate: 67, Advanced: 90, Elite: 115 },
    70: { Beginner: 29, Novice: 42, Intermediate: 60, Advanced: 80, Elite: 103 },
    75: { Beginner: 26, Novice: 38, Intermediate: 54, Advanced: 72, Elite: 92 },
    80: { Beginner: 23, Novice: 34, Intermediate: 48, Advanced: 64, Elite: 82 },
    85: { Beginner: 20, Novice: 30, Intermediate: 43, Advanced: 58, Elite: 74 },
    90: { Beginner: 18, Novice: 27, Intermediate: 39, Advanced: 52, Elite: 66 },
  };

  // 女性臥推年齡基準標準（單位：公斤）
  const ageStandardsFemaleBenchPress = {
    15: { Beginner: 15, Novice: 27, Intermediate: 43, Advanced: 63, Elite: 86 },
    20: { Beginner: 17, Novice: 31, Intermediate: 49, Advanced: 72, Elite: 98 },
    25: { Beginner: 17, Novice: 31, Intermediate: 51, Advanced: 74, Elite: 101 },
    30: { Beginner: 17, Novice: 31, Intermediate: 51, Advanced: 74, Elite: 101 },
    35: { Beginner: 17, Novice: 31, Intermediate: 51, Advanced: 74, Elite: 101 },
    40: { Beginner: 17, Novice: 31, Intermediate: 51, Advanced: 74, Elite: 101 },
    45: { Beginner: 16, Novice: 30, Intermediate: 48, Advanced: 70, Elite: 96 },
    50: { Beginner: 15, Novice: 28, Intermediate: 45, Advanced: 66, Elite: 90 },
    55: { Beginner: 14, Novice: 26, Intermediate: 42, Advanced: 61, Elite: 83 },
    60: { Beginner: 13, Novice: 24, Intermediate: 38, Advanced: 56, Elite: 76 },
    65: { Beginner: 12, Novice: 21, Intermediate: 34, Advanced: 50, Elite: 69 },
    70: { Beginner: 11, Novice: 19, Intermediate: 31, Advanced: 45, Elite: 62 },
    75: { Beginner: 9, Novice: 17, Intermediate: 28, Advanced: 40, Elite: 55 },
    80: { Beginner: 8, Novice: 15, Intermediate: 25, Advanced: 36, Elite: 49 },
    85: { Beginner: 8, Novice: 14, Intermediate: 22, Advanced: 32, Elite: 44 },
    90: { Beginner: 7, Novice: 12, Intermediate: 20, Advanced: 29, Elite: 40 },
  };

  // 男性深蹲年齡基準標準（單位：公斤）
  const ageStandardsMaleSquat = {
    15: { Beginner: 55, Novice: 80, Intermediate: 111, Advanced: 147, Elite: 187 },
    20: { Beginner: 62, Novice: 91, Intermediate: 127, Advanced: 168, Elite: 214 },
    25: { Beginner: 64, Novice: 93, Intermediate: 130, Advanced: 173, Elite: 219 },
    30: { Beginner: 64, Novice: 93, Intermediate: 130, Advanced: 173, Elite: 219 },
    35: { Beginner: 64, Novice: 93, Intermediate: 130, Advanced: 173, Elite: 219 },
    40: { Beginner: 64, Novice: 93, Intermediate: 130, Advanced: 173, Elite: 219 },
    45: { Beginner: 61, Novice: 89, Intermediate: 123, Advanced: 164, Elite: 208 },
    50: { Beginner: 57, Novice: 83, Intermediate: 116, Advanced: 154, Elite: 195 },
    55: { Beginner: 53, Novice: 77, Intermediate: 107, Advanced: 142, Elite: 180 },
    60: { Beginner: 48, Novice: 70, Intermediate: 98, Advanced: 130, Elite: 165 },
    65: { Beginner: 44, Novice: 63, Intermediate: 88, Advanced: 117, Elite: 149 },
    70: { Beginner: 39, Novice: 57, Intermediate: 79, Advanced: 105, Elite: 134 },
    75: { Beginner: 35, Novice: 51, Intermediate: 71, Advanced: 94, Elite: 119 },
    80: { Beginner: 31, Novice: 46, Intermediate: 63, Advanced: 84, Elite: 107 },
    85: { Beginner: 28, Novice: 41, Intermediate: 57, Advanced: 75, Elite: 96 },
    90: { Beginner: 25, Novice: 37, Intermediate: 51, Advanced: 68, Elite: 86 },
  };

  // 女性深蹲年齡基準標準（單位：公斤）
  const ageStandardsFemaleSquat = {
    15: { Beginner: 25, Novice: 41, Intermediate: 62, Advanced: 88, Elite: 116 },
    20: { Beginner: 29, Novice: 47, Intermediate: 71, Advanced: 100, Elite: 132 },
    25: { Beginner: 30, Novice: 48, Intermediate: 73, Advanced: 103, Elite: 136 },
    30: { Beginner: 30, Novice: 48, Intermediate: 73, Advanced: 103, Elite: 136 },
    35: { Beginner: 30, Novice: 48, Intermediate: 73, Advanced: 103, Elite: 136 },
    40: { Beginner: 30, Novice: 48, Intermediate: 73, Advanced: 103, Elite: 136 },
    45: { Beginner: 28, Novice: 46, Intermediate: 69, Advanced: 97, Elite: 129 },
    50: { Beginner: 26, Novice: 43, Intermediate: 65, Advanced: 92, Elite: 121 },
    55: { Beginner: 24, Novice: 40, Intermediate: 60, Advanced: 85, Elite: 112 },
    60: { Beginner: 22, Novice: 36, Intermediate: 55, Advanced: 77, Elite: 102 },
    65: { Beginner: 20, Novice: 33, Intermediate: 50, Advanced: 70, Elite: 92 },
    70: { Beginner: 18, Novice: 29, Intermediate: 44, Advanced: 63, Elite: 83 },
    75: { Beginner: 16, Novice: 26, Intermediate: 40, Advanced: 56, Elite: 74 },
    80: { Beginner: 14, Novice: 24, Intermediate: 36, Advanced: 50, Elite: 66 },
    85: { Beginner: 13, Novice: 21, Intermediate: 32, Advanced: 45, Elite: 59 },
    90: { Beginner: 12, Novice: 19, Intermediate: 29, Advanced: 40, Elite: 54 },
  };

  // 男性硬舉年齡基準標準（單位：公斤）
  const ageStandardsMaleDeadlift = {
    15: { Beginner: 67, Novice: 95, Intermediate: 130, Advanced: 170, Elite: 213 },
    20: { Beginner: 76, Novice: 109, Intermediate: 148, Advanced: 194, Elite: 244 },
    25: { Beginner: 78, Novice: 112, Intermediate: 152, Advanced: 200, Elite: 250 },
    30: { Beginner: 78, Novice: 112, Intermediate: 152, Advanced: 200, Elite: 250 },
    35: { Beginner: 78, Novice: 112, Intermediate: 152, Advanced: 200, Elite: 250 },
    40: { Beginner: 78, Novice: 112, Intermediate: 152, Advanced: 200, Elite: 250 },
    45: { Beginner: 74, Novice: 106, Intermediate: 145, Advanced: 189, Elite: 238 },
    50: { Beginner: 70, Novice: 99, Intermediate: 136, Advanced: 178, Elite: 223 },
    55: { Beginner: 65, Novice: 92, Intermediate: 125, Advanced: 164, Elite: 206 },
    60: { Beginner: 59, Novice: 84, Intermediate: 115, Advanced: 150, Elite: 188 },
    65: { Beginner: 53, Novice: 76, Intermediate: 103, Advanced: 135, Elite: 170 },
    70: { Beginner: 48, Novice: 68, Intermediate: 93, Advanced: 122, Elite: 153 },
    75: { Beginner: 43, Novice: 61, Intermediate: 83, Advanced: 109, Elite: 136 },
    80: { Beginner: 38, Novice: 54, Intermediate: 74, Advanced: 97, Elite: 122 },
    85: { Beginner: 34, Novice: 49, Intermediate: 67, Advanced: 87, Elite: 109 },
    90: { Beginner: 31, Novice: 44, Intermediate: 60, Advanced: 79, Elite: 99 },
  };

  // 女性硬舉年齡基準標準（單位：公斤）
  const ageStandardsFemaleDeadlift = {
    15: { Beginner: 32, Novice: 51, Intermediate: 74, Advanced: 102, Elite: 133 },
    20: { Beginner: 37, Novice: 58, Intermediate: 85, Advanced: 117, Elite: 153 },
    25: { Beginner: 38, Novice: 60, Intermediate: 87, Advanced: 120, Elite: 157 },
    30: { Beginner: 38, Novice: 60, Intermediate: 87, Advanced: 120, Elite: 157 },
    35: { Beginner: 38, Novice: 60, Intermediate: 87, Advanced: 120, Elite: 157 },
    40: { Beginner: 38, Novice: 60, Intermediate: 87, Advanced: 120, Elite: 157 },
    45: { Beginner: 36, Novice: 57, Intermediate: 83, Advanced: 114, Elite: 149 },
    50: { Beginner: 34, Novice: 53, Intermediate: 78, Advanced: 107, Elite: 139 },
    55: { Beginner: 31, Novice: 49, Intermediate: 72, Advanced: 99, Elite: 129 },
    60: { Beginner: 29, Novice: 45, Intermediate: 66, Advanced: 90, Elite: 118 },
    65: { Beginner: 26, Novice: 41, Intermediate: 59, Advanced: 82, Elite: 106 },
    70: { Beginner: 23, Novice: 36, Intermediate: 53, Advanced: 73, Elite: 95 },
    75: { Beginner: 21, Novice: 33, Intermediate: 48, Advanced: 66, Elite: 85 },
    80: { Beginner: 19, Novice: 29, Intermediate: 43, Advanced: 59, Elite: 76 },
    85: { Beginner: 17, Novice: 26, Intermediate: 38, Advanced: 53, Elite: 68 },
    90: { Beginner: 15, Novice: 23, Intermediate: 34, Advanced: 47, Elite: 62 },
  };

  // 男性引體向上年齡基準標準（單位：次數）
  const ageStandardsMalePullUp = {
    15: { Beginner: 0, Novice: 0, Intermediate: 8, Advanced: 17, Elite: 27 },
    20: { Beginner: 0, Novice: 4, Intermediate: 13, Advanced: 24, Elite: 36 },
    25: { Beginner: 0, Novice: 5, Intermediate: 14, Advanced: 25, Elite: 37 },
    30: { Beginner: 0, Novice: 5, Intermediate: 14, Advanced: 25, Elite: 37 },
    35: { Beginner: 0, Novice: 5, Intermediate: 14, Advanced: 25, Elite: 37 },
    40: { Beginner: 0, Novice: 5, Intermediate: 14, Advanced: 25, Elite: 37 },
    45: { Beginner: 0, Novice: 3, Intermediate: 12, Advanced: 22, Elite: 34 },
    50: { Beginner: 0, Novice: 1, Intermediate: 9, Advanced: 19, Elite: 30 },
    55: { Beginner: 0, Novice: 0, Intermediate: 7, Advanced: 16, Elite: 26 },
    60: { Beginner: 0, Novice: 0, Intermediate: 4, Advanced: 12, Elite: 21 },
    65: { Beginner: 0, Novice: 0, Intermediate: 1, Advanced: 8, Elite: 16 },
    70: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 5, Elite: 11 },
    75: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 1, Elite: 8 },
    80: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 0, Elite: 4 },
    85: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 0, Elite: 0 },
    90: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 0, Elite: 0 },
  };

  // 女性引體向上年齡基準標準（單位：次數）
  const ageStandardsFemalePullUp = {
    15: { Beginner: 0, Novice: 0, Intermediate: 1, Advanced: 9, Elite: 17 },
    20: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 14, Elite: 24 },
    25: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 15, Elite: 26 },
    30: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 15, Elite: 26 },
    35: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 15, Elite: 26 },
    40: { Beginner: 0, Novice: 0, Intermediate: 6, Advanced: 15, Elite: 26 },
    45: { Beginner: 0, Novice: 0, Intermediate: 5, Advanced: 13, Elite: 23 },
    50: { Beginner: 0, Novice: 0, Intermediate: 3, Advanced: 10, Elite: 19 },
    55: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 8, Elite: 16 },
    60: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 5, Elite: 12 },
    65: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 2, Elite: 9 },
    70: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 0, Elite: 5 },
    75: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 0, Elite: 1 },
    80: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 0, Elite: 0 },
    85: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 0, Elite: 0 },
    90: { Beginner: 0, Novice: 0, Intermediate: 0, Advanced: 0, Elite: 0 },
  };

  // 男性滑輪下拉年齡基準標準（單位：公斤）
  const ageStandardsMaleLatPulldown = {
    15: { Beginner: 33, Novice: 49, Intermediate: 70, Advanced: 94, Elite: 120 },
    20: { Beginner: 37, Novice: 56, Intermediate: 80, Advanced: 107, Elite: 138 },
    25: { Beginner: 38, Novice: 58, Intermediate: 82, Advanced: 110, Elite: 141 },
    30: { Beginner: 38, Novice: 58, Intermediate: 82, Advanced: 110, Elite: 141 },
    35: { Beginner: 38, Novice: 58, Intermediate: 82, Advanced: 110, Elite: 141 },
    40: { Beginner: 38, Novice: 58, Intermediate: 82, Advanced: 110, Elite: 141 },
    45: { Beginner: 36, Novice: 55, Intermediate: 78, Advanced: 105, Elite: 134 },
    50: { Beginner: 34, Novice: 51, Intermediate: 73, Advanced: 98, Elite: 126 },
    55: { Beginner: 32, Novice: 47, Intermediate: 67, Advanced: 91, Elite: 117 },
    60: { Beginner: 29, Novice: 43, Intermediate: 61, Advanced: 83, Elite: 106 },
    65: { Beginner: 26, Novice: 39, Intermediate: 56, Advanced: 75, Elite: 96 },
    70: { Beginner: 23, Novice: 35, Intermediate: 50, Advanced: 67, Elite: 86 },
    75: { Beginner: 21, Novice: 31, Intermediate: 45, Advanced: 60, Elite: 77 },
    80: { Beginner: 19, Novice: 28, Intermediate: 40, Advanced: 54, Elite: 69 },
    85: { Beginner: 17, Novice: 25, Intermediate: 36, Advanced: 48, Elite: 62 },
    90: { Beginner: 15, Novice: 23, Intermediate: 32, Advanced: 43, Elite: 56 },
  };

  // 女性滑輪下拉年齡基準標準（單位：公斤）
  const ageStandardsFemaleLatPulldown = {
    15: { Beginner: 16, Novice: 26, Intermediate: 39, Advanced: 54, Elite: 71 },
    20: { Beginner: 19, Novice: 30, Intermediate: 45, Advanced: 62, Elite: 81 },
    25: { Beginner: 19, Novice: 31, Intermediate: 46, Advanced: 64, Elite: 83 },
    30: { Beginner: 19, Novice: 31, Intermediate: 46, Advanced: 64, Elite: 83 },
    35: { Beginner: 19, Novice: 31, Intermediate: 46, Advanced: 64, Elite: 83 },
    40: { Beginner: 19, Novice: 31, Intermediate: 46, Advanced: 64, Elite: 83 },
    45: { Beginner: 18, Novice: 29, Intermediate: 43, Advanced: 60, Elite: 79 },
    50: { Beginner: 17, Novice: 27, Intermediate: 41, Advanced: 57, Elite: 74 },
    55: { Beginner: 16, Novice: 25, Intermediate: 38, Advanced: 52, Elite: 69 },
    60: { Beginner: 15, Novice: 23, Intermediate: 34, Advanced: 48, Elite: 63 },
    65: { Beginner: 13, Novice: 21, Intermediate: 31, Advanced: 43, Elite: 57 },
    70: { Beginner: 12, Novice: 19, Intermediate: 28, Advanced: 39, Elite: 51 },
    75: { Beginner: 11, Novice: 17, Intermediate: 25, Advanced: 35, Elite: 45 },
    80: { Beginner: 9, Novice: 15, Intermediate: 22, Advanced: 31, Elite: 41 },
    85: { Beginner: 8, Novice: 13, Intermediate: 20, Advanced: 28, Elite: 36 },
    90: { Beginner: 8, Novice: 12, Intermediate: 18, Advanced: 25, Elite: 33 },
  };

  // 男性站姿肩推體重基準標準（單位：公斤）
const bodyweightStandardsMaleShoulderPress = {
    50: { Beginner: 15, Novice: 25, Intermediate: 38, Advanced: 53, Elite: 71 },
    55: { Beginner: 18, Novice: 29, Intermediate: 42, Advanced: 59, Elite: 77 },
    60: { Beginner: 21, Novice: 32, Intermediate: 47, Advanced: 64, Elite: 84 },
    65: { Beginner: 24, Novice: 36, Intermediate: 52, Advanced: 70, Elite: 90 },
    70: { Beginner: 27, Novice: 40, Intermediate: 56, Advanced: 75, Elite: 95 },
    75: { Beginner: 30, Novice: 43, Intermediate: 60, Advanced: 80, Elite: 101 },
    80: { Beginner: 33, Novice: 47, Intermediate: 64, Advanced: 84, Elite: 106 },
    85: { Beginner: 36, Novice: 50, Intermediate: 68, Advanced: 89, Elite: 111 },
    90: { Beginner: 39, Novice: 54, Intermediate: 72, Advanced: 93, Elite: 116 },
    95: { Beginner: 41, Novice: 57, Intermediate: 76, Advanced: 97, Elite: 121 },
    100: { Beginner: 44, Novice: 60, Intermediate: 79, Advanced: 102, Elite: 125 },
    105: { Beginner: 47, Novice: 63, Intermediate: 83, Advanced: 106, Elite: 130 },
    110: { Beginner: 49, Novice: 66, Intermediate: 86, Advanced: 109, Elite: 134 },
    115: { Beginner: 52, Novice: 69, Intermediate: 90, Advanced: 113, Elite: 138 },
    120: { Beginner: 54, Novice: 72, Intermediate: 93, Advanced: 117, Elite: 142 },
    125: { Beginner: 57, Novice: 75, Intermediate: 96, Advanced: 120, Elite: 146 },
    130: { Beginner: 59, Novice: 77, Intermediate: 99, Advanced: 124, Elite: 150 },
    135: { Beginner: 61, Novice: 80, Intermediate: 102, Advanced: 127, Elite: 154 },
    140: { Beginner: 64, Novice: 83, Intermediate: 105, Advanced: 131, Elite: 157 },
  };
  
  // 男性站姿肩推年齡基準標準（單位：公斤）
  const ageStandardsMaleShoulderPress = {
    15: { Beginner: 25, Novice: 38, Intermediate: 55, Advanced: 74, Elite: 96 },
    20: { Beginner: 29, Novice: 44, Intermediate: 63, Advanced: 85, Elite: 109 },
    25: { Beginner: 30, Novice: 45, Intermediate: 64, Advanced: 87, Elite: 112 },
    30: { Beginner: 30, Novice: 45, Intermediate: 64, Advanced: 87, Elite: 112 },
    35: { Beginner: 30, Novice: 45, Intermediate: 64, Advanced: 87, Elite: 112 },
    40: { Beginner: 30, Novice: 45, Intermediate: 64, Advanced: 87, Elite: 112 },
    45: { Beginner: 28, Novice: 43, Intermediate: 61, Advanced: 83, Elite: 107 },
    50: { Beginner: 27, Novice: 40, Intermediate: 57, Advanced: 78, Elite: 100 },
    55: { Beginner: 25, Novice: 37, Intermediate: 53, Advanced: 72, Elite: 92 },
    60: { Beginner: 22, Novice: 34, Intermediate: 48, Advanced: 66, Elite: 84 },
    65: { Beginner: 20, Novice: 31, Intermediate: 44, Advanced: 59, Elite: 76 },
    70: { Beginner: 18, Novice: 27, Intermediate: 39, Advanced: 53, Elite: 68 },
    75: { Beginner: 16, Novice: 25, Intermediate: 35, Advanced: 48, Elite: 61 },
    80: { Beginner: 15, Novice: 22, Intermediate: 31, Advanced: 43, Elite: 55 },
    85: { Beginner: 13, Novice: 20, Intermediate: 28, Advanced: 38, Elite: 49 },
    90: { Beginner: 12, Novice: 18, Intermediate: 25, Advanced: 34, Elite: 44 },
  };
  
  // 女性站姿肩推體重基準標準（單位：公斤）
  const bodyweightStandardsFemaleShoulderPress = {
    40: { Beginner: 7, Novice: 14, Intermediate: 23, Advanced: 35, Elite: 48 },
    45: { Beginner: 8, Novice: 16, Intermediate: 25, Advanced: 38, Elite: 52 },
    50: { Beginner: 10, Novice: 17, Intermediate: 28, Advanced: 40, Elite: 55 },
    55: { Beginner: 11, Novice: 19, Intermediate: 30, Advanced: 43, Elite: 58 },
    60: { Beginner: 12, Novice: 21, Intermediate: 32, Advanced: 45, Elite: 60 },
    65: { Beginner: 13, Novice: 22, Intermediate: 34, Advanced: 48, Elite: 63 },
    70: { Beginner: 15, Novice: 24, Intermediate: 35, Advanced: 50, Elite: 65 },
    75: { Beginner: 16, Novice: 25, Intermediate: 37, Advanced: 52, Elite: 68 },
    80: { Beginner: 17, Novice: 26, Intermediate: 39, Advanced: 54, Elite: 70 },
    85: { Beginner: 18, Novice: 28, Intermediate: 40, Advanced: 55, Elite: 72 },
    90: { Beginner: 19, Novice: 29, Intermediate: 42, Advanced: 57, Elite: 74 },
    95: { Beginner: 20, Novice: 30, Intermediate: 43, Advanced: 59, Elite: 76 },
    100: { Beginner: 21, Novice: 31, Intermediate: 45, Advanced: 61, Elite: 78 },
    105: { Beginner: 22, Novice: 32, Intermediate: 46, Advanced: 62, Elite: 80 },
    110: { Beginner: 23, Novice: 34, Intermediate: 47, Advanced: 64, Elite: 81 },
    115: { Beginner: 23, Novice: 35, Intermediate: 49, Advanced: 65, Elite: 83 },
    120: { Beginner: 24, Novice: 36, Intermediate: 50, Advanced: 66, Elite: 85 },
  };
  
  // 女性站姿肩推年齡基準標準（單位：公斤）
  const ageStandardsFemaleShoulderPress = {
    15: { Beginner: 11, Novice: 19, Intermediate: 29, Advanced: 41, Elite: 55 },
    20: { Beginner: 12, Novice: 21, Intermediate: 33, Advanced: 47, Elite: 63 },
    25: { Beginner: 13, Novice: 22, Intermediate: 34, Advanced: 48, Elite: 65 },
    30: { Beginner: 13, Novice: 22, Intermediate: 34, Advanced: 48, Elite: 65 },
    35: { Beginner: 13, Novice: 22, Intermediate: 34, Advanced: 48, Elite: 65 },
    40: { Beginner: 13, Novice: 22, Intermediate: 34, Advanced: 48, Elite: 65 },
    45: { Beginner: 12, Novice: 21, Intermediate: 32, Advanced: 46, Elite: 62 },
    50: { Beginner: 11, Novice: 19, Intermediate: 30, Advanced: 43, Elite: 58 },
    55: { Beginner: 11, Novice: 18, Intermediate: 28, Advanced: 40, Elite: 53 },
    60: { Beginner: 10, Novice: 16, Intermediate: 25, Advanced: 36, Elite: 49 },
    65: { Beginner: 9, Novice: 15, Intermediate: 23, Advanced: 33, Elite: 44 },
    70: { Beginner: 8, Novice: 13, Intermediate: 21, Advanced: 30, Elite: 40 },
    75: { Beginner: 7, Novice: 12, Intermediate: 18, Advanced: 26, Elite: 35 },
    80: { Beginner: 6, Novice: 11, Intermediate: 16, Advanced: 24, Elite: 32 },
    85: { Beginner: 6, Novice: 10, Intermediate: 15, Advanced: 21, Elite: 28 },
    90: { Beginner: 5, Novice: 9, Intermediate: 13, Advanced: 19, Elite: 26 },
  };

  // 根據表現和標準計算分數（0-100）
const calculateScore = (value, standard) => {
    const { Beginner, Novice, Intermediate, Advanced, Elite } = standard;
  
    if (value < Beginner) {
      return 0;
    } else if (value >= Beginner && value < Novice) {
      return 20 + (40 - 20) * (value - Beginner) / (Novice - Beginner);
    } else if (value >= Novice && value < Intermediate) {
      return 40 + (60 - 40) * (value - Novice) / (Intermediate - Novice);
    } else if (value >= Intermediate && value < Advanced) {
      return 60 + (80 - 60) * (value - Intermediate) / (Advanced - Intermediate);
    } else if (value >= Advanced && value < Elite) {
      return 80 + (100 - 80) * (value - Advanced) / (Elite - Advanced);
    } else {
      return 100;
    }
  };

 // 計算最大力量或次數並給出分數
const calculateMaxStrength = (weight, reps, setState, isBenchPress = false, isSquat = false, isDeadlift = false, isPullUp = false, isShoulderPress = false) => {
    if (!weight || !reps) {
      alert('請輸入重量和次數！');
      return;
    }
  
    const weightNum = parseFloat(weight);
    const repsNum = parseFloat(reps);
    const userWeight = parseFloat(location.state.weight);
    const userAge = parseFloat(location.state.age);
  
    if (!userWeight || !userAge) {
      alert('請確保已輸入有效的體重和年齡！');
      return;
    }
  
    // 僅對非引體向上的項目檢查12次限制
    if (!(isPullUp && pullUpType === 'pullUp') && repsNum > 12) {
      alert('可完成次數不得超過12次，請重新輸入！');
      setState((prev) => ({ ...prev, reps: '' }));
      return;
    }
  
    let valueToCompare; // 用於比較的值（次數或最大力量）
    let isRepsBased = false; // 是否以次數為標準
  
    // 引體向上的特殊處理：直接使用次數進行比較
    if (isPullUp && pullUpType === 'pullUp') {
      valueToCompare = repsNum; // 直接使用次數
      isRepsBased = true;
    } else {
      // 其他項目（包括滑輪下拉和站姿肩推）使用1RM公式計算最大力量
      valueToCompare = weightNum / (1.0278 - 0.0278 * repsNum);
    }
  
    // 動態選擇標準
    let bodyweightStandards;
    let ageStandards;
  
    if (isBenchPress) {
      bodyweightStandards = gender === 'female' ? bodyweightStandardsFemaleBenchPress : bodyweightStandardsMaleBenchPress;
      ageStandards = gender === 'female' ? ageStandardsFemaleBenchPress : ageStandardsMaleBenchPress;
    } else if (isSquat) {
      bodyweightStandards = gender === 'female' ? bodyweightStandardsFemaleSquat : bodyweightStandardsMaleSquat;
      ageStandards = gender === 'female' ? ageStandardsFemaleSquat : ageStandardsMaleSquat;
    } else if (isDeadlift) {
      bodyweightStandards = gender === 'female' ? bodyweightStandardsFemaleDeadlift : bodyweightStandardsMaleDeadlift;
      ageStandards = gender === 'female' ? ageStandardsFemaleDeadlift : ageStandardsMaleDeadlift;
    } else if (isPullUp) {
      if (pullUpType === 'pullUp') {
        bodyweightStandards = gender === 'female' ? bodyweightStandardsFemalePullUp : bodyweightStandardsMalePullUp;
        ageStandards = gender === 'female' ? ageStandardsFemalePullUp : ageStandardsMalePullUp;
      } else {
        bodyweightStandards = gender === 'female' ? bodyweightStandardsFemaleLatPulldown : bodyweightStandardsMaleLatPulldown;
        ageStandards = gender === 'female' ? ageStandardsFemaleLatPulldown : ageStandardsMaleLatPulldown;
      }
    } else if (isShoulderPress) {
      // 使用站姿肩推的專屬標準
      bodyweightStandards = gender === 'female' ? bodyweightStandardsFemaleShoulderPress : bodyweightStandardsMaleShoulderPress;
      ageStandards = gender === 'female' ? ageStandardsFemaleShoulderPress : ageStandardsMaleShoulderPress;
    } else {
      // 如果沒有指定項目，默認使用臥推標準（這部分應該不會被觸發）
      bodyweightStandards = gender === 'female' ? bodyweightStandardsFemaleBenchPress : bodyweightStandardsMaleBenchPress;
      ageStandards = gender === 'female' ? ageStandardsFemaleBenchPress : ageStandardsMaleBenchPress;
    }
  
    const weightKeys = Object.keys(bodyweightStandards).map(Number);
    const ageKeys = Object.keys(ageStandards).map(Number);
  
    const closestWeight = weightKeys.reduce((prev, curr) =>
      Math.abs(curr - userWeight) < Math.abs(prev - userWeight) ? curr : prev
    );
    const closestAge = ageKeys.reduce((prev, curr) =>
      Math.abs(curr - userAge) < Math.abs(prev - userAge) ? curr : prev
    );
  
    const bodyweightStandard = bodyweightStandards[closestWeight];
    const ageStandard = ageStandards[closestAge];
  
    const scoreByBodyweight = calculateScore(valueToCompare, bodyweightStandard);
    const scoreByAge = calculateScore(valueToCompare, ageStandard);
    const finalScore = ((scoreByBodyweight + scoreByAge) / 2).toFixed(0);
  
    setState((prev) => ({
      ...prev,
      max: isRepsBased ? repsNum : valueToCompare.toFixed(1), // 引體向上顯示次數，其他項目顯示最大力量
      score: finalScore,
    }));
  };

  // 當選擇引體向上時，自動將重量設為用戶體重
  const handlePullUpTypeChange = (e) => {
    setPullUpType(e.target.value);
    if (e.target.value === 'pullUp') {
      setPullUp((prev) => ({ ...prev, weight: weight || '', reps: '', max: null, score: null }));
    } else {
      setPullUp((prev) => ({ ...prev, weight: '', reps: '', max: null, score: null }));
    }
  };

  // 雷達圖數據
  const radarData = {
    labels: ['臥推', '深蹲', '硬舉', '引體向上', '站姿肩推'],
    datasets: [
      {
        label: '力量評測分數',
        data: [
          benchPress.score || 0,
          squat.score || 0,
          deadlift.score || 0,
          pullUp.score || 0,
          shoulderPress.score || 0,
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  // 雷達圖選項
  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
      },
    },
    plugins: {
      legend: { position: 'top' },
    },
  };

  // 計算平均分數
  const scores = [
    benchPress.score,
    squat.score,
    deadlift.score,
    pullUp.score,
    shoulderPress.score,
  ].filter((score) => score !== null);
  const averageScore = scores.length > 0 ? (scores.reduce((a, b) => a + parseFloat(b), 0) / scores.length).toFixed(0) : null;

  // 提交並返回總覽頁
  const handleSubmit = () => {
    if (averageScore) {
      navigate('/overview', { state: { gender, height, weight, age, strengthScore: averageScore } });
    } else {
      alert('請至少完成一項評測！');
    }
  };

  return (
    <div className="strength">
      <h1>力量評測</h1>
      <p>性別：{gender || '未選擇'}</p>
      <p>身高：{height || '未輸入'} 公分</p>
      <p>體重：{weight || '未輸入'} 公斤</p>
      <p>年齡：{age || '未輸入'}</p>

      {/* 臥推 */}
      <h2>臥推</h2>
      <input
        type="number"
        placeholder="重量 (公斤)"
        value={benchPress.weight}
        onChange={(e) => setBenchPress((prev) => ({ ...prev, weight: e.target.value }))}
      />
      <input
        type="number"
        placeholder="可完成次數 (12次以下較為準確)"
        value={benchPress.reps}
        onChange={(e) => setBenchPress((prev) => ({ ...prev, reps: e.target.value }))}
      />
      <button onClick={() => calculateMaxStrength(benchPress.weight, benchPress.reps, setBenchPress, true)}>
        計算臥推力量
      </button>
      {benchPress.max && <p>最大力量：{benchPress.max} 公斤</p>}
      {benchPress.score && <p>分數：{benchPress.score} 分</p>}

      {/* 深蹲 */}
      <h2>深蹲</h2>
      <input
        type="number"
        placeholder="重量 (公斤)"
        value={squat.weight}
        onChange={(e) => setSquat((prev) => ({ ...prev, weight: e.target.value }))}
      />
      <input
        type="number"
        placeholder="可完成次數 (12次以下較為準確)"
        value={squat.reps}
        onChange={(e) => setSquat((prev) => ({ ...prev, reps: e.target.value }))}
      />
      <button onClick={() => calculateMaxStrength(squat.weight, squat.reps, setSquat, false, true)}>
        計算深蹲力量
      </button>
      {squat.max && <p>最大力量：{squat.max} 公斤</p>}
      {squat.score && <p>分數：{squat.score} 分</p>}

      {/* 硬舉 */}
      <h2>硬舉</h2>
      <input
        type="number"
        placeholder="重量 (公斤)"
        value={deadlift.weight}
        onChange={(e) => setDeadlift((prev) => ({ ...prev, weight: e.target.value }))}
      />
      <input
        type="number"
        placeholder="可完成次數 (12次以下較為準確)"
        value={deadlift.reps}
        onChange={(e) => setDeadlift((prev) => ({ ...prev, reps: e.target.value }))}
      />
      <button onClick={() => calculateMaxStrength(deadlift.weight, deadlift.reps, setDeadlift, false, false, true)}>
        計算硬舉力量
      </button>
      {deadlift.max && <p>最大力量：{deadlift.max} 公斤</p>}
      {deadlift.score && <p>分數：{deadlift.score} 分</p>}

      {/* 引體向上或滑輪下拉 */}
      <h2>背部訓練（選擇引體向上或滑輪下拉）</h2>
      <select value={pullUpType} onChange={handlePullUpTypeChange}>
        <option value="pullUp">引體向上</option>
        <option value="latPulldown">滑輪下拉</option>
      </select>
      <input
        type="number"
        placeholder={pullUpType === 'pullUp' ? "重量 (自動設為您的體重)" : "重量 (公斤)"}
        value={pullUp.weight}
        readOnly={pullUpType === 'pullUp'} // 引體向上時重量欄位唯讀
        onChange={(e) => setPullUp((prev) => ({ ...prev, weight: e.target.value }))}
      />
      <input
        type="number"
        placeholder={pullUpType === 'pullUp' ? "請輸入次數" : "可完成次數 (12次以下較為準確)"}
        value={pullUp.reps}
        onChange={(e) => setPullUp((prev) => ({ ...prev, reps: e.target.value }))}
      />
      <button onClick={() => calculateMaxStrength(pullUp.weight, pullUp.reps, setPullUp, false, false, false, true)}>
        計算背部訓練力量
      </button>
      {pullUp.max && (
        <p>{pullUpType === 'pullUp' ? `完成次數：${pullUp.max} 次` : `最大力量：${pullUp.max} 公斤`}</p>
      )}
      {pullUp.score && <p>分數：{pullUp.score} 分</p>}

          {/* 站姿肩推 */}
    <h2>站姿肩推</h2>
    <input
      type="number"
      placeholder="重量 (公斤)"
      value={shoulderPress.weight}
      onChange={(e) => setShoulderPress((prev) => ({ ...prev, weight: e.target.value }))}
    />
    <input
      type="number"
      placeholder="可完成次數 (12次以下較為準確)"
      value={shoulderPress.reps}
      onChange={(e) => setShoulderPress((prev) => ({ ...prev, reps: e.target.value }))}
    />
    <button onClick={() => calculateMaxStrength(shoulderPress.weight, shoulderPress.reps, setShoulderPress, false, false, false, false, true)}>
      計算站姿肩推力量
    </button>
    {shoulderPress.max && <p>最大力量：{shoulderPress.max} 公斤</p>}
    {shoulderPress.score && <p>分數：{shoulderPress.score} 分</p>}

      <div className="radar-chart">
        <Radar data={radarData} options={radarOptions} />
      </div>
      {averageScore && <p>平均分數：{averageScore} 分</p>}

      <button onClick={() => navigate('/strength/instructions', { state: { gender, height, weight, age } })}>
        動作說明
      </button>
      <button onClick={handleSubmit}>提交並返回總覽</button>
    </div>
  );
}

export default Strength;