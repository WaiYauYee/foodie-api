// /types/types.ts

// export interface Nutrients {
//   calories: number;
//   protein_g: number;
//   carbs_g: number;
//   fat_g: number;
//   fiber_g: number;
// }

// export interface Ingredient {
//   name: string;
//   calories: number;
// }

// export interface WeightEntry {
//   id: string;
//   weight: number;
//   timestamp: number;
// }

// export interface Food {
//   id: string;
//   name: string;
//   timestamp: number;
//   brand: string;
//   nutrients: Nutrients;
//   group: string;
//   category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
//   foodCategory: string;
//   servingSize: number;
//   ingredients?: Ingredient[];  // Food contains Ingredients
//   photoUrl?: string;
// }

// export interface UserProfile {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   gender: 'male' | 'female';
//   birthDate?: string;
//   startWeight: number;
//   weight: number;
//   goalWeight: number;
//   height: number;
//   goal: 'lose' | 'maintain' | 'gain';
//   targetCalories: number;
//   targetProtein: number;
//   targetCarbs: number;
//   targetFat: number;
//   targetFiber: number;
//   goalOrigin?: 'Standard' | 'Custom';
//   dietaryGoal?: string;
//   macroGoalOrigin?: 'Standard' | 'Custom';
//   activityLevel?: string;

//   triedOtherApps: boolean;
//   dietType: string;
//   primaryGoal: string;
// }

export interface FoodNutrient {
  foodId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  updatedAt: number; // timestamp
  calDataSource?: string;
}

export interface Food {
  id: string;
  name: string;
  group: string;
  servingSize: number;
  servingUnit: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  nutrients: FoodNutrient;
  ingredients?: Food[];
}

export interface FoodComponent {
  component_id: string;        
  parent_food_id: string;    
  ingredient_food_id: string; 
  serving_size: number;
  serving_unit: string;
  created_at: string;          
  updated_at: string;          
}

export interface WeightEntry {
  id: string;
  userId: string;
  weight: number;
  recordedAt: number; // timestamp
  createdAt: number;
}

export interface BmiHistory {
  id: string;
  userId: string;
  bmi: number;
  recordedAt: number; // timestamp
}

export interface DailyNutritionSummary {
  id: string;
  userId: string;
  summaryDate: string; // YYYY-MM-DD
  totalCalories: number;
  totalProtein_g: number;
  totalCarbs_g: number;
  totalFat_g: number;
  totalFiber_g: number;
  mealCount: number;
  updatedAt: number;
}

export interface GoalHistory {
  id: string;
  userId: string;
  oldGoalWeight: number;
  newGoalWeight: number;
  oldTargetCalories?: number;
  newTargetCalories?: number;
  changedAt: number;
}

type Origin = 'standard' | 'custom';
type Gender = 'male' | 'female';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type Status = 'pending' | 'completed' | 'failed';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  gender: Gender;
  birthDate: string;
  heightCm: number;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  startWeight: number;
  currentWeight: number;
  goalWeight: number;
  activityLevel: ActivityLevel;
  dietaryGoal: string;
  goalOrigin?: Origin;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
  macroGoalOrigin: Origin;
  onboardingComplete: boolean;
  triedOtherApps: boolean;
  primaryGoal: PrimaryGoal;
  dietType: string;
}

export interface MealEntry {
  id: string;
  userId: string;
  foodId: string;
  food: Food;
  mealType: MealType;
  consumedAt: number; // timestamp
  estimatedCalories?: number;
  actualProtein_g?: number;
  actualCarbs_g?: number;
  actualFat_g?: number;
  actualFiber_g?: number;
  photoUrl?: string;
  photoAnalysisStatus?: number; // 0 = pending, 1 = analyzed
  createdAt: number;
  ingredients: Food[];
}

export interface FoodPhotoAnalysis {
  id: string;
  mealId: string;
  photoPath: string;
  detectedFood?: Record<string, any>; // JSON from analysis
  confidenceScore?: number;
  analysisResult?: Record<string, any>; // JSON result
  analyzedAt?: number;
  status?: Status;
  createdAt: number;
}

// export interface Challenge {
//   id: string;
//   title: string;
//   description: string;
//   reward: number;
//   progress: number;
//   target: number;
//   completed: boolean;
//   type: 'consistent' | 'mindful' | 'balance';
// }

// export interface OutfitItem {
//   id: string;
//   name: string;
//   price: number;
//   category: 'hat' | 'eyes' | 'accessory';
//   svgElement: React.ReactNode;
//   owned: boolean;
// }

// ============================================
// ADDITIONAL TYPES SPECIFIC TO AUTH
// ============================================

export interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  token?: string;
  user?: User;
}

export interface LoginResponse extends AuthResponse {
  user?: User;
  token?: string;
  onboardingRequired?: boolean;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  heightCm?: number;
}

export interface UpdateProfileGoalsData {
  startWeightKg?: number;
  goalWeightKg?: number;
  activityLevel?: string;
  dietaryGoal?: string;
  targetCalories?: number;
  targetProteinG?: number;
  targetCarbsG?: number;
  targetFatG?: number;
  targetFiberG?: number;
}

type ActivityLevel = 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extra Active';
type dietaryGoal = 'Maintain Weight' | 'Gradual Gain Weight' | 'Rapid Gain Weight' | 'Gradual Lose Weight' | 'Rapid Lose Weight';
export type PrimaryGoal = 'healthier' | 'energy' | 'consistency' | 'body';
type dietType = 'Classic' | 'Pescatarian' | 'Vegetarian' | 'Vegan';

export interface OnboardingData {
  birthDate: string;
  gender: 'male' | 'female';
  heightCm: number;
  startWeight: number;
  goalWeight: number;
  dietaryGoal: dietaryGoal;
  activityLevel: ActivityLevel;
  triedOtherApps: boolean;
  dietType: dietType;
  primaryGoal: PrimaryGoal;
}

export enum Page {
  LOGIN = 'login',
  SIGNUP = 'signup',
  DASHBOARD = 'dashboard',
  DIARY = 'diary',
  PROFILE = 'profile',
  PERSONAL_INFO = 'personal_info',
  CHANGE_PASSWORD = 'change_password',
  GOAL = 'goal',
  PRIVACY_POLICY = 'privacy_policy',
  ADD_WEIGHT = 'add_weight',
  ACCOUNT_SETTING = 'account_setting',
  PAL = 'PAL'
}
