export type ConcernType = 'Romance' | 'Career' | 'Money' | 'Psychology' | 'Relationships' | 'Lifestyle';

export type SubConcernType = {
  [key in ConcernType]: string[];
};

export type ChatStep = 
  | 'INITIAL'                // Initial state
  | 'CONCERN_SELECT'         // Concern type selection
  | 'DETAIL_LEVEL_1_SELECT'  // First level detail selection
  | 'DETAIL_LEVEL_2_SELECT'  // Second level detail selection
  | 'DETAIL_LEVEL_3_SELECT'  // Third level detail selection
  | 'DIRECT_INPUT'           // Direct input mode
  | 'FORTUNE_RESULT';        // Result display

export type InputMode = 'SELECTION' | 'DIRECT_INPUT';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  imageUrl?: string; // Talisman image URL
  options?: string[]; // Selection options if available
}

// Data structure for 4-level concerns
export interface DetailedConcernLevel2 {
  [key: string]: string[];
}

export interface DetailedConcernLevel1 {
  [key: string]: {
    level2: DetailedConcernLevel2;
  };
}

export interface DetailedConcern {
  level1: DetailedConcernLevel1;
}

export type DetailedConcerns = Record<ConcernType, DetailedConcern>;

// User profile related types
export type Gender = 'Male' | 'Female';
export type CalendarType = 'Solar' | 'Lunar';
export type BirthTime = 
  | 'Rat Hour (23:00-01:00)' 
  | 'Ox Hour (01:00-03:00)' 
  | 'Tiger Hour (03:00-05:00)' 
  | 'Rabbit Hour (05:00-07:00)' 
  | 'Dragon Hour (07:00-09:00)' 
  | 'Snake Hour (09:00-11:00)' 
  | 'Horse Hour (11:00-13:00)' 
  | 'Goat Hour (13:00-15:00)' 
  | 'Monkey Hour (15:00-17:00)' 
  | 'Rooster Hour (17:00-19:00)' 
  | 'Dog Hour (19:00-21:00)' 
  | 'Pig Hour (21:00-23:00)' 
  | 'Unknown';

export interface UserProfile {
  id: string;
  userId?: string; // Supabase Storage user ID
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD format
  calendarType: CalendarType;
  birthTime: BirthTime;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// App navigation types
export type AppTab = 'home' | 'chat' | 'profile'; 
export interface IErrorResponse {
  success: false
  error: {
      code: string
      message: string
  }
}

export interface IGenerateRequest {
    prompt: string
    styleOptions: {
        artStyle: string
        colorTone: string
    }
}

export interface IGenerateResponse {
    success: true
    imageUrl: string
}

// Saju (Four Pillars) related types
export interface SajuElements {
  // Heavenly Stems
  cheongan: {
    year: string;  // Year Pillar Heavenly Stem
    month: string; // Month Pillar Heavenly Stem
    day: string;   // Day Pillar Heavenly Stem
    time: string;  // Time Pillar Heavenly Stem
  };
  // Earthly Branches
  jiji: {
    year: string;  // Year Pillar Earthly Branch
    month: string; // Month Pillar Earthly Branch
    day: string;   // Day Pillar Earthly Branch
    time: string;  // Time Pillar Earthly Branch
  };
  // Day Pillar display (e.g., Imsul Day)
  ilju: string;
  // Hanja characters for Day Pillar
  iljuHanja: string;
}

// Daily Fortune interface type (must match the type used in lib/openai.ts)
export interface DailyFortune {
  date: string; // Date
  // Saju elements
  saju?: SajuElements;
  overall: {
    score: number; // Score between 1-5
    description: string; // Overall fortune description
  };
  // ... existing properties
}

export interface IGenerateRequest {
    prompt: string
    styleOptions: {
        artStyle: string
        colorTone: string
    }
}

export interface IGenerateResponse {
    success: true
    imageUrl: string
    error?: {
        code: string
        message: string
    }
}

export interface IErrorResponse {
    success: false
    error: {
        code: string
        message: string
    }
} 