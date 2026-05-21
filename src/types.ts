export interface MealRecord {
  id: string;
  timestamp: number;
  imageUrl?: string;
  description: string;
  detectedFood: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  tips: string[];
  isOfflineFallback?: boolean;
}

export type Screen = 'welcome' | 'home' | 'results' | 'history' | 'reports' | 'profile';
