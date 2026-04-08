// frontend/makanfit/src/services/foodCalorieEstimation.ts

/**
 * Macronutrient breakdown for a food ingredient
 */
export interface MacroNutrients {
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  fiber_g: number;
}

/**
 * Individual ingredient detected in the food
 */
export interface DetectedIngredient {
  name: string;
  estimated_proportion: number;
  estimated_weight_g: number;
  estimated_calories_kcal: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  fiber_g: number;
}

/**
 * Total nutrition data for the entire dish
 */
export interface TotalNutrition {
  estimated_calories_kcal: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  fiber_g: number;
}

/**
 * Per-ingredient calorie breakdown from segmentation
 */
export interface PerIngredientCalorie {
  name: string;
  proportion: number;
  weight_g: number;
  estimated_calories_kcal: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  fiber_g: number;
}

/**
 * Calorie range estimate (min/max uncertainty)
 */
export interface CalorieRange {
  min_kcal: number;
  max_kcal: number;
}

/**
 * Full calorie estimation response from segmentation
 */
export interface CalorieEstimationResponse {
  success: boolean;
  segmentation_id?: string;
  per_ingredient?: PerIngredientCalorie[];
  total_nutrition?: TotalNutrition;
  calorie_range_kcal?: CalorieRange;
  error?: string;
}

/**
 * LLM-provided ingredient data with calorie estimates
 */
export interface IngredientData {
  food_name: string;
  description: string;
  estimated_calories_kcal: number;
  macronutrients: MacroNutrients;
  ingredients: DetectedIngredient[];
}

/**
 * Retrieve detailed calorie estimation for a segmented image
 * 
 * This endpoint estimates calories, macronutrients, and ingredient breakdown
 * using the segmentation results from the image analysis
 *
 * Args:
 *   segmentationId: The segmentation_id from the segmentation endpoint
 *
 * Returns:
 *   Full calorie breakdown with per-ingredient and total nutrition
 */
export const getCaloriesBySegmentation = async (
  segmentationId: string
): Promise<CalorieEstimationResponse> => {
  try {
    // Send to Node.js backend endpoint (same host as classification service)
    // Instead of calling Python directly (5000), call Node.js backend (3001)
    // which proxies to Python ML service
    const response = await fetch(
      `http://localhost:3001/api/food/calorie/${segmentationId}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Calorie estimation failed');
    }

    return {
      success: true,
      segmentation_id: data.segmentation_id,
      per_ingredient: data.per_ingredient || [],
      total_nutrition: data.total_nutrition,
      calorie_range_kcal: data.calorie_range_kcal,
    };
  } catch (error: any) {
    console.error('Get calories by segmentation error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error retrieving calorie data',
    };
  }
};