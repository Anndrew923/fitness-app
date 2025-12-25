export default {
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
      totalFive: 'Five Total',
      totalLoginDays: 'Total Login Days',
    },
  },
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
      step3: 'Share videos via "Ultimate Physique" Facebook Group or Instagram',
      step3Note: 'You can post directly in the group or message administrators',
      step3FacebookGroup: {
        title: '📘 Join "Ultimate Physique" Facebook Group',
        description:
          'Join our Facebook group to connect with other trainers and share your training results!',
        link: 'https://www.facebook.com/groups/728224799622936',
        linkText: 'Go to Facebook Group',
        comingSoon: 'Group coming soon, stay tuned!',
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
      loadFailed: 'Failed to load verification status. Please try again later.',
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
};
