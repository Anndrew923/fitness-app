export default {
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
      scoreLevelsTitle: 'Score Levels',
    },
    strength_rpg: {
      levels: {
        novice: 'Novice Adventurer',
        guardian: 'Guardian',
        vanguard: 'Vanguard',
        knight: 'Honor Knight',
        sovereign: 'Strength Sovereign',
      },
      feedback: {
        legend: '🔥 Legend Arrives! You\'ve broken the limits and entered the Demigod realm. Verify now to etch your name in history!',
        apex: '👑 Apex Overlord! Is this the limit of mortals? Your strength is undeniable. A true King.',
        elite: '⚔️ Awe-Inspiring! You have reached elite athlete status. A respected powerhouse.',
        steel: '🛡️ Steel Body! Your results are visible. You have surpassed the majority.',
        growth: '⚡️ Awakening! You hold the key to strength. Keep pushing!',
        potential: '🌱 Potential! A great journey begins now. Every lift is an investment.',
      },
    },
    standards_desc: 'This system uses the internationally recognized DOTS coefficient (Relative Strength) and the McCulloch age correction model. These standards are widely used in international Powerlifting competitions to scientifically eliminate differences in body weight, gender, and age, accurately evaluating your true strength level under the same conditions.',
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
    cardioTabs: {
      cooper: '12-Min Run (Cooper)',
      run5km: '5KM Challenge (Elite)',
    },
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
      run5kmTitle: 'About 5KM Elite Challenge',
      run5kmIntro: 'A limit-testing challenge for advanced runners. Score counts towards Ladder Ranking only.',
      run5kmBenchmark: 'Benchmark: Sub-20 mins achieves 100 points (God Tier).',
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
    gamified: {
      questComplete: 'QUEST COMPLETE',
      view_rank: 'WITNESS GLORY',
      check_stats: 'INSPECT STATS',
      stay: 'REST & RECOVER',
      submit_btn: 'INITIATE SYNC',
      
      '5km_desc': 'Endurance feat immortalized. Your legacy is recorded on the Elite Leaderboard.',
      arm_desc: 'Arm specs synchronized. Your hypertrophy rating has been uploaded to the Titan Registry.',
      strength_desc: 'Raw power input detected. Combat Power is recalculating...',
      default_desc: 'Data synchronization complete. Your potential has increased.',
    },
    muscleMass: 'Muscle',
    muscleTitle: 'Muscle',
    cardioLabels: {
      distanceMeters: 'Running distance (m)',
      score: 'Cardio score',
      timeMin: 'Time (Minutes)',
      timeSec: 'Time (Seconds)',
      run5kmScore: '5KM Elite Score',
    },
    muscleLabels: {
      smmKg: 'Skeletal muscle mass (kg)',
      numbersComparison: 'Numbers comparison',
      finalScore: 'Final score',
      chartScore: 'Score',
      chartName: 'Name',
      sectionTitle: 'Data explanation',
      smmShort: 'SMM',
      smm: 'Muscle Mass (SMM)',
      smPercentShort: 'SM%',
      smPercentScore: 'SM% score',
      armSize: 'Arm Size',
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
    armSize: 'Arm Size',
    armSizeTitle: 'Pure Arm Size',
    armSizeShort: 'PAS Arm Girth',
    armSizeSafetyNote: '💪 Please measure flexed arm size in a pumped state for accurate data',
    armSizeLabels: {
      armSize: 'Arm Size',
      armSizePlaceholder: 'Enter arm size (cm)',
      bodyFat: 'Body Fat',
      measurementHint: 'Pumped state / Flexed measurement',
      levelTitle: 'Level Progress',
    },
    armSize_rpg: {
      levels: {
        potentialNewcomer: 'Potential Newcomer',
        regularTrainee: 'Regular Trainee',
        veteranWarrior: 'Veteran Warrior',
        mythicalPhysique: 'Mythical Physique',
        absoluteSupreme: 'Absolute Supreme',
      },
      feedback: {
        potentialNewcomer: '🌱 Potential! A great journey begins now. Every training session is an investment.',
        regularTrainee: '⚡️ Awakening! You hold the key to strength. Keep pushing!',
        veteranWarrior: '🛡️ Steel Body! Your results are visible. You have surpassed the majority.',
        mythicalPhysique: '👑 Apex Overlord! Is this the limit of mortals? Your arm size is undeniable. A true King.',
        absoluteSupreme: '🔥 Legend Arrives! You\'ve broken the limits and entered the Demigod realm. Verify now to etch your name in history!',
      },
    },
    armSizeErrors: {
      needCalculate: 'Please enter arm size data first!',
      updateFail: 'Failed to save character data. Please try again later',
    },
    verifiedBadge: 'Verified - showing real score',
  },
  skillTree: {
    title: 'Skill Tree',
    description: 'Analyze physical attributes. Awaken your potential.',
    startTests: 'Start Assessment',
  },
  profile: {
    rank: 'Rank',
    cp: 'Combat Power',
    class: 'Class',
    awakened: 'Awakened',
    baseStats: 'Base Stats',
    skills: 'Skills',
  },
};

