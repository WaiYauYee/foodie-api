import { OnboardingData } from '../types/types';

export interface CalculatedNutritionPlan {
  age: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
  targetWater: number;
  bmi: number;
  bmiCategory: 'Underweight' | 'Healthy' | 'Overweight' | 'Obese';
  bmiColor: string;
  weeklyRateKg: number;
  estimatedWeeks: number;
  targetDateLabel: string;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

export const calculateNutritionPlan = (data: OnboardingData): CalculatedNutritionPlan => {
  // 1. Calculate Age from birthDate (fallback 26)
  let age = 26;
  if (data.birthDate) {
    const birth = new Date(data.birthDate);
    if (!isNaN(birth.getTime())) {
      const today = new Date();
      age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      age = Math.max(15, Math.min(90, age));
    }
  }

  const weight = Number(data.startWeight) || 60;
  const goalWeight = Number(data.goalWeight) || 55;
  const height = Number(data.heightCm) || 165;
  const isMale = data.gender === 'male';

  // 2. Mifflin-St Jeor BMR
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + (isMale ? 5 : -161));

  // 3. Activity Multiplier (TDEE)
  const activityMultipliers: Record<string, number> = {
    'Sedentary': 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
    'Extra Active': 1.9,
  };
  const multiplier = activityMultipliers[data.activityLevel] || 1.375;
  const tdee = Math.round(bmr * multiplier);

  // 4. Calorie Adjustment based on Dietary Goal
  let calorieDelta = 0;
  let weeklyRateKg = 0;

  switch (data.dietaryGoal) {
    case 'Gradual Lose Weight':
      calorieDelta = -350;
      weeklyRateKg = 0.35;
      break;
    case 'Rapid Lose Weight':
      calorieDelta = -600;
      weeklyRateKg = 0.6;
      break;
    case 'Gradual Gain Weight':
      calorieDelta = 300;
      weeklyRateKg = 0.3;
      break;
    case 'Rapid Gain Weight':
      calorieDelta = 500;
      weeklyRateKg = 0.5;
      break;
    case 'Maintain Weight':
    default:
      calorieDelta = 0;
      weeklyRateKg = 0;
      break;
  }

  const minSafeCalories = isMale ? 1400 : 1200;
  const targetCalories = Math.max(minSafeCalories, Math.round(tdee + calorieDelta));

  // 5. Macronutrient Ratios (Malaysian Suku-Suku Separuh balanced split)
  // Adjust slightly based on dietType
  let carbsRatio = 0.45;
  let proteinRatio = 0.25;
  let fatRatio = 0.30;

  if (data.dietType === 'Vegetarian' || data.dietType === 'Vegan') {
    carbsRatio = 0.50;
    proteinRatio = 0.22;
    fatRatio = 0.28;
  }

  const targetCarbs = Math.round((targetCalories * carbsRatio) / 4);
  const targetProtein = Math.round((targetCalories * proteinRatio) / 4);
  const targetFat = Math.round((targetCalories * fatRatio) / 9);
  const targetFiber = Math.max(22, Math.min(35, Math.round((targetCalories / 1000) * 14)));

  // 6. Hydration Goal (35ml per kg body weight, rounded to nearest 100ml)
  const rawWater = weight * 35;
  const targetWater = Math.max(1800, Math.min(3500, Math.round(rawWater / 100) * 100));

  // 7. BMI Calculation
  const heightM = height / 100;
  const bmi = Number((weight / (heightM * heightM)).toFixed(1));
  let bmiCategory: 'Underweight' | 'Healthy' | 'Overweight' | 'Obese' = 'Healthy';
  let bmiColor = '#10B981';

  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = '#0EA5E9';
  } else if (bmi < 25) {
    bmiCategory = 'Healthy';
    bmiColor = '#10B981';
  } else if (bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = '#F59E0B';
  } else {
    bmiCategory = 'Obese';
    bmiColor = '#EF4444';
  }

  // 8. Estimated Timeline to Goal Weight
  const weightDiff = Math.abs(weight - goalWeight);
  const effectiveWeeklyRate = weeklyRateKg > 0 ? weeklyRateKg : 0.35;
  const estimatedWeeks = weightDiff > 0 ? Math.max(1, Math.round(weightDiff / effectiveWeeklyRate)) : 0;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + estimatedWeeks * 7);
  const targetDateLabel =
    weightDiff === 0
      ? 'Today (Maintain)'
      : targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return {
    age,
    bmr,
    tdee,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    targetFiber,
    targetWater,
    bmi,
    bmiCategory,
    bmiColor,
    weeklyRateKg: effectiveWeeklyRate,
    estimatedWeeks,
    targetDateLabel,
    proteinPct: Math.round(proteinRatio * 100),
    carbsPct: Math.round(carbsRatio * 100),
    fatPct: Math.round(fatRatio * 100),
  };
};
