import { CompleteOnboardingPayload } from "../services/authService";

/** Single place that maps onboarding answers + plan values to the backend payload. */
export const buildOnboardingPayload = (
  src: Record<string, any>,
): CompleteOnboardingPayload => ({
  birthDate: src.birthDate || "",
  gender: src.gender || "female",
  heightCm: src.heightCm ?? 165,
  startWeight: src.startWeight ?? 60,
  goalWeight: src.goalWeight ?? 55,
  dietaryGoal: src.dietaryGoal || "maintain",
  activityLevel: src.activityLevel || "moderately_active",
  triedOtherApps: src.triedOtherApps ?? false,
  dietType: src.dietType || "classic",
  primaryGoal: src.primaryGoal || "healthier",

  targetCalories: src.targetCalories,
  targetProteinG: src.targetProtein,
  targetCarbsG: src.targetCarbs,
  targetFatG: src.targetFat,
  targetFiberG: src.targetFiber,
  targetWaterMl: src.targetWater,

  goalOrigin: src.goalOrigin || "standard",
  macroGoalOrigin: src.macroGoalOrigin || "standard",
});