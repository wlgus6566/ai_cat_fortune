import { ConcernType, SubConcernType, DetailedConcern } from './types';

export const CONCERN_TYPES_EN: ConcernType[] = ['Romance', 'Career', 'Money', 'Psychology', 'Relationships', 'Lifestyle'];

export const SUB_CONCERNS_EN: SubConcernType = {
  'Romance': ['Crush', 'Early Dating', 'Long-distance Relationship', 'Relationship Stagnation', 'Post-breakup Recovery'],
  'Career': ['Resignation Thoughts', 'Job Change Preparation', 'Workplace Relationships', 'Burnout', 'Salary Negotiation'],
  'Money': ['Salary Management', 'Savings', 'Side Jobs', 'Investment Failures', 'Debt Concerns'],
  'Psychology': ['Anxiety', 'Depression', 'Self-esteem Issues', 'Life Purpose', 'Burnout'],
  'Relationships': ['Family Conflicts', 'Friend Issues', 'Communication Problems', 'Social Gathering Stress', 'Social Media Fatigue'],
  'Lifestyle': ['Work-life Balance', 'Finding Hobbies', 'Future Concerns', 'Independent Living', 'Self-improvement']
};

export const DETAILED_CONCERNS_EN: Record<ConcernType, DetailedConcern> = {
  'Romance': {
    level1: {
      'Starting Phase': {
        level2: {
          'Crush': ['When to Confess', 'Friends to Lovers?', 'Playing Hard to Get', 'How They Feel About Me'],
          'Early Dating': ['Will This Develop into a Real Relationship?', 'Fading Away Concerns', 'Optimal Contact Frequency', 'Timing for Moving Forward']
        }
      },
      'Ongoing Relationship': {
        level2: {
          'Long-distance Relationship': ['Trust Issues', 'Communication Balance', 'Future Uncertainty', 'Meeting Frequency'],
          'Relationship Stagnation': ['Diminishing Conversations', 'Need for New Excitement', 'Feeling Lonely Together', 'Should We Break Up?']
        }
      },
      'After Breakup': {
        level2: {
          'Post-breakup Recovery': ['How to Forget', 'Can Exes Be Friends?', 'Considering Reconciliation', 'Rebuilding Self-esteem']
        }
      }
    }
  },
  'Career': {
    level1: {
      'Current Company': {
        level2: {
          'Resignation Thoughts': ['Job Mismatch', 'Are There Better Options?', 'Difficult Boss', 'Post-resignation Plans'],
          'Burnout': ['Work Overload', 'Loss of Motivation', 'Career Path Uncertainty', 'Dreading Work']
        }
      },
      'Career Development': {
        level2: {
          'Job Change Preparation': ['What Company Suits Me?', 'Timing to Switch', 'Salary Negotiation', 'Career Management'],
          'Workplace Relationships': ['Keeping Distance from Colleagues', 'Issues with Superiors', 'Difficulty Speaking Up in Meetings', 'Teamwork Stress']
        }
      }
    }
  },
  'Money': {
    level1: {
      'Income & Expenses': {
        level2: {
          'Salary Management': ['Saving vs Spending', 'Budget Planning', 'Insufficient Income', 'Money-saving Habits'],
          'Debt Concerns': ['Credit Card Debt', 'Student Loans', 'Should I Pay Parents\' Debt?', 'Should I Take Out a Loan?']
        }
      },
      'Side Hustles & Investments': {
        level2: {
          'Side Jobs': ['Best Side Hustle Options', 'After-work Gigs', 'Monetizing Hobbies', 'Multiple Jobs Reality'],
          'Investment Failures': ['Stock Market Losses', 'Cryptocurrency Crash', 'Real Estate Concerns', 'Is Investing Essential?']
        }
      }
    }
  },
  'Psychology': {
    level1: {
      'Self-understanding': {
        level2: {
          'Anxiety': ['Future Uncertainty', 'Social Comparison Stress', 'Excessive Worrying', 'Financial Anxiety'],
          'Depression': ['Loss of Interest', 'Mood Swings', 'Overcoming Lethargy', 'Do I Have Issues?']
        }
      },
      'Self-improvement': {
        level2: {
          'Self-esteem Issues': ['Why Do I Feel So Small?', 'Fixating on Failures', 'Unaffected by Compliments', 'How to Love Myself'],
          'Life Purpose': ['Am I on the Right Path?', 'Feeling Like I Have No Dreams', 'Anxiety Without Goals', 'Not Knowing What I Want']
        }
      }
    }
  },
  'Relationships': {
    level1: {
      'Family': {
        level2: {
          'Family Conflicts': ['Value Differences with Parents', 'Poor Sibling Relationships', 'Family Gathering Stress', 'Want to Move Out'],
          'Communication Problems': ['Lost Touch with Friends', 'When to Stop Contacting', 'Group Chat Pressure', 'Social Media Blocking Dilemma']
        }
      },
      'Social Life': {
        level2: {
          'Social Gathering Stress': ['Should I Attend Work Dinners?', 'Adapting to New Groups', 'Preferring Solitude', 'Networking Strategies'],
          'Social Media Fatigue': ['Social Media Comparison Stress', 'Worrying About Likes', 'Online vs Reality Gap', 'Should I Quit Social Media?']
        }
      }
    }
  },
  'Lifestyle': {
    level1: {
      'Work-Life Balance': {
        level2: {
          'Work-life Balance': ['Balancing Work and Personal Life', 'Post-work Exhaustion', 'No Time for Self-improvement', 'Bored with Work'],
          'Future Concerns': ['Will My Current Work Help My Future?', 'No Plans for My 30s', 'Should I Get Married?', 'Retirement Planning']
        }
      },
      'Personal Growth': {
        level2: {
          'Finding Hobbies': ['What Do I Enjoy?', 'Can Hobbies Become a Career?', 'Solo Activities', 'Long-term Engaging Activities'],
          'Independent Living': ['Living Alone Expenses', 'Is Living Alone OK?', 'Parents\' Concerns', 'Finding Roommates']
        }
      }
    }
  }
}; 