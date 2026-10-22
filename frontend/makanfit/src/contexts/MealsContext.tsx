import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Food, MealEntry, MealType } from "../types/types";
import { useAuth } from "./AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { calculateStreak } from "../utils/streak";

interface MealsContextValue {
  meals: MealEntry[];
  streakInfo: ReturnType<typeof calculateStreak>;
  addMeal: (food: Food, mealType?: MealType) => void;
  updateMeal: (meal: MealEntry) => void;
  deleteMeal: (id: string) => void;
}

const MealsContext = createContext<MealsContextValue | null>(null);

export const useMeals = () => {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error("useMeals must be used inside <MealsProvider>");
  return ctx;
};

export const MealsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [meals, setMeals] = useLocalStorage<MealEntry[]>("makanfit_meals", []);

  // Don't leak one account's data to the next login.
  useEffect(() => {
    if (!isAuthenticated) setMeals([]);
  }, [isAuthenticated, setMeals]);

  const addMeal = useCallback(
    (food: Food, mealType: MealType = "breakfast") => {
      const now = Date.now();
      const newMeal: MealEntry = {
        id: crypto.randomUUID(),
        userId: user.userId,
        foodId: food.id,
        food,
        mealType,
        consumedAt: now,
        createdAt: now,
        ingredients: [food],
        estimatedCalories: food.nutrients?.calories,
        actualProtein_g: food.nutrients?.protein,
        actualCarbs_g: food.nutrients?.carbs,
        actualFat_g: food.nutrients?.fat,
        actualFiber_g: food.nutrients?.fiber,
      };
      setMeals((prev) => [newMeal, ...prev]);
    },
    [user.userId, setMeals],
  );

  const updateMeal = useCallback(
    (updated: MealEntry) =>
      setMeals((prev) => prev.map((m) => (m.id === updated.id ? updated : m))),
    [setMeals],
  );

  const deleteMeal = useCallback(
    (id: string) => setMeals((prev) => prev.filter((m) => m.id !== id)),
    [setMeals],
  );

  const streakInfo = useMemo(() => calculateStreak(meals), [meals]);

  const value = useMemo(
    () => ({ meals, streakInfo, addMeal, updateMeal, deleteMeal }),
    [meals, streakInfo, addMeal, updateMeal, deleteMeal],
  );

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
};