import { User } from "../types/types";

export const INITIAL_USER: User = {
  userId: "u1",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  passwordHash: "hashed_password_here",
  gender: "male", // 'male' | 'female'
  birthDate: "1990-01-01", // ISO string
  heightCm: 175,
  isActive: true,

  // Profile / fitness info
  startWeight: 65,
  currentWeight: 65,
  goalWeight: 55,
  activityLevel: "sedentary",
  dietaryGoal: "Gradual Lose Weight",
  goalOrigin: "standard",
  targetCalories: 2000,
  targetProtein: 100,
  targetCarbs: 250,
  targetFat: 65,
  targetFiber: 20,
  macroGoalOrigin: "standard",
  onboardingComplete: false,
  triedOtherApps: false,
  primaryGoal: "healthier",
  dietType: "Classic",

  // Timestamps
  createdAt: Date.now(),
  updatedAt: Date.now(),
  targetWater: 1000,
};