export default {
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
        prev: 'Prev\n←',
        next: 'Next\n→',
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
        p2: 'Start your fitness journey!',
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
      close: 'Close',
      optional: 'Optional',
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
      community: 'Camp',
      home: 'Home',
      assessment: 'Skill Tree',
      ladder: 'Rankings',
      history: 'Progress',
      settings: 'Settings',
      tools: 'Tools',
    },

    // 導航
    navigation: {
      home: 'Home',
      profile: 'Profile',
      history: 'History',
      ladder: 'Leaderboard',
      friends: 'Friends',
      settings: 'Settings',
      logout: 'Logout',
      terms: 'Terms',
      features: 'Features',
      about: 'About',
      disclaimer: 'Disclaimer',
      contact: 'Contact',
    },

    // 首頁
    landing: {
      hero: {
        title: 'Fitness RPG\nLevel Up Your Character',
        subtitle:
          'Complete 5 fitness challenges, level up your stats, and climb the global leaderboard',
        startButton: 'Start Your Journey',
        guestButton: 'Try Demo Mode',
        slogan: 'Master All Five Stats',
      },
      features: {
        title: 'Training Skills',
        strength: {
          title: 'Strength Training',
          desc: 'Level up your chest, shoulders, back, legs, and core strength stats',
        },
        power: {
          title: 'Power Training',
          desc: 'Boost your vertical jump, long jump, and sprint speed stats',
        },
        cardio: {
          title: 'Endurance Training',
          desc: 'Improve your cardiovascular fitness and stamina stats',
        },
        muscle: {
          title: 'Muscle Development',
          desc: 'Build and track your muscle mass and body composition',
        },
        bodyfat: {
          title: 'Body Composition',
          desc: 'Optimize your body fat percentage and muscle-to-fat ratio',
        },
        ladder: {
          title: 'Global Rankings',
          desc: 'Compete with players worldwide and climb the leaderboard',
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
          desc: 'Track progress and set fitness goals',
        },
        athletes: {
          title: 'Athletes',
          desc: 'Assess physical condition and optimize training',
        },
        coaches: {
          title: 'Fitness Coaches',
          desc: 'Coaching tools and client assessment',
        },
        general: {
          title: 'General Users',
          desc: 'Understand your body and start your fitness journey',
        },
      },
      cta: {
        title: 'Ready to start your fitness adventure?',
        subtitle: 'Create your character or try demo mode',
        startButton: 'Start Your Journey',
        guestButton: 'Try Demo Mode',
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
        features: 'Features',
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
      title: 'Character Profile & Stats',
      subtitle: 'Complete your character setup to begin your adventure',
      radarOverview: 'Performance Radar',
      basicInfo: 'Basic Info',
      nickname: 'Character Name',
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
      nicknamePlaceholder: 'Enter character name',
      generateNickname: 'Generate',
      gender: 'Gender',
      selectGender: 'Select gender',
      male: 'Male',
      female: 'Female',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      weightChangeReminder: 'Weight changed! Recalculate stats needed.',
      age: 'Age',
      saveData: 'Save Character',
      saving: 'Saving...',
      saveResults: 'Save Training Results',
      submitToLadder: 'Submit to Rankings',
      updateLadderScore: 'Update Ranking Score',
      getVerification: 'Get Honor Verification',
      startTests: 'Skill Tree',
      dataSaved: 'Character saved successfully!',
      saveFailed: 'Save failed, please try again',
      yourPerformance: 'Your Character Stats',
      powerTitle: 'Battle Power',
      radarLabels: {
        strength: 'Strength',
        explosivePower: 'Explosive Power',
        cardio: 'Cardio',
        muscle: 'Muscle Mass',
        ffmi: 'FFMI',
      },
      ladder: {
        title: 'Ranking Settings',
        anonymousTitle: 'Participate anonymously on the rankings',
        anonymousDesc:
          'When enabled, your character name and avatar are hidden and shown anonymously on the rankings',
        rankLabel: 'Ranking position',
        submittedScore: 'Submitted score',
        currentScore: 'Current score',
        needsSubmit: '(submit to update)',
        ctaCompleted:
          'Complete all five training challenges to appear on the rankings',
        ctaNotCompleted:
          'Appear after completing {{count}}/5 training challenges',
      },
      training: {
        title: 'Training background (optional)',
        desc: 'Share your background to inspire other fitness enthusiasts!',
        profession: 'Profession',
        weeklyHours: 'Weekly training hours',
        years: 'Training years',
      },
      ranking: {
        country: 'Country',
        region: 'Region/City',
        city: 'City',
        selectCountry: 'Please select country',
        selectCity: 'Please select city',
        selectRegion: 'Please select region',
        regionPlaceholderOther: 'Please enter city name',
        selectCountryFirst: 'Please select country first',
        countryHint: 'Fill in to participate in country rankings',
        regionHint: 'Fill in to participate in city rankings',
        cityHint: 'Select city to choose district',
        regionComingSoon: 'City list coming soon',
      },
      placeholders: {
        profession: 'e.g., Engineer, Student, Teacher...',
        hours: 'hours',
        years: 'years',
      },
      profession: {
        engineering: 'Engineer',
        medical: 'Medical',
        coach: 'Fitness Coach',
        student: 'Student',
        police_military: 'Police/Military',
        business: 'Business/Finance',
        freelance: 'Freelance/Design',
        service: 'Service',
        other: 'Other',
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
      strength: 'Strength',
      strengthTitle: 'Strength',
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
      explosivePower: 'Power',
      powerTitle: 'Power',
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
      cardio: 'Endurance',
      cardioTitle: 'Endurance',
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
      muscleMass: 'Muscle',
      muscleTitle: 'Muscle',
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
        muscleExplanation: {
          title: 'Assessment Metrics Explanation',
          weightTitle: 'Skeletal Muscle Mass Weight',
          weightDesc:
            'Measures the total weight of skeletal muscle in your body',
          percentTitle: 'Skeletal Muscle Mass Percentage',
          percentDesc:
            'Percentage of muscle weight relative to total body weight',
          whyBoth: 'Why do we need both metrics?',
          example1:
            'Scenario 1: 35kg muscle weight, but 25% ratio → may be overweight',
          example2:
            'Scenario 2: 20kg muscle weight, but 40% ratio → may be underweight',
          solution:
            'Solution: Average both scores for a more comprehensive assessment',
        },
        scoringReference: {
          title: 'Scoring Reference',
          average: {
            title: 'Adult Average',
            range: '60 points',
            desc: 'Standard muscle mass for healthy adults',
          },
          aboveAverage: {
            title: 'Above Average',
            range: '60-70 points',
            desc: 'Muscle mass significantly above general population',
          },
          intermediate: {
            title: 'Intermediate Athlete',
            range: '70-80 points',
            desc: 'Level of regularly trained intermediate athletes',
          },
          excellent: {
            title: 'Excellent',
            range: '80-90 points',
            desc: 'Muscle mass at an excellent level',
          },
          elite: {
            title: 'Elite Level',
            range: '90-100 points',
            desc: 'Elite athlete-level muscle mass',
          },
          yourScore: 'Your Score',
        },
      },
      strengthErrors: {
        missingInputs: 'Please enter weight and reps',
        missingUserData: 'Please make sure weight and age are provided',
        repsTooHigh: 'Reps must not exceed 12. Please re-enter',
        needAtLeastOne: 'Please complete at least one training exercise',
        updateFail:
          'Failed to update character data or navigate. Please try again later',
      },
      cardioErrors: {
        missingPrerequisites:
          'Please complete your character profile (age and gender) and enter running distance',
        invalidInputs: 'Please enter a valid running distance and age',
        standardsNotFound:
          'Standards not found. Please check your character profile',
        needCalculate: 'Please calculate your endurance score first',
        updateUserFail: 'Failed to save character data. Please try again later',
      },
      powerErrors: {
        missingPrerequisites:
          'Please complete your character profile first (age and gender)',
        noAnyInput: 'Please complete at least one training session',
        invalidAge: 'Please enter a valid character age',
        standardsNotFound:
          'Character data not found. Please check your profile',
        needMeasure: 'Please complete at least one training challenge',
        needCalculate: 'Please calculate your power level first',
        updateUserFail: 'Failed to save character data. Please try again later',
      },
      ffmiErrors: {
        missingPrerequisites:
          'Please complete your character profile first (gender, height, weight, and age)',
        missingBodyFat: 'Please enter body fat percentage',
        needCalculate: 'Please calculate your body composition score first',
        updateUserFail: 'Failed to save character data. Please try again later',
      },
      muscleErrors: {
        missingPrerequisites:
          'Please complete your character profile (weight, age, gender) and enter muscle mass data',
        invalidInputs: 'Please enter valid weight, muscle mass, and age',
        standardsNotFound:
          'Character data not found. Please check your profile',
        needCalculate: 'Please calculate your muscle development score first',
        updateUserFail: 'Failed to save character data. Please try again later',
      },
      bodyFat: 'Body Fat& FFMI',
      ffmiTitle: 'Body Fat& FFMI',
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
      title: 'Global Leaderboard',
      myScore: 'My Leaderboard Score',
      myRank: 'My Rank',
      notParticipated: 'Not Participated',
      notRanked: 'Not Ranked',
      rank: 'Rank {{rank}}',
      loading: 'Loading rankings...',
      filters: {
        total: '🏆 Overall',
        weekly: '⭐ New this week',
        verified: '🏅 Verified',
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
      like: 'Like',
      unlike: 'Unlike',
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
      backToTop: 'Back to Top',
      floatingRank: {
        clickToView: 'Click to view my rank',
      },
      pagination: {
        selectPage: 'Select Page',
        page: 'Page {{page}}',
        total: 'of {{total}}',
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
      // ✅ 新增：提醒框國際化
      notification: {
        firstTime: {
          title: 'Welcome to the Ladder!',
          combatPower: 'Your Combat Power',
          rank: 'Your Rank',
          rankValue: 'Rank {{rank}}',
          message: 'Begin your ladder journey!',
          button: 'Start Challenge',
        },
        improved: {
          title: 'Combat Power Improved!',
          combatPower: 'Combat Power',
          rank: 'Rank',
          rankValue: 'Rank {{rank}}',
          notRanked: 'Not Ranked',
          rankImproved: 'Improved {{improved}} ranks',
          button: 'View Rankings',
        },
        declined: {
          title: 'Rank Updated',
          combatPower: 'Combat Power',
          rank: 'Rank',
          rankValue: 'Rank {{rank}}',
          notRanked: 'Not Ranked',
          rankDeclined: 'Down {{declined}} ranks',
          message:
            "Don't give up! Keep training hard, you'll definitely improve next time! 💪",
          button: 'Keep Training',
        },
        update: {
          title: 'Combat Power Updated',
          combatPower: 'Combat Power',
          rank: 'Rank',
          rankValue: 'Rank {{rank}}',
          notRanked: 'Not Ranked',
          rankImproved: 'Improved {{improved}} ranks',
          button: 'View Rankings',
        },
      },
      zones: {
        district: 'District Ladder',
        national: 'National Leaderboard',
        all: 'All Regions',
      },
      filter: {
        zone: 'Zone',
        filter: 'Filter',
      },
    },

    // Ladder User Card
    ladderCard: {
      title: 'Character Attributes',
      ageGroup: 'Age Group',
      gender: 'Gender',
      ladderScore: 'Ladder Score',
      location: 'Country/City',
      trainingBackground: 'Training Background',
      profession: 'Profession',
      weeklyTrainingHours: 'Weekly Training Hours',
      trainingYears: 'Training Years',
      hours: 'hours',
      years: 'years',
      noTrainingInfo:
        'This user has not filled in training background information',
      trainingInfoHint:
        'Fill in your training background on the profile page to inspire other fitness enthusiasts!',
      reportNickname: 'Report Nickname',
      reportAvatar: 'Report Avatar',
      reportBoth: 'Report Both',
      report: 'Report',
    },

    // Report System
    report: {
      title: 'Report User',
      reporting: 'You are reporting',
      reportType: {
        label: 'Report Type',
        nickname: 'Nickname',
        avatar: 'Avatar',
        both: 'Nickname and Avatar',
      },
      reason: 'Reason',
      reasons: {
        inappropriate: 'Inappropriate Content',
        offensive: 'Offensive Content',
        spam: 'Spam',
        other: 'Other',
      },
      description: 'Description (Optional)',
      descriptionPlaceholder: 'Please describe the situation...',
      submit: 'Submit Report',
      submitting: 'Submitting...',
      cancel: 'Cancel',
      selectReason: 'Please select a reason',
      success: 'Report submitted, we will review it soon',
      successHidden:
        "Report submitted, the user's content has been automatically hidden",
      error: 'Report failed, please try again later',
      alreadyReported:
        'You have already reported this user, please wait for review',
      cannotReportSelf: 'Cannot report yourself',
      needLogin: 'Please login first',
    },

    // Content Moderation Notice
    moderationNotice: {
      title: 'Community Guidelines',
      description:
        'To keep our community safe and welcoming, please make sure your nickname and avatar follow these guidelines:',
      ensure: 'Your content should:',
      avoid: {
        inappropriate:
          'Be free of inappropriate, offensive, or sensitive content',
        sensitive: 'Avoid political, religious, or other sensitive topics',
        uncomfortable: 'Not make other users feel uncomfortable',
      },
      warning:
        'Content that violates these guidelines will be removed automatically if reported and confirmed.',
    },

    // Honor Verification
    verification: {
      title: 'Honorary Verification',
      description:
        'Get officially verified to showcase your training achievements',
      info: {
        whatIs: {
          title: 'What is Verification?',
          content:
            'Verification is our official recognition of your training achievements. Once verified, a badge will appear next to your ladder score, showing others that your achievements have been officially verified.',
        },
        benefits: {
          title: 'Purpose of Verification',
          item1: 'Verified badge next to your ladder score 🏅',
          item2: 'Honorary Verified mark on your ladder profile',
          item3:
            'Take pride in every training session and showcase your achievements',
          item4:
            'Share your progress and inspire fellow fitness enthusiasts to push forward',
        },
      },
      badge: {
        label: 'Honorary Verified',
      },
      benefits: {
        title: 'Why Get Verified?',
        badge: 'Verified badge next to your ladder score 🏅',
        card: 'Verified mark on your ladder profile',
        credibility: 'Build credibility for your training results',
        trust: 'Show others your score is legitimate',
      },
      process: {
        title: 'Application Process',
        step1: 'Complete all assessments and submit your ladder score',
        step1Details: {
          item1:
            'Complete 5 assessments (Strength, Power, Cardio, Muscle Mass, Body Fat)',
          item2: 'Submit ladder score (automatically verified by system)',
        },
        step2: 'Prepare training videos',
        step2Details: {
          title: '📹 Video Requirements:',
          strength: {
            title: 'Strength Exercises (All 5 required):',
            exercises: {
              benchPress: {
                name: 'Bench Press',
                requirements: [
                  'Lower bar until elbows reach 90 degrees (close to chest)',
                  'Press up until arms are nearly extended (slight bend is acceptable)',
                  'Feet flat on ground, back on bench',
                  'Must clearly show weight plates on both sides (kg)',
                  'At least 1 complete repetition',
                ],
              },
              squat: {
                name: 'Squat',
                requirements: [
                  'Squat until thighs are parallel to ground (depth requirement)',
                  'Back straight, core stable',
                  'Must clearly show weight plates on both sides (kg)',
                  'At least 1 complete repetition',
                ],
              },
              deadlift: {
                name: 'Deadlift',
                requirements: [
                  'Starting position: bar close to shins, back straight',
                  'Complete lockout with full hip extension',
                  'Bar must stay close to body during lift',
                  'Must clearly show weight plates on both sides (kg)',
                  'At least 1 complete repetition',
                ],
              },
              latPulldown: {
                name: 'Lat Pulldown',
                requirements: [
                  'Pull down until elbows are slightly less than 90 degrees',
                  'Controlled return with slight arm bend',
                  'Shoulder blades stable, shoulders locked, minimal body sway or momentum',
                  'Must clearly show weight setting (kg)',
                  'At least 1 complete repetition',
                ],
              },
              shoulderPress: {
                name: 'Overhead Press',
                requirements: [
                  'Press from shoulder position to full lockout',
                  'Core stable, avoid excessive backward lean',
                  'Feet shoulder-width apart, balanced',
                  'Must clearly show barbell or dumbbell weight (kg)',
                  'At least 1 complete repetition',
                ],
              },
            },
            generalNote:
              '💡 Must clearly show yourself performing the exercise and display the weight',
          },
          power: {
            title: 'Explosive Power Tests:',
            items: 'Vertical Jump, Standing Long Jump, 100m Sprint',
            requirement: 'Must show measurement process',
          },
          cardio: {
            title: 'Cardiovascular Endurance:',
            items: '12-minute running test',
            requirement:
              'Must show time/distance record (e.g., screenshot from apps like adidas running)',
          },
          bodyComposition: {
            title: 'Body Composition (Weight, Body Fat %, Muscle Mass):',
            requirement:
              'Recommended to use reputable brand equipment (e.g., InBody, Omron)',
            note: 'Must show measurement device and results',
          },
        },
        step3:
          'Share videos via "Ultimate Physique" Facebook Group or Instagram',
        step3Note:
          'You can post directly in the group or message administrators',
        step3FacebookGroup: {
          title: '📘 Join "Ultimate Physique" Facebook Group',
          description:
            'Join our Facebook group to connect with other trainers and share your training results!',
          link: 'https://www.facebook.com/groups/728224799622936', // ✅ Updated
          linkText: 'Go to Facebook Group',
          comingSoon: 'Group coming soon, stay tuned!', // Use this message if group is not yet created
        },
        step4: 'Fill out application form (social account, video links)',
        step5: 'Wait for administrator review (typically 1-3 business days)',
        step6: 'Once approved, your score will display a verification badge',
      },
      form: {
        title: 'Apply for Verification',
        socialPlatform: 'Social Platform',
        socialPlatformLabel: 'Social Platform',
        socialAccount: 'Social Account',
        socialAccountLabel: 'Social Account',
        videoLink: 'Training Video Link (Optional)',
        description: 'Additional Notes (Optional)',
        descriptionLabel: 'Additional Notes (Optional)',
        submit: 'Submit Application',
        submitButton: 'Submit Application',
        submitting: 'Submitting...',
        submittingButton: 'Submitting...',
        placeholder: {
          socialAccount: 'Your Facebook or Instagram handle',
          videoLink: 'https://... (Optional)',
          description:
            'Tell us about your training or special circumstances. For re-verification, specify which items changed (e.g., "Cardio improved, updating cardio only")',
        },
        hint: {
          videoLink:
            'Please provide the link to your training video on social platforms, or send directly to administrators (Optional)',
        },
      },
      history: {
        title: 'Application History',
        hint: 'If your application was rejected, please wait 7 days before applying again.',
      },
      errors: {
        loadFailed:
          'Failed to load verification status. Please try again later.',
        socialAccountRequired: 'Please enter your social account',
        invalidVideoLink:
          'Please enter a valid video link (must start with http:// or https://)',
        submitFailed: 'Application failed. Please try again later.',
        submitSuccess: 'Application submitted! Application Number: {{number}}',
        needLogin: 'Please login first',
        userNotFound: 'User data not found',
        alreadyVerified: "You're already verified!",
        noLadderScore: 'Please submit your ladder score first',
        alreadyApplied: 'You already have an application pending review',
        checkFailed: 'Unable to verify eligibility. Please try again later.',
      },
      status: {
        verified: "You're verified! 🎉",
        pending: 'Your application is under review. Please be patient.',
        pendingDescription:
          'Administrators will complete the review within 1-3 business days. Thank you for your patience!',
        approved: 'Your application has been approved',
        rejected: 'Your application was not approved',
        notApplied: 'Apply for verification now!',
        notAppliedDescription:
          'Submit your training videos to earn an official verification badge and inspire others with your dedication!',
        loading: 'Loading...',
      },
      statusDetails: {
        applicationNumber: 'Application Number:',
        applicationTime: 'Application Time:',
        rejectionReason: 'Rejection Reason:',
        verifiedScore: 'Verified Score:',
        verifiedTime: 'Verified Time:',
        noReasonProvided: 'Reason not provided',
      },
      messages: {
        success: "Application submitted! We'll review it soon.",
        error: 'Something went wrong. Please try again.',
        alreadyApplied: 'You already have an application pending review',
        alreadyVerified: "You're already verified!",
        noLadderScore: 'Please submit your ladder score first',
        cooldown:
          'Your last application was rejected. Please wait {{days}} days before applying again.',
      },
    },

    // Admin System
    admin: {
      title: 'Admin Panel',
      tabs: {
        verification: 'Verification Review',
        reports: 'Report Review',
        actions: 'Action Log',
      },
      verification: {
        title: 'Pending Verification Requests',
        empty: 'No pending verification requests',
        applicationNumber: 'Application Number',
        socialPlatform: 'Social Platform',
        socialAccount: 'Social Account',
        videoLink: 'Video Link',
        description: 'Notes',
        approve: 'Approve',
        reject: 'Reject',
        refresh: 'Refresh',
      },
      reports: {
        title: 'Pending Reports',
        empty: 'No pending reports',
        reportedUser: 'Reported User',
        reportTime: 'Report Time',
        reportType: 'Report Type',
        reason: 'Reason',
        description: 'Description',
        reporter: 'Reporter',
        approve: 'Approve',
        reject: 'Reject',
        refresh: 'Refresh',
        types: {
          nickname: 'Nickname',
          avatar: 'Avatar',
          both: 'Both',
        },
      },
      actions: {
        title: 'Admin Action Log',
        empty: 'No action records',
        refresh: 'Refresh',
        targetUser: 'Target User',
        details: 'Details',
        actionTypes: {
          approve_verification: 'Approve Verification',
          reject_verification: 'Reject Verification',
          approve_report: 'Approve Report',
          reject_report: 'Reject Report',
          delete_content: 'Delete Content',
        },
      },
      modal: {
        approve: 'Approve Review',
        reject: 'Reject Review',
        notes: 'Notes (Optional)',
        notesPlaceholder: 'Enter review notes...',
        cancel: 'Cancel',
        confirm: 'Confirm',
      },
      loading: 'Loading...',
    },

    // 訪客模式
    guestMode: {
      title: 'Welcome to Ultimate Physique',
      subtitle: 'Register for full features or try as guest',
      startGuest: 'Try as Guest',
      register: 'Register',
      or: 'or',
      banner: 'Guest Mode - Data stored locally only',
      syncData: 'Register to Sync',
      exit: 'Exit',
      modal: {
        title: 'Register an account to use this feature',
        message:
          'Friends and Leaderboard features require registration. Sign up now to unlock the full social experience!',
        registerButton: 'Sign Up / Login',
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
          'Professional team composed of exercise science experts, TCM doctors, and national team athletes',
        founder: {
          name: 'Anndrew Lin',
          title: 'Founder & Chief Training Advisor',
          bio1: 'Inspired by Arnold Schwarzenegger and Bruce Lee since childhood, I began self-training at age 10. However, without scientific guidance, I struggled to find effective ways to get stronger.',
          bio2: 'During college, despite being 180cm tall, I weighed only 55kg with severely low BMI. This experience gave me profound insight into the challenges of training without scientific methods.',
          bio3: 'I then trained under the US Northwest Regional MMA Champion, receiving professional strength and conditioning training. Over 2.5 years, I gained 28kg (reaching 83kg) while maintaining body fat below 12%. This experience not only transformed my body but also set me on the path of exercise science and coaching.',
          experienceTitle: 'Professional Experience',
          experience: [
            'Certified Fitness Coach',
            'Muay Thai National Team Conditioning Coach',
            'Basketball National Team Strength & Conditioning Coach',
            'College Karate Championship S&C Coach',
            'Personal Trainer for Multiple Celebrities',
            '2011-2025: 14 years of coaching experience, trained over 500 students with 25,000+ training hours',
          ],
          missionTitle: 'Development Vision',
          mission:
            'Combining my business management background with exercise science expertise, I developed the "Ultimate Physique" assessment system. Through data-driven, scientific evaluation, everyone can:',
          goals: [
            'Clearly understand their fitness level',
            'Set specific and achievable training goals',
            'Track progress through data',
            'Compete positively with fitness enthusiasts worldwide',
            'Make fitness training fun like leveling up in a game',
          ],
          scoreTitle: 'Personal Best Score',
          score: '92.72 Points',
          closing: "Let the data speak, let's get stronger together! 💪",
        },
        advisor: {
          name: 'Dr. Yang Ching-Hsien',
          title: 'TCM Doctor / Mind-Body-Spirit Integration Therapy Expert',
          subtitle: 'Founder of Holistic Mind-Body-Spirit Integration Therapy',
          bio1: 'Senior TCM Doctor with over 38 years of clinical experience, specializing in mind-body-spirit integration therapy. Combining traditional Chinese medicine, modern psychology, and NLP techniques to create the revolutionary MNLP therapy.',
          bio2: 'With extensive clinical experience from sports injuries to chronic pain, from physical treatment to psychological rehabilitation, providing comprehensive health solutions.',
          bio3: 'Committed to promoting correct treatment concepts, enabling everyone to learn methods to prevent physical deterioration and reduce unnecessary medical resource waste.',
          educationTitle: 'Education Background',
          education: [
            'Ph.D. in Traditional Chinese Medicine, Guangzhou University of Chinese Medicine',
            'Master of Environmental Management, Chaoyang University of Technology',
            'Licensed TCM Practitioner (1996)',
            'Advanced NLP Practitioner, US NLP University',
            'Chinese Psychological Counselor',
          ],
          experienceTitle: 'Professional Experience',
          experience: [
            '4th Generation Successor of Shaolin Temple Foguang Hall, Taiwan',
            'Successor of Ming Dynasty Royal Therapy',
            'Visiting Professor, Kang Ning University',
            'National Level Sports Referee and Coach',
            '1988: Jiujiu Divine Power Qigong Coach',
            '1989: Police Academy Sports Injury Massage Therapist',
          ],
          achievementsTitle: 'Key Achievements',
          achievements: [
            '2011: Founded Holistic Mind-Body-Spirit Integration Therapy',
            '2015: Invented Non-surgical Treatment for Degenerative Arthritis',
            '2017: Discovered Electronic Product Epilepsy Syndrome',
            '2018: Invented Treatment for Electronic Product Epilepsy Syndrome',
            '2018: Invented Chiropractic Robot Therapy Machine',
            '2019: Invented 4th Generation NLP Therapy "MNLP Therapy"',
          ],
          specializationsTitle: 'Specializations',
          specializations: [
            'Holistic Mind-Body-Spirit Integration Therapy',
            'Pain Treatment and Prevention',
            'Sports Injury Rehabilitation',
            'Non-surgical Treatment for Degenerative Arthritis',
            'Electronic Product Epilepsy Syndrome Treatment',
          ],
          publicationsTitle: 'Publications',
          publications:
            'The Amazing Cupping Therapy - Precise and Effective Pain Relief',
          therapy: {
            title:
              'MNLP Therapy (Disease-Barrier Liberation and Return to Truth)',
            description:
              'A method that removes diseases from the body and releases psychological barriers from the heart, allowing the mind and body to return to peace and the spirit to return to its original nature.',
            principles: [
              'Trinity integration therapy of mind, body, and spirit',
              'Changing mind-body states through repair methods',
              'Balanced and healthy state is the best way to cure diseases',
              'Precise and rapid identification of pain causes',
            ],
          },
          closing:
            'Using 38 years of clinical experience to help everyone find the most suitable health solutions! 🌿',
        },
        advisor2: {
          name: 'Fin Chou',
          title:
            'National Team Athlete / Fitness Consultant / Natural Bodybuilding',
          subtitle: 'Chinese Taipei National Bodybuilding Team',
          bio1: 'Born in 1977, natural bodybuilding expert with extensive competitive experience. As a member of the Chinese Taipei National Bodybuilding Team, has achieved outstanding results in major competitions, demonstrating the power of natural bodybuilding.',
          bio2: 'Representing Taipei City Bodybuilding Team and Poxing Team, has excelled in domestic and international bodybuilding competitions, accumulating 12 medals including 8 gold, 2 silver, and 2 bronze medals.',
          bio3: 'Specializes in natural bodybuilding training without pharmaceutical assistance, achieving competitive standards through scientific training and nutrition management, setting a healthy training example for fitness enthusiasts.',
          teamExperienceTitle: 'Team Experience',
          teamExperience: [
            'Chinese Taipei National Bodybuilding Team',
            'Taipei City Bodybuilding Team',
            'Posing Team (Private Training Group)',
          ],
          competitionResultsTitle: 'Competition Results',
          competitionResults: [
            '2025 - IFBB Mr. Universe, International Fitness Model, 6th Place',
            '2024 - National Bodybuilding Championships, Gold (2 Categories) 🥇🥇, Overall Champion 🥇',
            '2024 - National Sports Games, 6th Place',
            '2023 - Chung Cheng Cup Bodybuilding Championships, Gold Medal 🥇',
            '2022 - National Sports Games, Silver Medal (Second Category) 🥈; Presidential Cup, Gold Medal (Masters Physique) 🥇',
            "2022 - Asia Pride Games, Men's Physique Pairs, Gold Medal 🥇",
            '2021 - Fitness Model Championships, Gold (2 Categories) 🥇🥇, Overall Bronze Medal 🥉',
            "2020 - WNBF Men's Physique, Silver Medal (Category) 🥈",
            '2019 - National Cup, Open Physique Gold Medal 🥇; Rookie Physique Bronze Medal 🥉',
          ],
          achievementsTitle: 'Key Achievements',
          achievements: [
            'Accumulated 12 medals',
            '8 gold, 2 silver, 2 bronze medals',
            '2024 National Bodybuilding Championships double gold and overall champion',
            '2022 Presidential Cup gold',
            '2021 Fitness Model Championships double gold and bronze',
            '2020 WNBF silver',
          ],
          specializationsTitle: 'Specializations',
          specializations: [
            'Natural Bodybuilding Training',
            'Competition Coaching',
            'Physical Training Planning',
            'Competition Strategy Development',
            'Nutrition Management',
            'Natural Muscle Building Techniques',
          ],
          closing:
            'Using competition experience to help everyone achieve their best physical condition! 💪',
        },
      },
      techStack: {
        title: 'Technology Stack',
        subtitle:
          'Built with industry-leading technologies to create a high-performance, secure, and reliable fitness assessment platform',
        frontend: {
          title: 'Frontend Technologies',
          desc: 'Utilizing modern React ecosystem for smooth user experience. Powered by Vite build tool for lightning-fast development and optimized production builds. PWA support enables app-like experience across all devices.',
        },
        backend: {
          title: 'Backend Services',
          desc: 'Built on Google Firebase cloud platform for enterprise-grade security and reliability. Firestore provides real-time database capabilities with instant data synchronization. Firebase Authentication offers multiple sign-in methods while ensuring data security.',
        },
        data: {
          title: 'Data Analytics',
          desc: 'Proprietary algorithm engine integrating exercise science data with statistical models for precise scoring. Advanced data visualization transforms complex fitness metrics into intuitive radar charts and graphs for easy understanding.',
          features: [
            'Algorithm Engine',
            'Data Visualization',
            'Statistical Analysis',
            'Scientific Computing',
            'Smart Recommendation',
          ],
        },
        devops: {
          title: 'DevOps',
          desc: 'Git version control ensures code quality and collaboration efficiency. CI/CD automation enables rapid iteration and feature deployment. Google Analytics integration provides performance monitoring and user behavior insights for continuous optimization.',
        },
        highlights: {
          performance: {
            title: 'High Performance',
            desc: 'React Virtual DOM and Vite optimization deliver millisecond-level response times. Firebase CDN ensures optimal access speed worldwide.',
          },
          security: {
            title: 'Security',
            desc: 'Enterprise-grade Firebase security with HTTPS encrypted data transmission. Strict permission management and access control protect user privacy.',
          },
          responsive: {
            title: 'Responsive Design',
            desc: 'Perfect support for desktop, tablet, and mobile devices. Adaptive layouts and touch optimization provide optimal experience on any screen size.',
          },
          international: {
            title: 'Internationalization',
            desc: 'Built-in multilingual support system, currently supporting Traditional Chinese and English. Modular language architecture allows easy expansion to more language markets.',
          },
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
          desc: 'topaj01@gmail.com',
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

    // Training Tools page
    tools: {
      title: 'Training Tools',
      subtitle:
        'Practical training assistant tools to make your training more efficient',
      comingSoon: 'Tools page coming soon',
      comingSoonDesc: 'We are developing practical training tools, stay tuned!',
      status: {
        comingSoon: 'Coming Soon',
        available: 'Available',
      },
      category: {
        weight: 'Weight Training',
        cardio: 'Cardio',
      },
      // Weight training tools
      oneRM: {
        title: '1RM Calculator',
        desc: 'Calculate your maximum strength based on training weight and reps',
      },
      restTimer: {
        title: 'Rest Timer',
        desc: 'Precisely control rest time between sets to improve training efficiency',
      },
      volumeCalculator: {
        title: 'Volume Calculator',
        desc: 'Record exercises, weight, and sets, automatically calculate total training volume',
      },
      exerciseLibrary: {
        title: 'Exercise Library',
        desc: 'Complete exercise database with S~D grade classification system',
      },
      // Cardio tools
      paceCalculator: {
        title: 'Pace Calculator',
        desc: 'Calculate precise pace based on distance and time',
      },
      hrZone: {
        title: 'Heart Rate Zone Calculator',
        desc: 'Calculate personalized heart rate training zones for scientific training',
      },
      action: {
        start: 'Start Timer',
      },
    },

    // Welcome page tooltips
    welcomeTooltips: {
      login: 'Save data to the cloud. Access anywhere',
      guest: 'No registration required. Start right away',
    },

    // Community (feed)
    community: {
      brandTitle: 'Training Camp',
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

    // Skill Tree Page
    skillTree: {
      title: 'Skill Tree',
      description: 'Analyze physical attributes. Awaken your potential.',
      startTests: 'Start Assessment',
    },

    // Profile Cards
    profile: {
      rank: 'Rank',
      cp: 'Combat Power',
      class: 'Class',
      awakened: 'Awakened',
      baseStats: 'Base Stats',
      skills: 'Skills',
    },

    // Forms
    form: {
      selectDistrict: 'Select District',
    },
  },
};