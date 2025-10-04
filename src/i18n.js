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
      calculate: '計算',
      back: '返回',
      next: '下一步',
      submit: '提交',
      submitAndReturn: '提交並返回總覽',
      submitting: '提交中…',
      edit: '編輯',
      delete: '刪除',
      search: '搜尋',
      searching: '搜尋中... ',
      filter: '篩選',
      all: '全部',
      loggedIn: '已登入',
      loggedOut: '未登入',
      notFound: '404 - 頁面未找到',
      deleting: '刪除中…',
      ageLabel: '年齡',
      genderLabel: '性別',
      weightLabel: '體重',
      notEntered: '未輸入',
      notSelected: '未選擇',
      or: '或',
      points: '分',
    },

    // 歷史紀錄
    history: {
      title: '歷史紀錄',
      legendTitle: '🎯 分數解讀',
      legendExcellent: '80+ 優秀',
      legendGood: '60-79 良好',
      legendFair: '40-59 一般',
      legendPoor: '1-39 待加強',
      table: {
        date: '日期',
        strength: '力量',
        explosive: '爆發力',
        cardio: '心肺',
        muscle: '肌肉量',
        ffmi: 'FFMI',
        total: '總分',
        select: '選擇',
      },
      pagination: {
        prev: '← 上一頁',
        next: '下一頁 →',
      },
      mobileToggle: {
        showDate: '顯示日期 📅',
        showAll: '顯示所有指標 📊',
      },
      count: {
        label: '📊 記錄數量：',
        nearLimit: '⚠️ 記錄數量接近上限，建議清理舊記錄',
        atLimit: '🚫 記錄數量已達上限，無法新增記錄，請先清理舊記錄',
      },
      actions: {
        clear: '清理資料',
        cancel: '取消',
        deleteSelected: '刪除所選',
      },
      empty: {
        title: '📋 尚無歷史紀錄',
        p1: '完成評測後，您的紀錄就會出現在這裡',
        p2: '開始您的最強肉體之旅吧！',
      },
      chart: {
        title: '📈 數據趨勢圖',
        note: '顯示最近六次數據',
        options: {
          total: '總分',
          strength: '力量',
          explosive: '爆發力',
          cardio: '心肺',
          muscle: '肌肉量',
          ffmi: 'FFMI',
        },
      },
    },

    // 隱私權與錯誤
    privacy: {
      title: '隱私權政策',
      acceptAndContinue: '我同意並繼續',
    },
    errorBoundary: {
      title: '發生錯誤',
      description: '應用程序遇到了一個問題，請稍後再試或聯繫支持團隊。',
      reload: '重新載入頁面',
      detailsDev: '錯誤詳情 (開發模式)',
    },

    // 資料安全說明
    dataSecurity: {
      title: '資料安全承諾',
      points: [
        '您的個人資料使用 Google Firebase 安全儲存，符合國際安全標準',
        '所有資料傳輸都經過 HTTPS 加密保護',
        '我們絕不會將您的資料出售或分享給第三方',
        '您可以隨時在會員中心查看、修改或刪除您的資料',
      ],
      viewPolicy: '查看完整隱私權政策',
    },

    // 導覽列（底部）
    navbar: {
      community: '社群',
      home: '首頁',
      assessment: '開始評測',
      ladder: '天梯',
      history: '歷史',
      settings: '設定',
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
      terms: '使用條款',
      about: '關於',
      disclaimer: '免責聲明',
      contact: '聯絡我們',
    },

    // 首頁
    landing: {
      hero: {
        title: '【健身RPG】\n運動升級邁向最強肉體',
        subtitle:
          '5大能力值科學評測，升級你的肉體，與全球健身玩家競逐天梯排行榜',
        startButton: '立即開始評測',
        guestButton: '訪客模式體驗',
        slogan: '打造五邊形全能戰士',
      },
      features: {
        title: '核心功能特色',
        strength: {
          title: '力量評測',
          desc: '胸、肩、背、腿、核心全面評測',
        },
        power: {
          title: '爆發力評測',
          desc: '垂直跳躍、立定跳遠、衝刺測試',
        },
        cardio: {
          title: '心肺耐力',
          desc: '跑步測試，評估心血管健康狀況',
        },
        muscle: {
          title: '肌肉量評估',
          desc: '骨骼肌肉量計算與分析',
        },
        bodyfat: {
          title: '體脂分析',
          desc: 'FFMI 指數計算，科學評估體脂率',
        },
        ladder: {
          title: '天梯排行榜',
          desc: '與全球用戶競爭，激勵持續進步',
        },
      },
      stats: {
        title: '應用數據',
        assessments: '大評測項目',
        scoring: '分評分系統',
        availability: '全天候服務',
        languages: '種語言支援',
      },
      users: {
        title: '適用人群',
        fitness: {
          title: '健身愛好者',
          desc: '追蹤訓練效果，設定健身目標',
        },
        athletes: {
          title: '運動員',
          desc: '評估體能狀態，優化訓練計畫',
        },
        coaches: {
          title: '健身教練',
          desc: '教學輔助工具，學員評估',
        },
        general: {
          title: '一般用戶',
          desc: '了解身體狀況，開始健身之旅',
        },
      },
      cta: {
        title: '準備好開始你的健身評測之旅了嗎？',
        subtitle: '立即註冊或使用訪客模式開始體驗',
        startButton: '立即開始評測',
        guestButton: '訪客模式體驗',
      },
      info: {
        title: '了解更多',
        subtitle: '深入了解我們的評測系統和團隊背景',
        features: {
          title: '功能介紹',
          desc: '了解5大評測的科學原理',
        },
        about: {
          title: '關於我們',
          desc: '認識我們的團隊和理念',
        },
      },
      footer: {
        about: '關於我們',
        privacy: '隱私政策',
        terms: '使用條款',
        contact: '聯絡我們',
      },
    },

    // 歡迎頁面
    welcomeSplash: {
      loading: '正在載入遊戲...',
      ready: '準備就緒！',
      tip: '準備好開始你的健身冒險了嗎？',
      version: '終極肉體評測系統',
    },
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
      subtitle: '完善您的個人資料，開始健身之旅',
      radarOverview: '表現總覽',
      basicInfo: '基本資料',
      nickname: '暱稱',
      modals: {
        basicInfoRequired: {
          title: '需要基本資料',
          message: '請先填寫並儲存您的身高、體重、年齡和性別，才能開始評測！',
        },
        dataNotSaved: {
          title: '資料未保存',
          message: '請確保資料已正確保存後再進行評測！',
        },
      },
      nicknamePlaceholder: '請輸入暱稱',
      generateNickname: '生成暱稱',
      gender: '性別',
      selectGender: '請選擇性別',
      male: '男性',
      female: '女性',
      height: '身高 (cm)',
      weight: '體重 (kg)',
      weightChangeReminder: '更改體重後，要重新計算所有分數唷',
      age: '年齡',
      saveData: '儲存資料',
      saving: '儲存中...',
      saveResults: '儲存評測結果',
      submitToLadder: '提交到天梯',
      updateLadderScore: '更新天梯分數',
      startTests: '開始評測',
      dataSaved: '資料已儲存成功！',
      saveFailed: '儲存失敗，請稍後再試',
      yourPerformance: '您的表現',
      powerTitle: '戰鬥力',
      radarLabels: {
        strength: '力量',
        explosivePower: '爆發力',
        cardio: '心肺耐力',
        muscle: '骨骼肌肉量',
        ffmi: 'FFMI',
      },
      ladder: {
        title: '天梯排行榜設置',
        anonymousTitle: '匿名參與天梯排名',
        anonymousDesc: '勾選後將隱藏您的暱稱和頭像，以匿名方式顯示在排行榜中',
        rankLabel: '天梯排名',
        submittedScore: '已提交分數',
        currentScore: '當前分數',
        needsSubmit: '（需提交更新）',
        ctaCompleted: '完成五項評測，可參與天梯排名',
        ctaNotCompleted: '完成 {{count}}/5 項評測後可參與天梯排名',
      },
      training: {
        title: '訓練背景（選填）',
        desc: '分享您的訓練背景，激勵其他健身愛好者！',
        profession: '職業',
        weeklyHours: '每周訓練時數',
        years: '訓練年資',
      },
      placeholders: {
        profession: '例如：工程師、學生、教師...',
        hours: '小時',
        years: '年',
      },
      avatar: {
        uploading: '上傳中...',
        change: '更換頭像',
      },
      modal: {
        invalidPositive: '身高、體重與年齡必須大於 0',
        invalidGender: '請選擇有效的性別',
        saveSuccessTitle: '儲存成功',
        saveSuccessMessage: '資料已儲存成功！',
        submitSuccessTitle: '提交成功',
        submitSuccessMessage: '您的分數 {{score}} 已成功提交到天梯！',
        viewLadder: '立即查看天梯',
        submitFailTitle: '提交失敗',
        submitFailMessage: '提交到天梯時發生錯誤，請稍後再試',
        resultSaveSuccessTitle: '儲存成功',
        resultSaveSuccessMessage: '結果已儲存',
      },
      submitConfirm: {
        title: '提交確認',
        descPrefix: '為提升天梯參考價值，防止誤植，今天還剩下',
        descSuffix: '次提交機會，每天凌晨12點將重置',
        ensureAccuracy: '確保數據準確性',
        resetDaily: '每日凌晨重置次數',
        improveValue: '提升天梯參考價值',
        cancel: '還沒填好',
        confirm: '確定提交',
      },
      limits: {
        dailyLimit: '每日更新限制',
        remainingUpdates: '今日還可更新 {{count}} 次',
        limitReached: '今日已達更新上限（3次）',
        limitReachedMessage: '今日天梯更新次數已達上限，請明天再試！',
        cooldownMessage: '請等待 {{minutes}} 分鐘後再更新',
        nextResetTime: '下次重置時間：明天 00:00',
        limitInfo:
          '為了保持天梯排名的公平性，每位用戶每日最多可更新天梯分數 3 次',
        needLoginToSubmit: '請先登入以提交到天梯',
        assessmentIncomplete: '評測未完成',
        assessmentIncompleteMessage:
          '請先完成全部5項評測（目前完成 {{count}}/5 項）',
      },
    },

    // 評測
    tests: {
      strength: '力量評測',
      strengthTitle: '力量評測',
      strengthSafetyNote: '挑戰重量時記得綁上腰帶和手套，注意安全喔',
      strengthLabels: {
        weightKg: '重量 (kg)',
        reps: '次數',
        maxStrength: '最大力量',
        score: '分數',
        distribution: '力量分佈圖',
      },
      strengthExercises: {
        benchPress: '平板臥推',
        squat: '深蹲',
        deadlift: '硬舉',
        latPulldown: '滑輪下拉',
        shoulderPress: '站姿肩推',
      },
      strengthStandards: {
        tabTitle: '評測標準說明',
        intro:
          '我們的評測標準基於 Strength Level 用戶提供的超過 1.34 億次舉重數據，涵蓋男女標準，適用於臥推、深蹲、硬舉、肩推等多項健身動作。',
        sourceLabel: '來源：',
        scoreLevelsTitle: '分數等級',
        scoreTableTitle: '分數說明',
        levels: {
          beginner: '初階-運動習慣培養中',
          novice: '入門-業餘運動愛好者',
          intermediate: '中等-訓練痕跡肉眼可見',
          advanced: '高階-職業運動員等級',
          elite: '精英-舉重、健力運動員',
        },
        guide: {
          rangeBelow40: '40分以下',
          items: {
            '90_100':
              '專業舉重、健力專項運動員、大力士水平，如魔山、輪子哥、阿諾、John Cena',
            '80_90':
              '職業運動員水平；職業格鬥、橄欖球運動員，如巨石強森、GSP(UFC次中量級世界冠軍)',
            '70_80': '國手水平、球類運動員，如大谷翔平、LBJ、傑森史塔森',
            '60_70':
              '業餘運動愛好者中的高手，如休傑克曼、克里斯漢斯沃、亨利卡維爾',
            '50_60': '中階運動愛好者',
            '40_50': '開始步入軌道',
            below40: '初學者',
          },
        },
        table: {
          range: '分數範圍',
          description: '說明',
        },
      },
      strengthComments: {
        male: {
          gte90: '頂尖表現！你已達建力、舉重專項運動員水平！接受掌聲吧！',
          gte80: '萬里挑一！你已達到職業運動員水平，繼續稱霸！',
          gte70: '超越常人！許多國手的力量指標也落在這，相當厲害!',
          gte60: '很強！業餘運動愛好者中的佼佼者，再拼一把！',
          gte50: '不錯的水準！訓練痕跡肉眼可見！',
          gte40: '已經有基礎了，繼續進步，一切大有可為!',
          below40: '兄弟，該衝了！全力以赴，突破自己！',
        },
        female: {
          gte90: '我願稱你為神力女超人！',
          gte80: '太驚艷了！你應該是朋友圈裡最強的吧？超棒的！',
          gte70: '真的很傑出！表現超棒，繼續保持哦！',
          gte60: '表現超棒！超越大多數人，你很厲害！',
          gte50: '很棒的水準！再努力一點，你會更好！',
          gte40: '有規律良好的運動習慣了！再接再厲',
          below40: '親愛的，還有進步空間，繼續加油哦！',
        },
      },
      explosivePower: '爆發力評測',
      powerTitle: '爆發力評測',
      powerLabels: {
        movementsTitle: '爆發力動作',
        verticalJump: '垂直彈跳 (公分)',
        standingLongJump: '立定跳遠 (公分)',
        sprint: '100公尺衝刺跑 (秒)',
        descriptionTitle: '動作說明',
        standardsTitle: '檢測標準說明',
        sourceLabel: '來源：',
        basisLabel: '依據：',
        scoreLabels: {
          verticalJump: '垂直彈跳分數',
          standingLongJump: '立定跳遠分數',
          sprint: '100公尺衝刺跑分數',
          final: '最終分數',
        },
      },
      powerInfo: {
        howTo: {
          verticalJump:
            '測量垂直跳躍高度，反映下肢爆發力。站立時伸手觸及最高點，然後全力跳起觸及最高點，兩者高度差即為垂直彈跳高度（單位：公分）。',
          standingLongJump:
            '測量站立跳躍距離，反映下肢力量和協調性。雙腳站立於起跳線，無助跑直接跳出，測量起跳線(腳尖)到著地點(腳跟)最近處的距離（單位：公分）。',
          sprint:
            '測量短距離衝刺速度，反映全身爆發力和速度。從靜止起跑，盡全力衝刺100公尺，記錄完成時間（單位：秒）。',
          tip: '建議：測量前充分熱身，避免受傷。使用專業設備或在標準場地進行測量以確保準確性。',
        },
        standards: {
          source:
            '參考教育部體育署體適能網站、美國運動醫學會（ACSM）、世界田徑協會及全國中等學校運動會田徑標準。',
          basedOn: {
            vjump: '原地垂直彈跳：ACSM標準與青少年數據。',
            slj: '立定跳遠：教育部常模與ACSM衰退研究。',
            sprint: '100公尺衝刺跑：世界田徑與全國運動會標準。',
          },
          remark:
            '本測驗包含推測值：12-80歲全齡數據不全，依ACSM每10年下降10-15%、性別差異70-90%推估。',
        },
      },
      cardio: '心肺耐力評測',
      cardioTitle: '心肺耐力評測',
      cardioLabels: {
        distanceMeters: '跑步距離 (公尺)',
        score: '心肺耐力分數',
      },
      cardioInfo: {
        cooperTitle: 'Cooper 12 分鐘跑步測試',
        sectionTitle: '動作說明',
        measureLabel: '測量方式',
        introTitle: 'Cooper Test 簡介',
        introText:
          '傳統心肺耐力測試需在實驗室以極限強度測量最大攝氧量（VO₂ Max），但難以普及。Cooper 博士提出 12 分鐘跑步測試，透過跑步距離推估 VO₂ Max，簡化測量並提升效率。',
        items: {
          place: '地點：選擇田徑場或安全跑步環境，方便記錄距離和配速。',
          record: '記錄：用圈數或運動手錶記錄 12 分鐘跑步距離。',
          warmup: '熱身：測試前動態熱身 10-15 分鐘，避免受傷。',
        },
        sourceNote:
          '本 Cooper 測試標準表可在 Cooper Test Chart 找到，由 Carl Magnus Swahn 設計。',
      },
      cardioComments: {
        male: {
          r0: '兄弟，該動起來了！全力衝刺吧！',
          r10: '還不夠熱血！再加把勁，衝上去！',
          r20: '起步了！再加速，展現你的實力！',
          r30: '進步中！再拼一點，突破極限吧！',
          r40: '不錯！再猛一點，超越自己！',
          r50: '很棒了！再衝刺，成為王者吧！',
          r60: '強者氣勢！再加速，稱霸全場！',
          r70: '超強！熱血沸騰，繼續衝刺！',
          r80: '頂尖表現！再拼，成為傳說！',
          r90: '無敵了！你是真正的王者，保持！',
          r100: '無敵了！你是真正的王者，保持！',
        },
        female: {
          r0: '親愛的，別氣餒，慢慢進步哦！',
          r10: '再努力一點，你會更好的，加油！',
          r20: '小進步了！繼續加油，你很棒！',
          r30: '進步了呢！再努力一點，會更好哦！',
          r40: '很棒了！再加把勁，你會更棒的！',
          r50: '表現很好！再努力一點，超棒的！',
          r60: '好厲害！繼續保持，你很棒哦！',
          r70: '真的很棒！保持下去，你最棒了！',
          r80: '太厲害了！繼續努力，你超棒的！',
          r90: '完美表現！超棒的你，繼續保持！',
          r100: '完美表現！超棒的你，繼續保持！',
        },
        default: '加油！',
      },
      strengthErrors: {
        missingInputs: '請輸入重量和次數！',
        missingUserData: '請確保已輸入有效的體重和年齡！',
        repsTooHigh: '可完成次數不得超過12次，請重新輸入！',
        needAtLeastOne: '請至少完成一項評測！',
        updateFail: '更新用戶數據或導航失敗，請稍後再試！',
      },
      cardioErrors: {
        missingPrerequisites:
          '請確保已在用戶信息中輸入年齡和性別，並在此輸入跑步距離！',
        invalidInputs: '請輸入有效的跑步距離和年齡！',
        standardsNotFound: '無法找到對應的評測標準，請檢查年齡和性別！',
        needCalculate: '請先計算心肺耐力分數！',
        updateUserFail: '更新用戶數據失敗，請稍後再試！',
      },
      powerErrors: {
        missingPrerequisites: '請確保已在用戶信息中輸入年齡和性別！',
        noAnyInput: '請至少輸入一項動作數據！',
        invalidAge: '請輸入有效的年齡！',
        standardsNotFound: '無法找到對應的評測標準，請檢查年齡和性別！',
        needMeasure: '請至少完成一項動作的測量！',
        needCalculate: '請先計算爆發力分數！',
        updateUserFail: '更新用戶數據失敗，請稍後再試！',
      },
      ffmiErrors: {
        missingPrerequisites: '請先在用戶信息頁面填寫性別、身高、體重和年齡',
        missingBodyFat: '請輸入體脂肪率',
        needCalculate: '請先計算 FFMI 分數！',
        updateUserFail: '更新用戶數據失敗，請稍後再試！',
      },
      muscleMass: '骨骼肌肉量',
      muscleTitle: '骨骼肌肉量評測',
      muscleLabels: {
        smmKg: '骨骼肌肉量 (kg)',
        numbersComparison: '數值比較',
        finalScore: '最終分數',
        chartScore: '分數',
        chartName: '名稱',
        sectionTitle: '數據說明',
        smmShort: 'SMM',
        smPercentShort: 'SM%',
        smPercentScore: 'SM% 分數',
      },
      muscleErrors: {
        missingPrerequisites:
          '請確保已在用戶信息中輸入體重、年齡和性別，並在此輸入骨骼肌肉量！',
        invalidInputs: '請輸入有效的體重、骨骼肌肉量和年齡！',
        standardsNotFound: '無法找到對應的評測標準，請檢查年齡和性別！',
        needCalculate: '請先計算骨骼肌肉量分數！',
        updateUserFail: '更新用戶數據失敗，請稍後再試！',
      },
      bodyFat: '體脂肪率與FFMI',
      ffmiTitle: '體脂肪率與 FFMI',
      ffmiLabels: {
        bodyFatPercent: '體脂肪率 (%)',
        resultTitle: '您的評估結果',
        ffmi: 'FFMI',
        ffmiScore: 'FFMI 評分',
        ffmiCategory: 'FFMI 等級',
        tableTitle: 'FFMI 對照表',
        male: '男性',
        female: '女性',
        columns: {
          range: 'FFMI 範圍',
          evaluation: '評價',
        },
        whatIs: 'FFMI 是什麼？',
      },
      ffmiInfo: {
        whatIs:
          'FFMI（Fat Free Mass Index 無脂肪質量指數）用來評估肌肉量多寡，考量身高與體脂，比 BMI 更準確。數值越高，代表肌肉量越多，是健身評估常用指標。在以下幾個狀況下易造成結果失真：',
        caveats: {
          tall: '受測者身高高於平均標準 (190 以上)',
          highFat: '受測者體脂肪率顯著高於平均標準',
          heavy: '受測者體重高於平均標準',
        },
        maleTable: {
          r16_17: '肌肉量低於平均',
          r18_19: '肌肉量在平均值',
          r20_21: '肌肉量高於平均值',
          r22: '肌肉量很高',
          r23_25: '肌肉量極高',
          r26_27: '肌肉量已經高到可能有使用藥物',
          r28_30: '不用藥不可能達到的數值',
        },
        femaleTable: {
          r13_14: '肌肉量低於平均',
          r15_16: '肌肉量在平均值',
          r17_18: '肌肉量高於平均值',
          r19_21: '肌肉量很高',
          r22plus: '不用藥不可能達到的數值',
        },
      },
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
      loading: '載入排行榜中...',
      filters: {
        total: '🏆 總排行榜',
        weekly: '⭐ 本周新進榜',
      },
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
      emptyWeekly: {
        title: '暫無本周新進榜數據',
        subtitle: '本周完成評測即可上榜！',
      },
      time: {
        justNow: '剛剛',
        minutesAgo: '{{count}}分鐘前',
        hoursAgo: '{{count}}小時前',
        daysAgo: '{{count}}天前',
      },
      labels: {
        updatedAt: '更新於',
        myRankLabel: '我的排名',
      },
      buttons: {
        showTop50: '顯示前50名精華區',
        showMyRange: '顯示我的排名範圍',
      },
      rangeInfo: '您的排名範圍（第 {{start}} - {{end}} 名）',
      tooltips: {
        viewTraining: '點擊查看訓練背景',
      },
      footer: {
        scoreFormula: '完成所有評測項目即可計算天梯分數',
        formula: '天梯分數 = (力量 + 爆發力 + 心肺 + 肌肉量 + 體脂) ÷ 5',
        weeklyInfo: '📅 本周新進榜：顯示過去7天內有活動的用戶',
        myRankTip:
          '💡 提示：您的排名為第 {{rank}} 名，可以點擊上方按鈕查看您附近的競爭對手',
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
      modal: {
        title: '註冊帳號才能使用此功能',
        message:
          '好友與天梯功能僅限註冊用戶使用，立即註冊帳號即可解鎖完整社交體驗！',
        registerButton: '前往註冊/登入',
        cancelButton: '取消',
      },
    },

    // 錯誤訊息
    errors: {
      required: '此欄位為必填',
      invalidFormat: '格式不正確',
      networkError: '網路錯誤，請稍後再試',
      authError: '認證失敗',
      saveError: '儲存失敗',
      loadError: '載入失敗',
      emailRequired: '請輸入電子郵件',
      emailInvalid: '請輸入有效的電子郵件地址',
      passwordRequired: '請輸入密碼',
      passwordTooShort: '密碼長度至少 6 碼',
    },

    // 登入頁
    login: {
      login: '登入',
      register: '註冊',
      email: '電子郵件',
      password: '密碼',
      emailPlaceholder: '輸入你的電子郵件',
      passwordPlaceholder: '輸入你的密碼',
      rememberMe: '記住我的帳號',
      switchToLogin: '已有帳號？點此登入',
      switchToRegister: '沒有帳號？點此註冊',
      google: '使用 Google 登入',
      processing: '處理中...',
      guestMode: '訪客模式體驗',
      instructions: {
        title: '使用說明',
        items: {
          fair: {
            title: '公平評測',
            desc: '依性別、年齡、身高、體重，結合科學統計，分數化呈現，簡單易懂。',
          },
          analysis: {
            title: '全面分析',
            desc: '五邊形雷達圖顯示弱項，指引補強方向。',
          },
          tracking: {
            title: '成長追蹤',
            desc: '記錄進步軌跡，優化課表效率。',
          },
        },
      },
    },

    // 關於我們頁面
    about: {
      header: {
        title: '關於我們',
        subtitle: '最強肉體評測系統',
      },
      hero: {
        title: '科學化健身評測的領導者',
        subtitle:
          '我們致力於提供最準確、最科學的身體素質評估，幫助每個人了解自己的身體潛能',
        backButton: '返回首頁',
        contactButton: '聯絡我們',
      },
      mission: {
        title: '我們的使命',
        description:
          '我們相信每個人都應該了解自己的身體素質，並有機會透過科學化的評測來改善自己的健康狀況。我們的使命是讓健身評測變得簡單、準確且有趣。',
        point1: {
          title: '科學化評測',
          desc: '基於大量科學研究數據，提供準確的身體素質評估',
        },
        point2: {
          title: '個人化分析',
          desc: '根據年齡、性別、身高、體重等個人因素進行客製化評分',
        },
        point3: {
          title: '持續改進',
          desc: '不斷優化評測算法，確保評分標準的準確性和公平性',
        },
      },
      team: {
        title: '我們的團隊',
        subtitle: '由運動科學專家、數據分析師和軟體工程師組成的專業團隊',
        placeholder: {
          title: '團隊介紹即將上線',
          desc: '我們正在準備詳細的團隊介紹，敬請期待！',
        },
      },
      features: {
        title: '平台特色',
        subtitle: '我們提供獨特的健身評測體驗，讓您深入了解自己的身體素質',
        scientific: {
          title: '科學化評測',
          desc: '基於 Strength Level 數據庫和 Cooper 測試等科學標準，確保評測結果的準確性',
        },
        data: {
          title: '大數據分析',
          desc: '整合超過 1.34 億人次運動表現數據，提供最全面的評分基準',
        },
        personalized: {
          title: '個人化評分',
          desc: '根據個人身體條件進行客製化評分，確保評測結果的公平性',
        },
        userFriendly: {
          title: '簡潔易用',
          desc: '直觀的用戶界面設計，讓每個人都能輕鬆完成評測',
        },
      },
      technical: {
        title: '技術說明',
        subtitle: '深入了解我們的評測系統背後的科學原理和技術實現',
        dataSources: {
          title: '數據來源',
          strengthLevel: {
            title: 'Strength Level 數據庫',
            desc: '全球最大的健身數據庫，包含超過 1.34 億人次的運動表現記錄',
            point1: '涵蓋臥推、深蹲、硬舉、肩推等多項健身動作',
            point2: '男女分組統計，確保評分標準的準確性',
            point3: '持續更新，反映最新的健身趨勢和標準',
          },
          cooperTest: {
            title: 'Cooper 測試標準',
            desc: '由美國空軍上校 Kenneth Cooper 博士設計的 12 分鐘跑步測試',
            point1: '專為美軍設計的體能測驗標準，具有高度權威性',
            point2: '透過跑步距離推估最大攝氧量 (VO₂ Max)',
            point3: '適用於各年齡層，提供標準化的心肺耐力評估',
          },
          research: {
            title: '運動生理學研究',
            desc: '整合多項國際運動生理學研究數據，確保評測標準的科學性',
            point1: '參考美國運動醫學會 (ACSM) 的運動標準',
            point2: '整合世界田徑協會的田徑標準數據',
            point3: '結合各國體育署的體適能常模資料',
          },
        },
        algorithms: {
          title: '評分算法',
          scoring: {
            title: '線性插值算法',
            desc: '採用線性插值方法，根據個人數據在標準範圍內的位置計算分數，確保評分的連續性和準確性',
          },
          normalization: {
            title: '數據標準化',
            desc: '將不同來源的數據進行標準化處理，消除年齡、性別等因素的影響，確保評分的公平性',
          },
          ranking: {
            title: '排名算法',
            desc: '基於多維度評分系統，綜合考慮力量、爆發力、心肺、肌肉量、體脂等指標，計算最終排名',
          },
        },
        assessments: {
          title: '評測項目詳解',
          strength: {
            title: '力量評測',
            desc: '評估全身力量水平，包括上肢、下肢和核心力量，基於 1RM 計算公式進行評分',
          },
          explosive: {
            title: '爆發力評測',
            desc: '測試瞬間爆發力，包括垂直跳躍、立定跳遠和衝刺測試，評估快速力量輸出能力',
          },
          cardio: {
            title: '心肺耐力評測',
            desc: '透過 12 分鐘跑步測試評估心血管健康狀況，推估最大攝氧量水平',
          },
          muscle: {
            title: '肌肉量評估',
            desc: '分析身體組成，計算骨骼肌肉量 (SMM) 和肌肉量百分比，評估肌肉發達程度',
          },
          bodyfat: {
            title: '體脂分析',
            desc: '計算去脂體重指數 (FFMI)，科學評估體脂率和肌肉質量，提供身體組成分析',
          },
        },
      },
      values: {
        title: '我們的價值觀',
        subtitle: '我們的核心價值觀指導著我們的每一個決策和行動',
        science: {
          title: '科學至上',
          desc: '我們堅持基於科學研究和數據分析來開發評測系統，確保每一個評分都有科學依據',
        },
        fairness: {
          title: '公平公正',
          desc: '我們致力於提供公平的評測環境，讓每個人都能在相同的標準下進行評估',
        },
        transparency: {
          title: '透明公開',
          desc: '我們公開評測標準和算法，讓用戶了解評分原理，建立信任關係',
        },
        community: {
          title: '社群共創',
          desc: '我們鼓勵用戶參與平台建設，透過反饋和建議不斷改善服務品質',
        },
      },
      contact: {
        title: '聯絡我們',
        subtitle: '我們重視每一位用戶的意見和建議，歡迎與我們聯繫',
        email: {
          title: '電子郵件',
          desc: 'support@fitness-assessment.com',
        },
        feedback: {
          title: '意見反饋',
          desc: '透過應用程式內的意見反饋功能，直接與我們分享您的想法',
        },
        social: {
          title: '社群媒體',
          desc: '關注我們的 Facebook 和 Instagram，獲取最新資訊和健身 tips',
        },
        contactButton: '立即聯絡',
      },
      footer: {
        home: '首頁',
        features: '功能介紹',
        contact: '聯絡我們',
        copyright: '© 2024 最強肉體評測系統. 版權所有.',
      },
    },

    // 功能介紹頁面
    features: {
      hero: {
        title: '科學化健身評測系統',
        subtitle: '透過 5 大評測項目，全面了解你的身體素質，打造五邊形全能戰士',
        startButton: '立即開始評測',
        backButton: '返回首頁',
      },
      overview: {
        title: '5大評測項目',
        subtitle: '基於科學研究與大數據分析，提供準確的身體素質評估',
      },
      strength: {
        title: '力量評測',
        description: '評估全身力量水平，包括上肢、下肢和核心力量',
        exercises: '評測動作',
        benchPress: '平板臥推',
        squat: '深蹲',
        deadlift: '硬舉',
        latPulldown: '滑輪下拉',
        shoulderPress: '站姿肩推',
        standards: '評分標準',
        standardsDesc: '基於 Strength Level 數據庫，男女分組評分',
      },
      power: {
        title: '爆發力測試',
        description: '測試瞬間爆發力，評估快速力量輸出能力',
        tests: '測試項目',
        verticalJump: '垂直跳躍',
        standingLongJump: '立定跳遠',
        sprint: '衝刺測試',
        standards: '評分標準',
        standardsDesc: '基於年齡性別分組標準，多項目綜合評分',
      },
      cardio: {
        title: '心肺耐力',
        description: '評估心血管健康狀況，測試有氧運動能力',
        test: '測試方法',
        cooperTest: '12分鐘跑步測試 - 測量最大跑步距離',
        standards: '評分標準',
        standardsDesc: '基於 Cooper 測試標準，年齡性別對照評分',
      },
      muscle: {
        title: '肌肉量評估',
        description: '分析身體組成，評估骨骼肌肉量水平',
        method: '評估方法',
        smmCalculation: '骨骼肌肉量 (SMM) 計算與分析',
        standards: '評分標準',
        standardsDesc: '基於年齡性別標準，肌肉量百分比評分',
      },
      bodyfat: {
        title: '體脂分析',
        description: '科學評估體脂率，計算去脂體重指數 (FFMI)',
        method: '評估方法',
        ffmiCalculation: 'FFMI 指數計算，身高體重調整公式',
        standards: '評分標準',
        standardsDesc: '基於科學研究標準，男女分組評分',
      },
      science: {
        title: '科學依據',
        dataSource: '數據來源',
        dataSourceDesc:
          '參考 Strength Level (https://strengthlevel.com/)，超過 1.34 億人次的各項運動表現統計資料庫。Cooper 測試 (專為美軍設計的測驗標準)，以及各項運動生理學研究數據',
        algorithm: '評分算法',
        algorithmDesc:
          '採用線性插值算法，結合年齡性別分組，確保評分準確性和公平性',
        standards: '評分標準',
        standardsDesc:
          '100分制評分系統，分為5個等級：初階、入門、中等、高階、精英',
      },
      usage: {
        title: '使用流程',
        step1: {
          title: '註冊登入',
          desc: '創建帳號或使用訪客模式開始體驗',
        },
        step2: {
          title: '填寫資料',
          desc: '輸入基本身體資料：身高、體重、年齡、性別',
        },
        step3: {
          title: '進行評測',
          desc: '依序完成5大評測項目，獲得個人化評分',
        },
        step4: {
          title: '查看結果',
          desc: '查看雷達圖分析，參與天梯排名，追蹤進步',
        },
      },
      faq: {
        title: '常見問題',
        q1: {
          question: '評測結果準確嗎？',
          answer:
            '我們的評測系統基於科學研究和大數據分析，提供相對準確的身體素質評估。建議定期重測以追蹤進步。',
        },
        q2: {
          question: '需要專業設備嗎？',
          answer:
            '大部分評測項目可以在健身房或家中完成，建議在安全環境下進行，必要時尋求專業指導。',
        },
        q3: {
          question: '多久重測一次？',
          answer: '建議每4-6週重測一次，以追蹤訓練效果和身體變化。',
        },
        q4: {
          question: '評測安全嗎？',
          answer:
            '請根據自身能力選擇合適重量，建議有保護者協助，如有身體不適請立即停止。',
        },
        q5: {
          question: '如何提升評測分數？',
          answer:
            '建議制定全面的訓練計畫，包括力量訓練、有氧運動、營養管理，並保持規律的運動習慣。',
        },
      },
      cta: {
        title: '準備好開始你的健身評測之旅了嗎？',
        subtitle: '立即註冊或使用訪客模式開始體驗',
        startButton: '立即開始評測',
        backButton: '返回首頁',
      },
      footer: {
        about: '關於我們',
        privacy: '隱私政策',
        terms: '使用條款',
        contact: '聯絡我們',
      },
    },

    // 設定頁
    settings: {
      title: '設定',
      privacySection: '隱私與同意',
      viewPrivacy: '查看隱私權政策',
      resetConsent: '重置同意並再次顯示',
      exportLocal: '匯出本機資料',
      clearLocal: '清除本機資料',
      languageSection: '語言',
      pwaSection: 'PWA',
      checkUpdate: '檢查更新',
      dataSection: '資料/同意管理',
      loginStatus: '登入狀態',
      toPrivacyPage: '前往隱私權政策頁',
      deleteAccountDanger: '刪除帳號（不可恢復）',
      msgResetConsent: '已重置同意狀態',
      msgCheckedUpdate: '已檢查更新',
      msgNoSW: '此環境未註冊 Service Worker',
      msgCheckUpdateFail: '檢查更新失敗',
      msgExportFail: '匯出失敗',
      msgClearedLocal: '已清除本機資料',
      msgClearFail: '清除失敗',
      msgPleaseLogin: '請先登入',
      deleteConfirm: '此操作將永久刪除帳號與雲端資料，是否繼續？',
      passwordPrompt:
        '為了您的資料安全，請輸入密碼以確認刪除（此操作不可恢復）：',
      msgPasswordVerifyFail: '密碼驗證失敗，請重新登入後再試',
      msgDeleting: '正在刪除帳號…',
      msgNeedRelogin: '需要重新登入',
      msgNeedReloginToDelete: '需要重新登入後才能刪除帳號',
      msgDeleted: '帳號已刪除',
      msgDeleteFail: '刪除失敗，請稍後再試',
    },

    // 歡迎頁提示
    welcomeTooltips: {
      login: '將數據保存到雲端,隨時隨地訪問',
      guest: '無需註冊,立即開始評測',
    },

    // 社群（動態）
    community: {
      brandTitle: '肉體樂園',
      loadingFriends: '正在載入好友數據...',
      tabs: {
        feed: '動態牆',
        friends: '好友',
        invites: '邀請通知',
        search: '搜尋好友',
      },
      back: '返回社群',
      goLogin: '前往登入',
      friendLabel: '好友',
      refresh: '刷新動態',
      sharePlaceholder: '分享你的健身成果...',
      publish: '發布',
      publishing: '發布中...',
      firstPost: '發布第一條動態吧！',
      noFriends: '還沒有好友',
      goSearchFriends: '去搜尋好友吧！',
      like: '讚',
      comment: '留言',
      writeComment: '寫留言...',
      sending: '發送中...',
      send: '發送',
      processing: '處理中...',
      emptyFeed: {
        title: '還沒有動態',
        subtitle: '發布第一條動態吧！',
      },
      friend: {
        badgeFriend: '已是好友',
        badgeInvited: '邀請已發送',
        add: '加好友',
        remove: '移除好友',
      },
      invites: {
        empty: '沒有待處理的邀請',
        accept: '接受邀請',
        reject: '拒絕邀請',
      },
      search: {
        empty: '沒有找到相關用戶',
        placeholder: '搜尋暱稱或電子郵件...',
      },
      ui: {
        avatarAlt: '頭像',
        noScore: '尚未評測',
        boardTitle: '查看留言板',
        pointsUnit: '分',
      },
      time: {
        justNow: '剛剛',
        minutesAgo: '{{count}}分鐘前',
        hoursAgo: '{{count}}小時前',
        daysAgo: '{{count}}天前',
      },
      confirm: {
        deleteComment: '確定要刪除此留言嗎？',
        deleteMyComment: '確定要刪除您的留言嗎？',
        deletePost: '確定要刪除此動態嗎？此操作無法撤銷。',
      },
      fallback: {
        user: '用戶',
        anonymousUser: '匿名用戶',
        unnamedUser: '未命名用戶',
      },
      titles: {
        deletePost: '刪除此動態',
        deleteComment: '刪除此留言',
        deleteMyComment: '刪除我的留言',
      },
      messages: {
        loadFeedError: '載入動態失敗，請稍後再試',
        emptyPost: '請輸入動態內容',
        needLogin: '請先登入',
        publishSuccess: '動態發布成功！',
        publishFail: '發布失敗',
        likeFail: '點讚失敗，請稍後再試',
        postNotFound: '動態不存在',
        commentFail: '留言失敗，請稍後再試',
        commentNotFound: '留言不存在',
        noPermission: '您沒有權限執行此操作',
        deleteCommentSuccess: '留言已刪除',
        deleteCommentFail: '刪除留言失敗，請稍後再試',
        deletePostSuccess: '動態已刪除',
        deletePostFail: '刪除動態失敗，請稍後再試',
        loadFriendsFail: '載入好友數據失敗，請稍後再試',
        friendLimitReached: '好友數量已達上限',
        friendLimitMessage:
          '您的好友數量已達到上限（100個），無法添加更多好友。建議刪除一些不活躍的好友來騰出空間。',
        friendLimitInfo: '為了保持社群品質，每位用戶最多可添加100個好友',
        currentFriends: '當前好友',
        searchFail: '搜尋失敗',
        inviteSent: '好友邀請已發送',
        inviteSendFail: '發送邀請失敗',
        inviteAccepted: '已接受好友邀請',
        inviteAcceptFail: '接受邀請失敗',
        inviteRejected: '已拒絕好友邀請',
        inviteRejectFail: '拒絕邀請失敗',
        friendRemoved: '已移除好友',
        friendRemoveFail: '移除好友失敗',
        loadDataFail: '載入數據失敗，請稍後再試',
      },
    },
    friendFeed: {
      ui: {
        avatarAlt: '頭像',
        boardTitle: '查看留言板',
        inputPlaceholder: '給用戶留言...',
        firstPostTitle: '還沒有動態',
        firstPostSubtitle: '來寫下第一條留言吧！',
        loading: '載入中...',
        pageTitle: '用戶 {{id}} 的個人版',
      },
      messages: {
        emptyUserId: '用戶ID為空',
        userNotFound: '找不到該用戶',
        loadUserFail: '載入用戶資料失敗',
        needLogin: '請先登入後再訪問此頁面',
        publishSuccess: '動態發布成功！',
        publishFail: '發布失敗',
        needLoginShort: '請先登入',
        postNotFound: '動態不存在',
        commentFail: '留言失敗，請稍後再試',
        noPermission: '您沒有權限執行此操作',
        deleteCommentSuccess: '留言已刪除',
        deleteCommentFail: '刪除留言失敗，請稍後再試',
        deletePostSuccess: '動態已刪除',
        deletePostFail: '刪除動態失敗，請稍後再試',
        actionFail: '操作失敗，請稍後再試',
      },
      time: {
        justNow: '剛剛',
        minutesAgo: '{{count}}分鐘前',
        hoursAgo: '{{count}}小時前',
        daysAgo: '{{count}}天前',
      },
      confirm: {
        deleteComment: '確定要刪除此留言嗎？',
        deleteMyComment: '確定要刪除您的留言嗎？',
        deletePost: '確定要刪除此動態嗎？此操作無法撤銷。',
      },
    },
    // 好友
    friends: {
      title: '好友系統',
      tabs: {
        friends: '好友列表',
        requests: '邀請通知',
        search: '搜尋好友',
      },
      emptyFriends: '還沒有好友，去搜尋一些吧！',
      buttons: {
        reload: '重新載入',
        checkInvitations: '檢查邀請',
      },
      emptyRequests: '沒有待處理的好友邀請',
      requestAction: {
        wantsToAdd: '想要加您為好友',
        accept: '接受',
        reject: '拒絕',
      },
      search: {
        placeholder: '搜尋用戶暱稱或電子郵件...',
        tips: {
          title: '搜尋提示：',
          nicknamePrefix: '輸入暱稱的開頭部分進行搜尋',
          fullEmail: '輸入完整的電子郵件地址',
          excludeSelf: '搜尋結果會自動排除自己',
        },
        empty: {
          title: '沒有找到匹配的用戶',
          try: '請嘗試：',
          checkSpelling: '檢查拼寫是否正確',
          prefix: '嘗試暱稱的開頭部分',
          fullEmail: '使用完整的電子郵件地址',
        },
      },
      challenge: {
        boardTitle: '挑戰留言板',
        types: {
          strength: '力量挑戰',
          endurance: '耐力挑戰',
          power: '爆發力挑戰',
          comprehensive: '綜合挑戰',
        },
        inputPlaceholder: '輸入您的 {{example}}...',
        publish: '發布挑戰',
        expiredWarning: '⏰ 發現過期挑戰，點擊下方按鈕更新狀態',
        updateExpired: '更新過期挑戰',
        empty: {
          title: '目前沒有挑戰留言',
          subtitle: '您可以發布一個新的挑戰！',
        },
        publishedBy: '發布於',
        accept: '接受挑戰',
        reject: '拒絕挑戰',
        complete: '完成挑戰',
        selectFriend: {
          title: '請選擇一位好友開始挑戰',
          subtitle: '點擊好友列表中的 🏆 按鈕',
        },
      },
      messages: {
        loadFriendsFail: '載入好友列表失敗',
        loadInvitesFail: '載入好友邀請失敗',
        searchFail: '搜尋失敗',
        alreadyInvited: '已經發送過好友邀請，請稍後再試或檢查邀請通知',
        inviteSent: '好友邀請已發送',
        inviteSendFail: '發送邀請失敗',
        inviteAccepted: '已接受好友邀請',
        inviteAcceptFail: '接受邀請失敗',
        inviteRejected: '已拒絕好友邀請',
        inviteRejectFail: '拒絕邀請失敗',
        removeConfirm: '確定要移除這位好友嗎？',
        removed: '已移除好友',
        removeFail: '移除好友失敗',
        challengeSent: '挑戰發送成功！',
        challengeSendFail: '發送挑戰失敗',
        loadChallengesFail: '載入挑戰失敗，請稍後再試',
        respondFail: '回應挑戰失敗',
        shownInvitesInfo: '已顯示所有邀請資訊，請查看控制台',
        clearFail: '清除失敗',
      },
    },
  },
};

// 英文語言包
const enUS = {
  translation: {
    // History (EN)
    history: {
      title: 'History',
      legendTitle: '🎯 Score guide',
      legendExcellent: '80+ Excellent',
      legendGood: '60-79 Good',
      legendFair: '40-59 Fair',
      legendPoor: '1-39 Needs improvement',
      table: {
        date: 'Date',
        strength: 'Strength',
        explosive: 'Explosive',
        cardio: 'Cardio',
        muscle: 'Muscle',
        ffmi: 'FFMI',
        total: 'Total',
        select: 'Select',
      },
      pagination: {
        prev: '← Prev',
        next: 'Next →',
      },
      mobileToggle: {
        showDate: 'Show date 📅',
        showAll: 'Show all metrics 📊',
      },
      count: {
        label: '📊 Records:',
        nearLimit: '⚠️ Near the record limit. Consider clearing old records',
        atLimit:
          "🚫 Record limit reached. Can't add new records. Clear old ones first",
      },
      actions: {
        clear: 'Clear data',
        cancel: 'Cancel',
        deleteSelected: 'Delete selected',
      },
      empty: {
        title: '📋 No history yet',
        p1: 'Your records will appear here after completing assessments',
        p2: 'Start your fitness journey now!',
      },
      chart: {
        title: '📈 Trend chart',
        note: 'Showing the latest six entries',
        options: {
          total: 'Total',
          strength: 'Strength',
          explosive: 'Explosive',
          cardio: 'Cardio',
          muscle: 'Muscle',
          ffmi: 'FFMI',
        },
      },
    },
    // 通用
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      calculate: 'Calculate',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      submitAndReturn: 'Submit and return',
      submitting: 'Submitting…',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      searching: 'Searching... ',
      filter: 'Filter',
      all: 'All',
      loggedIn: 'Logged in',
      loggedOut: 'Logged out',
      notFound: '404 - Page not found',
      deleting: 'Deleting…',
      ageLabel: 'Age',
      genderLabel: 'Gender',
      weightLabel: 'Weight',
      notEntered: 'Not entered',
      notSelected: 'Not selected',
      or: 'or',
      points: 'pts',
    },

    // Privacy & errors
    privacy: {
      title: 'Privacy Policy',
      acceptAndContinue: 'I agree and continue',
    },
    errorBoundary: {
      title: 'Error occurred',
      description:
        'The application encountered a problem. Please try again later or contact support.',
      reload: 'Reload page',
      detailsDev: 'Error details (development)',
    },

    dataSecurity: {
      title: 'Data Security Commitment',
      points: [
        'Your personal data is securely stored on Google Firebase and meets international security standards',
        'All data transmission is protected by HTTPS encryption',
        'We never sell or share your data with third parties',
        'You can view, modify, or delete your data at any time in the profile center',
      ],
      viewPolicy: 'View full privacy policy',
    },

    // Navbar
    navbar: {
      community: 'Muscle Park',
      home: 'Home',
      assessment: 'Start',
      ladder: 'Ladder',
      history: 'History',
      settings: 'Settings',
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
      terms: 'Terms',
      about: 'About',
      disclaimer: 'Disclaimer',
      contact: 'Contact',
    },

    // 首頁
    landing: {
      hero: {
        title: '[Fitness RPG]\nExercise to Upgrade Your Ultimate Physique',
        subtitle:
          '5 ability assessments, upgrade your physique, compete with global fitness players on the leaderboard',
        startButton: 'Start Assessment Now',
        guestButton: 'Try Guest Mode',
        slogan: 'Build Your Pentagon Warrior',
      },
      features: {
        title: 'Core Features',
        strength: {
          title: 'Strength Assessment',
          desc: 'Comprehensive assessment of chest, shoulders, back, legs, and core',
        },
        power: {
          title: 'Explosive Power Assessment',
          desc: 'Vertical jump, standing long jump, sprint test',
        },
        cardio: {
          title: 'Cardiovascular Endurance',
          desc: 'Running test to evaluate cardiovascular health',
        },
        muscle: {
          title: 'Muscle Mass Assessment',
          desc: 'Skeletal muscle mass calculation and analysis',
        },
        bodyfat: {
          title: 'Body Fat Analysis',
          desc: 'FFMI index calculation for scientific body fat assessment',
        },
        ladder: {
          title: 'Leaderboard',
          desc: 'Compete with global users to motivate continuous improvement',
        },
      },
      stats: {
        title: 'App Statistics',
        assessments: 'Assessment Categories',
        scoring: 'Point Scoring System',
        availability: '24/7 Service',
        languages: 'Language Support',
      },
      users: {
        title: 'Target Users',
        fitness: {
          title: 'Fitness Enthusiasts',
          desc: 'Track training effects and set fitness goals',
        },
        athletes: {
          title: 'Athletes',
          desc: 'Assess physical condition and optimize training plans',
        },
        coaches: {
          title: 'Fitness Coaches',
          desc: 'Teaching assistant tools and student assessment',
        },
        general: {
          title: 'General Users',
          desc: 'Understand physical condition and start fitness journey',
        },
      },
      cta: {
        title: 'Ready to start your fitness assessment journey?',
        subtitle: 'Register now or try guest mode to get started',
        startButton: 'Start Assessment Now',
        guestButton: 'Try Guest Mode',
      },
      info: {
        title: 'Learn More',
        subtitle: 'Discover our assessment system and team background',
        features: {
          title: 'Features',
          desc: 'Learn about the science behind 5 assessments',
        },
        about: {
          title: 'About Us',
          desc: 'Meet our team and philosophy',
        },
      },
      footer: {
        about: 'About Us',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        contact: 'Contact Us',
      },
    },

    // 歡迎頁面
    welcomeSplash: {
      loading: 'Loading game...',
      ready: 'Ready!',
      tip: 'Ready to start your fitness adventure?',
      version: 'Ultimate Physique Assessment System',
    },
    welcome: {
      title: 'Welcome to Ultimate Physique',
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
      subtitle: 'Complete your profile to begin your fitness journey',
      radarOverview: 'Performance Overview',
      basicInfo: 'Basic Info',
      nickname: 'Nickname',
      modals: {
        basicInfoRequired: {
          title: 'Basic Information Required',
          message:
            'Please fill in and save your height, weight, age, and gender before starting the assessment!',
        },
        dataNotSaved: {
          title: 'Data Not Saved',
          message:
            'Please ensure your data is properly saved before starting the assessment!',
        },
      },
      nicknamePlaceholder: 'Enter nickname',
      generateNickname: 'Generate',
      gender: 'Gender',
      selectGender: 'Select gender',
      male: 'Male',
      female: 'Female',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      weightChangeReminder: 'Weight changed! Recalculate scores needed.',
      age: 'Age',
      saveData: 'Save Data',
      saving: 'Saving...',
      saveResults: 'Save Assessment Result',
      submitToLadder: 'Submit to Ladder',
      updateLadderScore: 'Update Ladder Score',
      startTests: 'Start Tests',
      dataSaved: 'Data saved successfully!',
      saveFailed: 'Save failed, please try again',
      yourPerformance: 'Your performance',
      powerTitle: 'Power Score',
      radarLabels: {
        strength: 'Strength',
        explosivePower: 'Explosive Power',
        cardio: 'Cardio',
        muscle: 'Muscle Mass',
        ffmi: 'FFMI',
      },
      ladder: {
        title: 'Ladder Settings',
        anonymousTitle: 'Participate anonymously on ladder',
        anonymousDesc:
          'When enabled, your nickname and avatar are hidden and shown anonymously on the rankings',
        rankLabel: 'Ladder rank',
        submittedScore: 'Submitted score',
        currentScore: 'Current score',
        needsSubmit: '(submit to update)',
        ctaCompleted:
          'Complete all five assessments to participate in the ladder rankings',
        ctaNotCompleted: 'Participate after completing {{count}}/5 assessments',
      },
      training: {
        title: 'Training background (optional)',
        desc: 'Share your background to inspire other fitness enthusiasts!',
        profession: 'Profession',
        weeklyHours: 'Weekly training hours',
        years: 'Training years',
      },
      placeholders: {
        profession: 'e.g., Engineer, Student, Teacher...',
        hours: 'hours',
        years: 'years',
      },
      avatar: {
        uploading: 'Uploading...',
        change: 'Change avatar',
      },
      submitConfirm: {
        title: 'Submit confirmation',
        descPrefix:
          'To improve ladder reliability and prevent mistakes, you have',
        descSuffix: 'submissions left today. The count resets at 00:00 daily.',
        ensureAccuracy: 'Ensure data accuracy',
        resetDaily: 'Daily reset at midnight',
        improveValue: 'Improve ladder reference value',
        cancel: 'Not ready yet',
        confirm: 'Submit now',
      },
      limits: {
        dailyLimit: 'Daily Update Limit',
        remainingUpdates: '{{count}} updates remaining today',
        limitReached: 'Daily limit reached (3 updates)',
        limitReachedMessage:
          'You have reached the daily limit for ladder updates. Please try again tomorrow!',
        cooldownMessage:
          'Please wait {{minutes}} minutes before updating again',
        nextResetTime: 'Next reset time: Tomorrow 00:00',
        limitInfo:
          'To maintain ladder ranking fairness, each user can update their ladder score up to 3 times per day',
        needLoginToSubmit: 'Please log in to submit to the ladder',
        assessmentIncomplete: 'Assessment Incomplete',
        assessmentIncompleteMessage:
          'Please complete all 5 assessments first (currently {{count}}/5 completed)',
      },
      modal: {
        invalidPositive: 'Height, weight, and age must be greater than 0',
        invalidGender: 'Please choose a valid gender',
        saveSuccessTitle: 'Saved successfully',
        saveSuccessMessage: 'Your data has been saved!',
        submitSuccessTitle: 'Submitted',
        submitSuccessMessage:
          'Your score {{score}} was submitted to the ladder successfully!',
        viewLadder: 'View ladder now',
        submitFailTitle: 'Submission failed',
        submitFailMessage:
          'An error occurred while submitting to the ladder. Please try again later.',
        resultSaveSuccessTitle: 'Saved successfully',
        resultSaveSuccessMessage: 'Result saved',
      },
    },

    // 評測
    tests: {
      strength: 'Strength Assessment',
      strengthTitle: 'Strength Assessment',
      strengthSafetyNote:
        'When attempting heavy lifts, use a belt and wrist wraps. Stay safe!',
      strengthLabels: {
        weightKg: 'Weight (kg)',
        reps: 'Reps',
        maxStrength: '1RM',
        score: 'Score',
        distribution: 'Strength Distribution',
      },
      strengthExercises: {
        benchPress: 'Bench Press',
        squat: 'Squat',
        deadlift: 'Deadlift',
        latPulldown: 'Lat Pulldown',
        shoulderPress: 'Overhead Press',
      },
      strengthStandards: {
        tabTitle: 'Standards Guide',
        intro:
          'Our assessment standards are derived from more than 134 million lifting records contributed by Strength Level users. They include both male and female standards and apply to key lifts such as bench press, squat, deadlift, and overhead press.',
        sourceLabel: 'Source: ',
        scoreLevelsTitle: 'Score Levels',
        scoreTableTitle: 'Score Guide',
        levels: {
          beginner: 'Beginner - building exercise habits',
          novice: 'Novice - recreational lifter',
          intermediate: 'Intermediate - visible training progress',
          advanced: 'Advanced - near professional level',
          elite: 'Elite - weightlifting/powerlifting athlete',
        },
        guide: {
          rangeBelow40: 'Below 40',
          items: {
            '90_100':
              'Professional weightlifters/powerlifters and strongman level; e.g., Hafthor Bjornsson, Larry Wheels, Arnold, John Cena',
            '80_90':
              'Professional athlete level; pro fighters/football players; e.g., Dwayne Johnson, GSP (UFC champion)',
            '70_80':
              'National team level and elite ball sports athletes; e.g., Shohei Ohtani, LeBron James, Jason Statham',
            '60_70':
              'Top recreational athletes; e.g., Hugh Jackman, Chris Hemsworth, Henry Cavill',
            '50_60': 'Intermediate recreational athlete',
            '40_50': 'Getting on track',
            below40: 'Beginner',
          },
        },
        table: {
          range: 'Score Range',
          description: 'Description',
        },
      },
      strengthComments: {
        male: {
          gte90:
            'Elite performance! You are at weightlifting/powerlifting specialist level. Take a bow!',
          gte80:
            "Outstanding! You've reached professional athlete level. Keep dominating!",
          gte70:
            'Above and beyond! Many national-level athletes are around this level. Impressive!',
          gte60: 'Strong! A top recreational athlete. Push a little more!',
          gte50: 'Good level! Visible training progress.',
          gte40: "Solid foundation. Keep progressing and you'll go far!",
          below40:
            'Time to step on the gas. Give it your all and break through!',
        },
        female: {
          gte90: 'Superhero-level strength! Truly exceptional!',
          gte80: 'Amazing! Probably the strongest in your circle — awesome!',
          gte70: 'Excellent performance. Keep it up!',
          gte60: 'Great job! You\u2019re ahead of most people!',
          gte50: "Nice level! Work a bit more and you'll be even better!",
          gte40: 'Good, consistent training habits. Keep going!',
          below40: "There's plenty of room to grow. Keep it up!",
        },
      },
      explosivePower: 'Explosive Power Assessment',
      powerTitle: 'Explosive Power Assessment',
      powerLabels: {
        movementsTitle: 'Explosive movements',
        verticalJump: 'Vertical jump (cm)',
        standingLongJump: 'Standing long jump (cm)',
        sprint: '100 m sprint (s)',
        descriptionTitle: 'How to perform',
        standardsTitle: 'Standards overview',
        sourceLabel: 'Source: ',
        basisLabel: 'Based on:',
        scoreLabels: {
          verticalJump: 'Vertical jump score',
          standingLongJump: 'Standing long jump score',
          sprint: '100 m sprint score',
          final: 'Final score',
        },
      },
      powerInfo: {
        howTo: {
          verticalJump:
            'Measure the difference between standing reach and maximum jump reach to reflect lower-body explosiveness (unit: cm).',
          standingLongJump:
            'Measure the distance from the take-off line (toes) to the nearest landing point (heels) without a run-up (unit: cm).',
          sprint:
            'Measure short-distance sprint speed from a standing start. Run 100 meters at full effort and record the time (unit: seconds).',
          tip: 'Tip: Warm up thoroughly to avoid injury. Prefer professional equipment or standard tracks for accuracy.',
        },
        standards: {
          source:
            'References: Taiwan Sports Administration fitness site, ACSM (American College of Sports Medicine), World Athletics, and national school athletics standards.',
          basedOn: {
            vjump: 'Vertical jump: ACSM standards and youth datasets.',
            slj: 'Standing long jump: national norms and ACSM decline studies.',
            sprint:
              '100 m sprint: World Athletics and national games standards.',
          },
          remark:
            'Includes estimated values: due to incomplete data for ages 12–80. Decline estimated per ACSM (10–15% per decade), sex difference 70–90%.',
        },
      },
      cardio: 'Cardio Endurance Assessment',
      cardioTitle: 'Cardio Endurance Assessment',
      cardioInfo: {
        cooperTitle: 'Cooper 12-minute run test',
        sectionTitle: 'How to perform',
        measureLabel: 'Measurement',
        introTitle: 'Cooper Test Intro',
        introText:
          'Traditional VO₂ Max lab tests are hard to scale. Dr. Cooper proposed the 12-minute run to estimate VO₂ Max using running distance, simplifying and speeding up assessment.',
        items: {
          place:
            'Place: choose a track or safe running environment for distance recording.',
          record:
            'Record: count laps or use a sports watch to record distance in 12 minutes.',
          warmup: 'Warm-up: do dynamic warm-up for 10–15 minutes.',
        },
        sourceNote:
          'Cooper test standard chart by Carl Magnus Swahn (Cooper Test Chart).',
      },
      cardioComments: {
        male: {
          r0: 'Time to move, brother! Go all out!',
          r10: 'Not hot enough yet! Push harder!',
          r20: 'Good start! Speed up and show your power!',
          r30: 'Improving! Push a bit more and break your limit!',
          r40: 'Nice! Go harder and surpass yourself!',
          r50: 'Great! Sprint and claim the crown!',
          r60: 'Strong vibes! Accelerate and dominate!',
          r70: 'Awesome! Keep the heat and keep pushing!',
          r80: 'Top performance! One more push to be a legend!',
          r90: "Unstoppable! You're the real champ, keep it up!",
          r100: "Unstoppable! You're the real champ, keep it up!",
        },
        female: {
          r0: "Don't be discouraged — small steps forward!",
          r10: 'A bit more effort — you got this!',
          r20: "Small progress! Keep going — you're doing great!",
          r30: "You're improving! A little more and it'll be even better!",
          r40: "Great! Push a bit more — you'll be even better!",
          r50: 'Well done! Keep working — amazing!',
          r60: 'Impressive! Keep it up!',
          r70: "Really great! Stay the course — you're the best!",
          r80: 'Fantastic! Keep pushing — awesome!',
          r90: 'Perfect performance! Keep it going!',
          r100: 'Perfect performance! Keep it going!',
        },
        default: 'Keep it up!',
      },
      muscleMass: 'Muscle Mass',
      muscleTitle: 'Muscle Mass Assessment',
      cardioLabels: {
        distanceMeters: 'Running distance (m)',
        score: 'Cardio score',
      },
      muscleLabels: {
        smmKg: 'Skeletal muscle mass (kg)',
        numbersComparison: 'Numbers comparison',
        finalScore: 'Final score',
        chartScore: 'Score',
        chartName: 'Name',
        sectionTitle: 'Data explanation',
        smmShort: 'SMM',
        smPercentShort: 'SM%',
        smPercentScore: 'SM% score',
      },
      strengthErrors: {
        missingInputs: 'Please enter weight and reps',
        missingUserData: 'Please make sure weight and age are provided',
        repsTooHigh: 'Reps must not exceed 12. Please re-enter',
        needAtLeastOne: 'Please complete at least one exercise',
        updateFail:
          'Failed to update user data or navigate. Please try again later',
      },
      cardioErrors: {
        missingPrerequisites:
          'Please enter age and gender in the profile and input running distance here',
        invalidInputs: 'Please enter a valid running distance and age',
        standardsNotFound: 'Standards not found. Please check age and gender',
        needCalculate: 'Please calculate your cardio score first',
        updateUserFail: 'Failed to update user data. Please try again later',
      },
      powerErrors: {
        missingPrerequisites:
          'Please ensure age and gender are provided in your profile',
        noAnyInput: 'Please enter at least one movement data',
        invalidAge: 'Please enter a valid age',
        standardsNotFound: 'Standards not found. Please check age and gender',
        needMeasure: 'Please complete at least one measurement',
        needCalculate: 'Please calculate the power score first',
        updateUserFail: 'Failed to update user data. Please try again later',
      },
      ffmiErrors: {
        missingPrerequisites:
          'Please fill gender, height, weight, and age on the profile page first',
        missingBodyFat: 'Please enter body fat percentage',
        needCalculate: 'Please calculate the FFMI score first',
        updateUserFail: 'Failed to update user data. Please try again later',
      },
      muscleErrors: {
        missingPrerequisites:
          'Please ensure you have entered weight, age, and gender in the profile, and enter SMM here!',
        invalidInputs: 'Please enter valid weight, SMM, and age!',
        standardsNotFound:
          'Unable to find corresponding standards. Please check age and gender!',
        needCalculate: 'Please calculate the muscle mass score first!',
        updateUserFail: 'Failed to update user data. Please try again later!',
      },
      bodyFat: 'Body Fat & FFMI',
      ffmiTitle: 'Body Fat & FFMI',
      ffmiLabels: {
        bodyFatPercent: 'Body fat (%)',
        resultTitle: 'Your assessment result',
        ffmi: 'FFMI',
        ffmiScore: 'FFMI Score',
        ffmiCategory: 'FFMI Category',
        tableTitle: 'FFMI Reference Table',
        male: 'Male',
        female: 'Female',
        columns: {
          range: 'FFMI Range',
          evaluation: 'Evaluation',
        },
        whatIs: 'What is FFMI?',
      },
      ffmiInfo: {
        whatIs:
          'FFMI (Fat Free Mass Index) evaluates muscle mass by accounting for height and body fat — more representative than BMI. Higher values indicate greater muscle mass. Results may be biased in the cases below:',
        caveats: {
          tall: 'Height significantly above average (≥190 cm)',
          highFat: 'Body fat considerably above average',
          heavy: 'Body weight considerably above average',
        },
        maleTable: {
          r16_17: 'Below average muscle mass',
          r18_19: 'Average muscle mass',
          r20_21: 'Above average muscle mass',
          r22: 'Very high muscle mass',
          r23_25: 'Extremely high muscle mass',
          r26_27: 'So high it may indicate PED usage',
          r28_30: 'Unattainable without PEDs',
        },
        femaleTable: {
          r13_14: 'Below average muscle mass',
          r15_16: 'Average muscle mass',
          r17_18: 'Above average muscle mass',
          r19_21: 'Very high muscle mass',
          r22plus: 'Unattainable without PEDs',
        },
      },
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
      loading: 'Loading rankings...',
      filters: {
        total: '🏆 Overall',
        weekly: '⭐ New this week',
      },
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
      emptyWeekly: {
        title: 'No new rankings this week',
        subtitle: 'Complete assessments this week to rank!',
      },
      time: {
        justNow: 'Just now',
        minutesAgo: '{{count}} minutes ago',
        hoursAgo: '{{count}} hours ago',
        daysAgo: '{{count}} days ago',
      },
      labels: {
        updatedAt: 'Updated',
        myRankLabel: 'My rank',
      },
      buttons: {
        showTop50: 'Show top 50 highlight',
        showMyRange: 'Show my rank range',
      },
      rangeInfo: 'Your rank range ({{start}} - {{end}})',
      tooltips: {
        viewTraining: 'Click to view training background',
      },
      footer: {
        scoreFormula: 'Complete all assessment items to calculate ladder score',
        formula:
          'Ladder Score = (Strength + Explosive Power + Cardio + Muscle Mass + Body Fat) ÷ 5',
        weeklyInfo: '📅 New this week: users active in the past 7 days',
        myRankTip:
          '💡 Tip: Your rank is {{rank}}. Click the button above to view nearby competitors',
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
      modal: {
        title: 'Register an account to use this feature',
        message:
          'Friend and Ladder features are only available to registered users. Register an account now to unlock the complete social experience!',
        registerButton: 'Go to Register/Login',
        cancelButton: 'Cancel',
      },
    },

    // 錯誤訊息
    errors: {
      required: 'This field is required',
      invalidFormat: 'Invalid format',
      networkError: 'Network error, please try again later',
      authError: 'Authentication failed',
      saveError: 'Save failed',
      loadError: 'Load failed',
      emailRequired: 'Please enter your email',
      emailInvalid: 'Please enter a valid email address',
      passwordRequired: 'Please enter your password',
      passwordTooShort: 'Password must be at least 6 characters long',
    },

    // Login page
    login: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember my account',
      switchToLogin: 'Already have an account? Sign in',
      switchToRegister: "Don't have an account? Sign up",
      google: 'Sign in with Google',
      processing: 'Processing...',
      guestMode: 'Try Guest Mode',
      instructions: {
        title: 'How it works',
        items: {
          fair: {
            title: 'Fair scoring',
            desc: 'Scores are calculated using gender, age, height, and weight with scientific statistics. Easy to understand.',
          },
          analysis: {
            title: 'Comprehensive analysis',
            desc: 'Pentagon radar chart highlights weak areas and guides improvement.',
          },
          tracking: {
            title: 'Progress tracking',
            desc: 'Track your progress and optimize training efficiency.',
          },
        },
      },
    },

    // About page
    about: {
      header: {
        title: 'About Us',
        subtitle: 'Ultimate Physique Assessment System',
      },
      hero: {
        title: 'Leading Scientific Fitness Assessment',
        subtitle:
          'We are committed to providing the most accurate and scientific body fitness evaluation, helping everyone understand their physical potential',
        backButton: 'Back to Home',
        contactButton: 'Contact Us',
      },
      mission: {
        title: 'Our Mission',
        description:
          'We believe everyone should understand their physical fitness and have the opportunity to improve their health through scientific assessment. Our mission is to make fitness assessment simple, accurate, and fun.',
        point1: {
          title: 'Scientific Assessment',
          desc: 'Based on extensive scientific research data, providing accurate body fitness evaluation',
        },
        point2: {
          title: 'Personalized Analysis',
          desc: 'Customized scoring based on personal factors such as age, gender, height, and weight',
        },
        point3: {
          title: 'Continuous Improvement',
          desc: 'Continuously optimizing assessment algorithms to ensure accuracy and fairness of scoring standards',
        },
      },
      team: {
        title: 'Our Team',
        subtitle:
          'Professional team composed of exercise science experts, data analysts, and software engineers',
        placeholder: {
          title: 'Team Introduction Coming Soon',
          desc: 'We are preparing detailed team introductions, stay tuned!',
        },
      },
      features: {
        title: 'Platform Features',
        subtitle:
          'We provide unique fitness assessment experience, helping you deeply understand your physical fitness',
        scientific: {
          title: 'Scientific Assessment',
          desc: 'Based on Strength Level database and Cooper test standards, ensuring accuracy of assessment results',
        },
        data: {
          title: 'Big Data Analysis',
          desc: 'Integrating over 134 million exercise performance records, providing the most comprehensive scoring benchmarks',
        },
        personalized: {
          title: 'Personalized Scoring',
          desc: 'Customized scoring based on individual physical conditions, ensuring fairness of assessment results',
        },
        userFriendly: {
          title: 'User-Friendly',
          desc: 'Intuitive user interface design, allowing everyone to easily complete assessments',
        },
      },
      technical: {
        title: 'Technical Details',
        subtitle:
          'Deep dive into the scientific principles and technical implementation behind our assessment system',
        dataSources: {
          title: 'Data Sources',
          strengthLevel: {
            title: 'Strength Level Database',
            desc: "The world's largest fitness database, containing over 134 million exercise performance records",
            point1:
              'Covers multiple fitness exercises including bench press, squat, deadlift, shoulder press',
            point2:
              'Gender-grouped statistics ensuring accuracy of scoring standards',
            point3:
              'Continuously updated, reflecting latest fitness trends and standards',
          },
          cooperTest: {
            title: 'Cooper Test Standards',
            desc: '12-minute running test designed by Dr. Kenneth Cooper, US Air Force Colonel',
            point1:
              'Military-designed fitness test standard with high authority',
            point2:
              'Estimates maximum oxygen uptake (VO₂ Max) through running distance',
            point3:
              'Applicable to all age groups, providing standardized cardiovascular endurance assessment',
          },
          research: {
            title: 'Exercise Physiology Research',
            desc: 'Integrating multiple international exercise physiology research data, ensuring scientific nature of assessment standards',
            point1:
              'References American College of Sports Medicine (ACSM) exercise standards',
            point2: 'Integrates World Athletics track and field standard data',
            point3: 'Combines national sports administration fitness norm data',
          },
        },
        algorithms: {
          title: 'Scoring Algorithms',
          scoring: {
            title: 'Linear Interpolation Algorithm',
            desc: 'Using linear interpolation method, calculating scores based on individual data position within standard ranges, ensuring continuity and accuracy of scoring',
          },
          normalization: {
            title: 'Data Normalization',
            desc: 'Standardizing data from different sources, eliminating effects of age, gender and other factors, ensuring fairness of scoring',
          },
          ranking: {
            title: 'Ranking Algorithm',
            desc: 'Based on multi-dimensional scoring system, comprehensively considering strength, explosive power, cardio, muscle mass, body fat and other indicators to calculate final ranking',
          },
        },
        assessments: {
          title: 'Assessment Items Details',
          strength: {
            title: 'Strength Assessment',
            desc: 'Evaluates overall strength level including upper body, lower body and core strength, scoring based on 1RM calculation formula',
          },
          explosive: {
            title: 'Explosive Power Assessment',
            desc: 'Tests instantaneous explosive power including vertical jump, standing long jump and sprint test, evaluating rapid force output capability',
          },
          cardio: {
            title: 'Cardiovascular Endurance Assessment',
            desc: 'Evaluates cardiovascular health through 12-minute running test, estimating maximum oxygen uptake level',
          },
          muscle: {
            title: 'Muscle Mass Assessment',
            desc: 'Analyzes body composition, calculates skeletal muscle mass (SMM) and muscle mass percentage, evaluating muscle development level',
          },
          bodyfat: {
            title: 'Body Fat Analysis',
            desc: 'Calculates Fat-Free Mass Index (FFMI), scientifically evaluates body fat percentage and muscle mass, providing body composition analysis',
          },
        },
      },
      values: {
        title: 'Our Values',
        subtitle: 'Our core values guide every decision and action we take',
        science: {
          title: 'Science First',
          desc: 'We insist on developing assessment systems based on scientific research and data analysis, ensuring every score has scientific basis',
        },
        fairness: {
          title: 'Fair and Just',
          desc: 'We are committed to providing fair assessment environment, allowing everyone to be evaluated under the same standards',
        },
        transparency: {
          title: 'Transparent and Open',
          desc: 'We publicly disclose assessment standards and algorithms, letting users understand scoring principles and build trust relationships',
        },
        community: {
          title: 'Community Co-creation',
          desc: 'We encourage users to participate in platform building, continuously improving service quality through feedback and suggestions',
        },
      },
      contact: {
        title: 'Contact Us',
        subtitle:
          "We value every user's opinions and suggestions, welcome to contact us",
        email: {
          title: 'Email',
          desc: 'support@fitness-assessment.com',
        },
        feedback: {
          title: 'Feedback',
          desc: 'Share your thoughts directly with us through the feedback function in the app',
        },
        social: {
          title: 'Social Media',
          desc: 'Follow our Facebook and Instagram for latest updates and fitness tips',
        },
        contactButton: 'Contact Now',
      },
      footer: {
        home: 'Home',
        features: 'Features',
        contact: 'Contact',
        copyright:
          '© 2024 Ultimate Physique Assessment System. All rights reserved.',
      },
    },

    // Features page
    features: {
      hero: {
        title: 'Scientific Fitness Assessment System',
        subtitle:
          'Comprehensive body fitness evaluation through 5 assessment categories, build your pentagon warrior',
        startButton: 'Start Assessment Now',
        backButton: 'Back to Home',
      },
      overview: {
        title: '5 Assessment Categories',
        subtitle:
          'Based on scientific research and big data analysis, providing accurate body fitness evaluation',
      },
      strength: {
        title: 'Strength Assessment',
        description:
          'Evaluate overall strength level, including upper body, lower body, and core strength',
        exercises: 'Assessment Exercises',
        benchPress: 'Bench Press',
        squat: 'Squat',
        deadlift: 'Deadlift',
        latPulldown: 'Lat Pulldown',
        shoulderPress: 'Shoulder Press',
        standards: 'Scoring Standards',
        standardsDesc:
          'Based on Strength Level database, gender-grouped scoring',
      },
      power: {
        title: 'Explosive Power Test',
        description:
          'Test instantaneous explosive power, evaluate rapid force output capability',
        tests: 'Test Items',
        verticalJump: 'Vertical Jump',
        standingLongJump: 'Standing Long Jump',
        sprint: 'Sprint Test',
        standards: 'Scoring Standards',
        standardsDesc:
          'Based on age-gender grouped standards, multi-item comprehensive scoring',
      },
      cardio: {
        title: 'Cardiovascular Endurance',
        description:
          'Evaluate cardiovascular health status, test aerobic exercise capacity',
        test: 'Test Method',
        cooperTest: '12-minute running test - measure maximum running distance',
        standards: 'Scoring Standards',
        standardsDesc:
          'Based on Cooper test standards, age-gender comparative scoring',
      },
      muscle: {
        title: 'Muscle Mass Assessment',
        description:
          'Analyze body composition, evaluate skeletal muscle mass level',
        method: 'Assessment Method',
        smmCalculation: 'Skeletal Muscle Mass (SMM) calculation and analysis',
        standards: 'Scoring Standards',
        standardsDesc:
          'Based on age-gender standards, muscle mass percentage scoring',
      },
      bodyfat: {
        title: 'Body Fat Analysis',
        description:
          'Scientific evaluation of body fat percentage, calculate Fat-Free Mass Index (FFMI)',
        method: 'Assessment Method',
        ffmiCalculation:
          'FFMI index calculation, height-weight adjustment formula',
        standards: 'Scoring Standards',
        standardsDesc:
          'Based on scientific research standards, gender-grouped scoring',
      },
      science: {
        title: 'Scientific Basis',
        dataSource: 'Data Source',
        dataSourceDesc:
          'Reference Strength Level (https://strengthlevel.com/), a database with over 134 million exercise performance records. Cooper test (military-designed assessment standard), and various exercise physiology research data',
        algorithm: 'Scoring Algorithm',
        algorithmDesc:
          'Using linear interpolation algorithm, combined with age-gender grouping, ensuring scoring accuracy and fairness',
        standards: 'Scoring Standards',
        standardsDesc:
          '100-point scoring system, divided into 5 levels: Beginner, Novice, Intermediate, Advanced, Elite',
      },
      usage: {
        title: 'How to Use',
        step1: {
          title: 'Register/Login',
          desc: 'Create an account or use guest mode to start experiencing',
        },
        step2: {
          title: 'Fill in Data',
          desc: 'Enter basic body data: height, weight, age, gender',
        },
        step3: {
          title: 'Take Assessment',
          desc: 'Complete 5 assessment categories in sequence, get personalized scores',
        },
        step4: {
          title: 'View Results',
          desc: 'View radar chart analysis, participate in ladder rankings, track progress',
        },
      },
      faq: {
        title: 'Frequently Asked Questions',
        q1: {
          question: 'Are the assessment results accurate?',
          answer:
            'Our assessment system is based on scientific research and big data analysis, providing relatively accurate body fitness evaluation. We recommend regular retesting to track progress.',
        },
        q2: {
          question: 'Do I need professional equipment?',
          answer:
            'Most assessment items can be completed in a gym or at home. We recommend conducting in a safe environment and seeking professional guidance when necessary.',
        },
        q3: {
          question: 'How often should I retest?',
          answer:
            'We recommend retesting every 4-6 weeks to track training effects and body changes.',
        },
        q4: {
          question: 'Is the assessment safe?',
          answer:
            'Please choose appropriate weights based on your ability, we recommend having a spotter assist, and stop immediately if you feel unwell.',
        },
        q5: {
          question: 'How can I improve my assessment scores?',
          answer:
            'We recommend developing a comprehensive training plan including strength training, aerobic exercise, nutrition management, and maintaining regular exercise habits.',
        },
      },
      cta: {
        title: 'Ready to start your fitness assessment journey?',
        subtitle: 'Register now or use guest mode to start experiencing',
        startButton: 'Start Assessment Now',
        backButton: 'Back to Home',
      },
      footer: {
        about: 'About Us',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        contact: 'Contact Us',
      },
    },

    // Settings page
    settings: {
      title: 'Settings',
      privacySection: 'Privacy & Consent',
      viewPrivacy: 'View Privacy Policy',
      resetConsent: 'Reset consent and show again',
      exportLocal: 'Export local data',
      clearLocal: 'Clear local data',
      languageSection: 'Language',
      pwaSection: 'PWA',
      checkUpdate: 'Check for updates',
      dataSection: 'Data/Consent Management',
      loginStatus: 'Login status',
      toPrivacyPage: 'Go to Privacy Policy',
      deleteAccountDanger: 'Delete account (irreversible)',
      msgResetConsent: 'Consent reset',
      msgCheckedUpdate: 'Update check completed',
      msgNoSW: 'Service Worker is not registered in this environment',
      msgCheckUpdateFail: 'Failed to check updates',
      msgExportFail: 'Export failed',
      msgClearedLocal: 'Local data cleared',
      msgClearFail: 'Clear failed',
      msgPleaseLogin: 'Please log in first',
      deleteConfirm:
        'This will permanently delete your account and cloud data. Continue?',
      passwordPrompt:
        'For your security, enter your password to confirm deletion (this action cannot be undone):',
      msgPasswordVerifyFail:
        'Password verification failed. Please log in again and retry',
      msgDeleting: 'Deleting account…',
      msgNeedRelogin: 'Re-login required',
      msgNeedReloginToDelete:
        'You must re-login before you can delete your account',
      msgDeleted: 'Account deleted',
      msgDeleteFail: 'Deletion failed. Please try again later',
    },

    // Welcome page tooltips
    welcomeTooltips: {
      login: 'Save data to the cloud. Access anywhere',
      guest: 'No registration required. Start right away',
    },

    // Community (feed)
    community: {
      brandTitle: 'Muscle Park',
      loadingFriends: 'Loading friends data...',
      tabs: {
        feed: 'Feed',
        friends: 'Friends',
        invites: 'Invites',
        search: 'Find Friends',
      },
      back: 'Back to Community',
      goLogin: 'Go to Login',
      friendLabel: 'Friend',
      refresh: 'Refresh Feed',
      sharePlaceholder: 'Share your fitness progress...',
      publish: 'Post',
      publishing: 'Posting...',
      firstPost: 'Post your first update!',
      noFriends: 'No friends yet',
      goSearchFriends: 'Go find friends!',
      like: 'Like',
      comment: 'Comment',
      writeComment: 'Write a comment...',
      sending: 'Sending...',
      send: 'Send',
      processing: 'Processing...',
      emptyFeed: {
        title: 'No posts yet',
        subtitle: 'Post your first update!',
      },
      friend: {
        badgeFriend: 'Friends',
        badgeInvited: 'Invite sent',
        add: 'Add friend',
        remove: 'Remove friend',
      },
      invites: {
        empty: 'No pending invitations',
        accept: 'Accept',
        reject: 'Decline',
      },
      search: {
        empty: 'No matching users found',
        placeholder: 'Search nickname or email...',
      },
      ui: {
        avatarAlt: 'Avatar',
        noScore: 'Not assessed yet',
        boardTitle: 'View board',
        pointsUnit: 'pts',
      },
      time: {
        justNow: 'Just now',
        minutesAgo: '{{count}} minutes ago',
        hoursAgo: '{{count}} hours ago',
        daysAgo: '{{count}} days ago',
      },
      confirm: {
        deleteComment: 'Are you sure you want to delete this comment?',
        deleteMyComment: 'Are you sure you want to delete your comment?',
        deletePost: 'Delete this post? This action cannot be undone.',
      },
      fallback: {
        user: 'User',
        anonymousUser: 'Anonymous',
        unnamedUser: 'Unnamed user',
      },
      titles: {
        deletePost: 'Delete this post',
        deleteComment: 'Delete this comment',
        deleteMyComment: 'Delete my comment',
      },
      messages: {
        loadFeedError: 'Failed to load feed. Please try again later.',
        emptyPost: 'Please enter some text',
        needLogin: 'Please log in first',
        publishSuccess: 'Post published successfully!',
        publishFail: 'Failed to publish',
        likeFail: 'Failed to like. Please try again later.',
        postNotFound: 'Post not found',
        commentFail: 'Failed to comment. Please try again later.',
        commentNotFound: 'Comment not found',
        noPermission: 'You do not have permission to perform this action',
        deleteCommentSuccess: 'Comment deleted',
        deleteCommentFail: 'Failed to delete comment',
        deletePostSuccess: 'Post deleted',
        deletePostFail: 'Failed to delete post',
        loadFriendsFail: 'Failed to load friends. Please try again later.',
        friendLimitReached: 'Friend limit reached',
        friendLimitMessage:
          'You have reached the friend limit (100 friends) and cannot add more. Consider removing some inactive friends to free up space.',
        friendLimitInfo:
          'To maintain community quality, each user can add up to 100 friends',
        currentFriends: 'Current friends',
        searchFail: 'Search failed',
        inviteSent: 'Friend invitation sent',
        inviteSendFail: 'Failed to send invitation',
        inviteAccepted: 'Friend invitation accepted',
        inviteAcceptFail: 'Failed to accept invitation',
        inviteRejected: 'Friend invitation declined',
        inviteRejectFail: 'Failed to decline invitation',
        friendRemoved: 'Friend removed',
        friendRemoveFail: 'Failed to remove friend',
        loadDataFail: 'Failed to load data. Please try again later.',
      },
    },
    friendFeed: {
      ui: {
        avatarAlt: 'Avatar',
        boardTitle: 'View board',
        inputPlaceholder: 'Leave a message...',
        firstPostTitle: 'No posts yet',
        firstPostSubtitle: 'Write the first comment!',
        loading: 'Loading...',
        pageTitle: 'User {{id}} Board',
      },
      messages: {
        emptyUserId: 'User ID is empty',
        userNotFound: 'User not found',
        loadUserFail: 'Failed to load user data',
        needLogin: 'Please log in before visiting this page',
        publishSuccess: 'Post published successfully!',
        publishFail: 'Failed to publish',
        needLoginShort: 'Please log in first',
        postNotFound: 'Post not found',
        commentFail: 'Failed to comment. Please try again later.',
        noPermission: 'You do not have permission to perform this action',
        deleteCommentSuccess: 'Comment deleted',
        deleteCommentFail: 'Failed to delete comment',
        deletePostSuccess: 'Post deleted',
        deletePostFail: 'Failed to delete post',
        actionFail: 'Action failed. Please try again later.',
      },
      time: {
        justNow: 'Just now',
        minutesAgo: '{{count}} minutes ago',
        hoursAgo: '{{count}} hours ago',
        daysAgo: '{{count}} days ago',
      },
      confirm: {
        deleteComment: 'Delete this comment?',
        deleteMyComment: 'Delete your comment?',
        deletePost: 'Delete this post? This action cannot be undone.',
      },
    },
    // Friends
    friends: {
      title: 'Friends System',
      tabs: {
        friends: 'Friends',
        requests: 'Invitations',
        search: 'Find Friends',
      },
      emptyFriends: 'No friends yet. Try searching!',
      buttons: {
        reload: 'Reload',
        checkInvitations: 'Check invitations',
      },
      emptyRequests: 'No pending friend requests',
      requestAction: {
        wantsToAdd: 'wants to add you as a friend',
        accept: 'Accept',
        reject: 'Decline',
      },
      search: {
        placeholder: 'Search nickname or email...',
        tips: {
          title: 'Search tips:',
          nicknamePrefix: 'Enter the beginning of a nickname',
          fullEmail: 'Enter the full email address',
          excludeSelf: 'Results automatically exclude yourself',
        },
        empty: {
          title: 'No matching users found',
          try: 'Try:',
          checkSpelling: 'Check spelling',
          prefix: 'Try the nickname prefix',
          fullEmail: 'Use the full email address',
        },
      },
      challenge: {
        boardTitle: 'Challenge Board',
        types: {
          strength: 'Strength Challenge',
          endurance: 'Endurance Challenge',
          power: 'Power Challenge',
          comprehensive: 'Comprehensive Challenge',
        },
        inputPlaceholder: 'Enter your {{example}}...',
        publish: 'Post Challenge',
        expiredWarning:
          '⏰ Expired challenges found. Click the button below to update.',
        updateExpired: 'Update expired challenges',
        empty: {
          title: 'No challenge messages yet',
          subtitle: 'You can post a new challenge!',
        },
        publishedBy: 'posted on',
        accept: 'Accept Challenge',
        reject: 'Decline Challenge',
        complete: 'Complete Challenge',
        selectFriend: {
          title: 'Select a friend to start a challenge',
          subtitle: 'Click the 🏆 button in the friends list',
        },
      },
      messages: {
        loadFriendsFail: 'Failed to load friends list',
        loadInvitesFail: 'Failed to load invitations',
        searchFail: 'Search failed',
        alreadyInvited:
          'You have already sent a friend invitation. Please try later or check invitations',
        inviteSent: 'Friend invitation sent',
        inviteSendFail: 'Failed to send invitation',
        inviteAccepted: 'Friend invitation accepted',
        inviteAcceptFail: 'Failed to accept invitation',
        inviteRejected: 'Friend invitation declined',
        inviteRejectFail: 'Failed to decline invitation',
        removeConfirm: 'Are you sure you want to remove this friend?',
        removed: 'Friend removed',
        removeFail: 'Failed to remove friend',
        challengeSent: 'Challenge sent successfully!',
        challengeSendFail: 'Failed to send challenge',
        loadChallengesFail:
          'Failed to load challenges. Please try again later.',
        respondFail: 'Failed to respond to challenge',
        shownInvitesInfo: 'All invitations shown in console',
        clearFail: 'Failed to clear',
      },
    },
  },
};

// 取得初始語言：localStorage > 瀏覽器 > 預設 zh-TW
function getInitialLanguage() {
  try {
    const saved = localStorage.getItem('language');
    if (saved) return saved;
  } catch (error) {
    console.warn('無法讀取語言設定:', error);
  }
  const nav = (
    navigator.language ||
    navigator.userLanguage ||
    ''
  ).toLowerCase();
  if (nav.startsWith('zh')) return 'zh-TW';
  return 'en-US';
}

// 初始化 i18n（不強制覆蓋使用者選擇）
i18n.use(initReactI18next).init({
  resources: {
    'zh-TW': zhTW,
    'en-US': enUS,
  },
  lng: getInitialLanguage(),
  fallbackLng: 'zh-TW',
  supportedLngs: ['zh-TW', 'en-US'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
