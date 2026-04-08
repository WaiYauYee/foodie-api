//frontend/makanfit/src/components/Diary.tsx
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MealType, Food, User, MealEntry } from '../types/types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  Camera, Trash2, X, ChevronLeft, ChevronRight, 
  Calendar as CalendarIcon, Target,
  Utensils, Check, 
  ChevronRight as ChevronRightIcon,
  Loader2, Plus, ClipboardList,
  ChevronDown,
  ArrowLeft,
  Pencil,
  Smile,
  ThumbsUp,
  Flame,
  AlertCircle,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info
} from 'lucide-react';
import Fuse from 'fuse.js';
import MakanFitAvatar from './MakanFitAvatar';
import CameraScanner from './CameraScanner';
import { segmentFoodImage } from '../services/foodSegmentationService';
import { classifyFoodImage } from '../services/foodClassificationService';
import { CalorieEstimationResponse, getCaloriesBySegmentation } from '../services/foodCalorieEstimation';

interface DiaryProps {
  meals: MealEntry[];
  onAddMeal: (meal: Food, mealType: MealType) => void;
  onDeleteMeal: (id: string) => void;
}

// const FOOD_GROUPS = [
//   { id: 'carbs', name: 'Carbs', icon: Rice, color: 'text-sky-400', bg: 'bg-sky-50', target: 7 },
//   { id: 'protein', name: 'Protein', icon: Fish, color: 'text-purple-400', bg: 'bg-purple-50', target: 8 },
//   { id: 'fat', name: 'Fat', icon: Droplets, color: 'text-orange-400', bg: 'bg-orange-50', target: 6 },
//   { id: 'dairy', name: 'Dairy', icon: Cheese, color: 'text-yellow-400', bg: 'bg-yellow-50', target: 1 },
//   { id: 'fruit', name: 'Fruit', icon: Apple, color: 'text-red-400', bg: 'bg-red-50', target: 2 },
//   { id: 'vege', name: 'Vege', icon: Leaf, color: 'text-green-400', bg: 'bg-green-50', target: 3 },
// ];

const SEARCHABLE_FOODS: Food[] = [
  {
    id: 's11',
    name: 'Bak Kut Teh',
    group: 'Protein',
    servingSize: 458,
    servingUnit: 'g',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nutrients: {
      foodId: 's11',
      calories: 348.1,
      protein: 30.2,
      carbs: 0,
      fat: 25.2,
      fiber: 10,
      updatedAt: Date.now(),
      calDataSource: 'estimated'
    }
  },
  {
    id: 's8',
    name: 'Nasi Lemak Ayam Goreng',
    group: 'Carbs',
    servingSize: 170,
    servingUnit: 'g',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nutrients: {
      foodId: 's8',
      calories: 650,
      protein: 25,
      carbs: 70,
      fat: 30,
      fiber: 5,
      updatedAt: Date.now(),
      calDataSource: 'estimated'
    }
  },
  {
    id: 's9',
    name: 'Apple',
    group: 'Fruit',
    servingSize: 100,
    servingUnit: 'g',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nutrients: {
      foodId: 's9',
      calories: 120,
      protein: 0.5,
      carbs: 30,
      fat: 0.3,
      fiber: 4,
      updatedAt: Date.now(),
      calDataSource: 'standard'
    }
  }
];


const SCAN_MESSAGES = [
  "Identifying the food...",
  "Analyzing the ingredients...",
  "Checking the nutrition...",
  "Detecting Malaysian flavors...",
  "Getting the nutrition facts..."
];

// Define sentiment helper
const getSentiment = (calories: number) => {
  if (calories < 200) {
    return { 
      text: "Light", 
      color: "text-green-500", 
      bg: "bg-green-100",
      Icon: Smile
    };
  } else if (calories < 400) {
    return { 
      text: "Moderate", 
      color: "text-blue-500", 
      bg: "bg-blue-100",
      Icon: ThumbsUp
    };
  } else if (calories < 600) {
    return { 
      text: "Substantial", 
      color: "text-orange-500", 
      bg: "bg-orange-100",
      Icon: Flame
    };
  } else {
    return { 
      text: "Heavy", 
      color: "text-red-500", 
      bg: "bg-red-100",
      Icon: AlertCircle
    };
  }
};

const Diary: React.FC<DiaryProps> = ({ meals, onAddMeal, onDeleteMeal }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isShowingNutritionLabel, setIsShowingNutritionLabel] = useState(false);
  const [isEditingIngredients, setIsEditingIngredients] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MealType>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [scanMessageIndex, setScanMessageIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [ingredients, setIngredients] = useState<Food[]>([]);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [searchFromResults, setSearchFromResults] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<'nutrition' | 'customize'>('nutrition');
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Normalize initial date to midnight
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const isFirstMount = useRef(true);
  const [isServingSizeOpen, setIsServingSizeOpen] = useState(false);
  const [servingSizeMode, setServingSizeMode] = useState<'serving' | 'g'>('serving');
  const [servingSizeValue, setServingSizeValue] = useState(1);
  const [gramsValue, setGramsValue] = useState(0);
  const [isDeleteIngredientModalOpen, setIsDeleteIngredientModalOpen] = useState(false);
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState<number | null>(null);
  const [selectedIngredientName, setSelectedIngredientName] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // New states for the ingredient addition overlay
  const [isIngredientDetailOpen, setIsIngredientDetailOpen] = useState(false);
  const [tempIngredient, setTempIngredient] = useState<Food | null>(null);
  const [tempServingValue, setTempServingValue] = useState(1);
  const [tempGramsValue, setTempGramsValue] = useState(100);
  const [tempServingSizeMode, setTempServingSizeMode] = useState<'serving' | 'g'>('serving');
  const [isTempServingSizeOpen, setIsTempServingSizeOpen] = useState(false);
  const [tempBaseGrams, setTempBaseGrams] = useState(100);

  const [calorieData, setCalorieData] = useState<CalorieEstimationResponse | null>(null);
  const [expandedIngredientIdx, setExpandedIngredientIdx] = useState<number | null>(null);

  const nutrition = calorieData?.total_nutrition;

let carbsPerc = 0;
let proteinPerc = 0;
let fatPerc = 0;

if (nutrition) {
  const carbsCal = (nutrition.carbohydrates_g || 0) * 4;
  const proteinCal = (nutrition.protein_g || 0) * 4;
  const fatCal = (nutrition.fat_g || 0) * 9;

  const totalCal = carbsCal + proteinCal + fatCal;

  if (totalCal > 0) {
    carbsPerc = (carbsCal / totalCal) * 100;
    proteinPerc = (proteinCal / totalCal) * 100;
    fatPerc = (fatCal / totalCal) * 100;
  }
}

  const [userProfile, ] = useState<User>({
  userId: 'user-1',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  passwordHash: 'hashed_password_here', // example hash
  gender: 'male',                        // 'male' | 'female'
  birthDate: '1990-01-01',               // ISO date string
  heightCm: 175,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isActive: true,

  // Profile fields
  startWeight: 72.0,            // starting weight in kg
  currentWeight: 70.0,          // current weight
  goalWeight: 65.0,             // target weight
  activityLevel: 'Sedentary',   // ActivityLevel type
  dietaryGoal: 'Gradual Lose Weight',
  goalOrigin: 'standard',       // 'standard' | 'custom'
  targetCalories: 2000,
  targetProtein: 120,
  targetCarbs: 250,
  targetFat: 60,
  targetFiber: 30,
  macroGoalOrigin: 'standard',  // 'standard' | 'custom'
  onboardingComplete: false,
  triedOtherApps: false,
  primaryGoal: 'healthier',  // PrimaryGoal type
  dietType: 'Classic', 
});

  const fuse = new Fuse(SEARCHABLE_FOODS, {
  keys: ['name', 'brand'],
  threshold: 0.3
});

const results = searchQuery 
  ? fuse.search(searchQuery).map(r => r.item)
  : SEARCHABLE_FOODS;

  useEffect(() => {
    let interval: any;
    if (analyzing) {
      interval = setInterval(() => {
        setScanMessageIndex(prev => (prev + 1) % SCAN_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  useEffect(() => {
  if (selectedFood) {
    setGramsValue(selectedFood.servingSize);
  }
}, [selectedFood]);

useEffect(() => {
  if (servingSizeMode === 'serving' && selectedFood) {
    // When serving value changes, update grams
    const calculatedGrams = servingSizeValue * (selectedFood.servingSize || 250);
    setGramsValue(calculatedGrams);
  }
}, [servingSizeValue, servingSizeMode, selectedFood]);

useEffect(() => {
  if (servingSizeMode === 'g' && selectedFood) {
    // When grams change, calculate and update serving value
    const calculatedServing = gramsValue / (selectedFood.servingSize || 250);
    setServingSizeValue(parseFloat(calculatedServing.toFixed(2)));
  }
}, [gramsValue, servingSizeMode, selectedFood]);

// Handle temp ingredient serving conversions
  useEffect(() => {
    if (tempServingSizeMode === 'serving' && tempIngredient) {
      const calculatedGrams = tempServingValue * tempBaseGrams;
      setTempGramsValue(calculatedGrams);
    }
  }, [tempServingValue, tempServingSizeMode, tempIngredient, tempBaseGrams]);

  useEffect(() => {
    if (tempServingSizeMode === 'g' && tempIngredient) {
      const calculatedServing = tempGramsValue / tempBaseGrams;
      setTempServingValue(parseFloat(calculatedServing.toFixed(2)));
    }
  }, [tempGramsValue, tempServingSizeMode, tempIngredient, tempBaseGrams]);


useEffect(() => {
  if (analyzing) {
    setIsImageViewerOpen(false);
  }
}, [analyzing]);

  // Generate a list of days centered around the selected date
  // This ensures that clicking < or > always has content to show
  const days = useMemo(() => {
    return Array.from({ length: 61 }).map((_, i) => {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() - 30 + i);
      return d;
    });
  }, [selectedDate]);

  useEffect(() => {
  // Use requestAnimationFrame - waits for browser to paint before scrolling
  const frameId = requestAnimationFrame(() => {
    if (scrollContainerRef.current) {
      const selectedEl = scrollContainerRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        const behavior = isFirstMount.current ? 'auto' : 'smooth';
        selectedEl.scrollIntoView({ behavior, inline: 'center', block: 'nearest' });
        isFirstMount.current = false;
      }
    }
  });

  return () => cancelAnimationFrame(frameId);
}, [selectedDate]);

  const goToPrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const todaysMeals = meals.filter(m => new Date(m.createdAt).toDateString() === selectedDate.toDateString());

  const totals = useMemo(() => {
  return todaysMeals.reduce(
    (acc, m) => {
      m.ingredients.forEach(ing => {
        const n = ing.nutrients;
        if (!n) return;
        acc.calories += n.calories || 0;
        acc.protein += n.protein || 0;
        acc.carbs += n.carbs || 0;
        acc.fat += n.fat || 0;
        acc.fiber += n.fiber || 0;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}, [todaysMeals]);

  const targetCal = 1279;
  const remainingCal = Math.max(targetCal - totals.calories, 0);

  const currentNutrients = useMemo(() => {
  if (!selectedFood || !selectedFood.nutrients) return null;

  const n = selectedFood.nutrients;

  let factor: number;

  if (servingSizeMode === 'serving') {
    factor = servingSizeValue || 0;
  } else {
    factor = gramsValue / (selectedFood.servingSize || 100);
  }

  return {
    foodId: selectedFood.id,
    calories: Math.round((n.calories || 0) * factor * 10) / 10,
    protein: Math.round((n.protein || 0) * factor * 10) / 10,
    carbs: Math.round((n.carbs || 0) * factor * 10) / 10,
    fat: Math.round((n.fat || 0) * factor * 10) / 10,
    fiber: Math.round((n.fiber || 0) * factor * 10) / 10,
    updatedAt: Date.now(),
  };
}, [selectedFood, servingSizeValue, gramsValue, servingSizeMode]);

  /**
   * FIX: The reason the overlay wasn't appearing was likely due to 
   * synchronous state updates or lack of an 'await' on the analysis.
   * By properly awaiting the AI service, React has time to render 
   * the 'analyzing' state.
   */
  // const handleCapture = async (base64: string) => {
  //   setPreviewUrl(base64);
  //   setIsScanning(false);
    
  //   // Explicitly set analyzing to true before starting the long task
  //   setAnalyzing(true);
    
  //   try {
  //     // Small artificial delay to ensure the UI transition is visible and smooth
  //     await new Promise(r => setTimeout(r, 800));
      
  //     // const result = await analyzeFoodImage(base64);

  //     // console.log('Sending image to backend for segmentation...');
  //     // const segmentationResult = await segmentFoodImage(base64);

  //     // if (!segmentationResult.success) {
  //     //   throw new Error(segmentationResult.error || 'Segmentation failed');
  //     // }

  //     // console.log('Detected ingredients:', segmentationResult.ingredients);
      
  //     // const newFood: Food = {
  //     //   id: Math.random().toString(36).substr(2, 9),
  //     //   name: result.dishName,
  //     //   timestamp: Date.now(),
  //     //   nutrients: result.estimatedNutrients,
  //     //   servingSize: result.estimatedNutrients.calories > 600 ? 500 : 350,
  //     //   brand: 'AI Scanned',
  //     //   category: activeCategory,
  //     //   foodCategory: 'Scanned',
  //     //   ingredients: result.ingredients || [],
  //     //   photoUrl: base64
  //     // };
      
  //     // setSelectedFood(newFood);
  //     // setGramsValue(newFood.servingSize);

  //     const result = {
  //       dishName: "Nasi Lemak Biasa",
  //       estimatedNutrients: {
  //         calories: 520,
  //         protein: 12,
  //         carbs: 65,
  //         fat: 22,
  //         fiber: 25
  //       },
  //       ingredients: [
  //         { name: "Rice", calories: 300 },
  //         { name: "Coconut Milk", calories: 100 },
  //         { name: "Anchovies", calories: 60 },
  //         { name: "Peanuts", calories: 40 },
  //         { name: "Cucumber", calories: 15 },
  //         { name: "Egg", calories: 5 }
  //       ]
  //     };
      
  //     setSelectedFood({
  //       id: 'f123',
  //       name: 'Apple',
  //       group: 'Fruit',
  //       servingSize: 100,
  //       servingUnit: 'g',
  //       createdAt: Date.now(),
  //       updatedAt: Date.now(),
  //       nutrients: {
  //         foodId: 'f123',
  //         calories: 52,
  //         protein: 0.3,
  //         carbs: 14,
  //         fat: 0.2,
  //         fiber: 2.4,
  //         updatedAt: Date.now(),
  //       },
  //     });

  //     // setIngredients(result.ingredients || []);
  //     setGramsValue(result.estimatedNutrients.calories > 600 ? 550 : 450);
  //     setAnalyzing(false);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Error analyzing food. Check your connection or API key.");
  //   } finally {
  //     // Always clear analyzing state
  //     setAnalyzing(false);
  //   }
  // };

  const handleCapture = async (base64: string) => {
  setPreviewUrl(base64);
  setIsScanning(false);
  setAnalyzing(true);
  
  try {
    await new Promise(r => setTimeout(r, 800));
 
    // Classification first (original image)
    console.log('🔄 Sending image to backend for classification...');
    const classificationResult = await classifyFoodImage(base64);
    console.log('🍽️ Classification result:', classificationResult);

    // const topPrediction = classificationResult.primary_prediction;
    // if (!topPrediction || topPrediction.confidence < 0.5) {
    //   console.warn("⚠️ Low confidence or no food detected, likely non-food image.");
    //   setAnalyzing(false);
    //   alert("The uploaded image does not appear to be a food item. Please try again with a food photo.");
    //   return; // Stop further processing
    // }
 
    const dishName = classificationResult.primary_prediction?.food_name || "";
    
    // Segmentation
    console.log('🔄 Sending image to backend for segmentation...');
    const segmentationResult = await segmentFoodImage(base64);
    console.log("Segmentation result:", segmentationResult);
    console.log("Overlay image:", !!segmentationResult.overlayImage);
 
    if (!segmentationResult.success) {
      throw new Error(segmentationResult.error || 'Segmentation failed');
    }

    // 3. Get calorie estimation
    let calorieResult: CalorieEstimationResponse = { 
      success: false, 
      error: 'No segmentation ID' 
    };
    
    if (segmentationResult.segmentation_id) {
      console.log('🔄 Getting calorie estimation...');
      calorieResult = await getCaloriesBySegmentation(segmentationResult.segmentation_id);
      console.log('📊 Calorie result:', calorieResult);
      setCalorieData(calorieResult);
    }
 
    // ✅ CRITICAL FIX: Check overlay and set accordingly
    let displayImage = base64;  // Fallback to original
    
    if (segmentationResult.overlayImage) {
      console.log("✅ Overlay image available, using it");
      displayImage = segmentationResult.overlayImage;
    } else {
      console.warn("⚠️ No overlay image, falling back to original");
    }
    
    // ✅ Set preview URL ONCE with the correct image
    setPreviewUrl(displayImage);

    const detectedIngredients: Food[] = (calorieResult.per_ingredient || []).map((ing) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: ing.name,
      group: 'Ingredient',
      servingSize: ing.weight_g,
      servingUnit: 'g',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      nutrients: {
        foodId: Math.random().toString(36).substr(2, 9),
        calories: ing.estimated_calories_kcal,
        protein: ing.protein_g,
        carbs: ing.carbohydrates_g,
        fat: ing.fat_g,
        fiber: ing.fiber_g,
        updatedAt: Date.now(),
      },
    }));

    const totalCalories = calorieResult.success && calorieResult.total_nutrition
      ? calorieResult.total_nutrition.estimated_calories_kcal
      : 0;

    setSelectedFood({
      id: Math.random().toString(36).substr(2, 9),
      name: dishName,
      group: 'Vege',
      nutrients: {
        foodId: Math.random().toString(36).substr(2, 9),
        calories: totalCalories,
        protein: Math.round(totalCalories * 0.15 / 4),
        carbs: Math.round(totalCalories * 0.55 / 4),
        fat: Math.round(totalCalories * 0.30 / 9),
        fiber: Math.round(totalCalories * 0.05 / 4),
        updatedAt: Date.now(),
      },
      servingSize: totalCalories > 600 ? 550 : 450,
      servingUnit: 'g',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ingredients: detectedIngredients
    });

    setIngredients(detectedIngredients);
    setGramsValue(totalCalories > 600 ? 550 : 450);
    setAnalyzing(false);

  } catch (err: any) {
    console.error('❌ Error:', err);
    setAnalyzing(false);
    alert(`Error analyzing food:\n${err?.message || 'Unknown error'}\n\nMake sure:\n1. Python API running on 5000\n2. Node.js API running on 3001`);
    setIsSearching(true); // Let user search manually
  }
};

  const confirmMeal = () => {
    if (!selectedFood || !currentNutrients) return;
    
    // CRITICAL FIX: Ensure we use the 'ingredients' state and 'gramsValue' instead of stale object properties
    const updatedMeal: Food = {
      id: editingMealId || Math.random().toString(36).substr(2, 9),
      name: selectedFood.name,
      group: selectedFood.group,
      servingSize: gramsValue,
      servingUnit: selectedFood.servingUnit || 'g', // default if undefined
      createdAt: Date.now(),
      updatedAt: Date.now(),
      nutrients: currentNutrients,
    };

    if (editingMealId) onDeleteMeal(editingMealId);
    onAddMeal(updatedMeal, activeCategory);
    resetForm();
  };

  const handleDeleteMealConfirm = () => {
    if (editingMealId) {
      onDeleteMeal(editingMealId);
    }
    setIsDeleteModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setIsScanning(false);
    setIsSearching(false);
    setIsShowingNutritionLabel(false);
    setIsDeleteModalOpen(false);
    setIsAdjusting(false);
    setPreviewUrl(null);
    setAnalyzing(false);
    setSelectedFood(null);
    setIngredients([]);
    setIsEditingIngredients(false);
    setEditingMealId(null);
    setSearchFromResults(false);
    setActiveResultTab('nutrition');
    setIsServingSizeOpen(false);
    setServingSizeMode('serving');
    setServingSizeValue(1);
    setIsImageViewerOpen(false);
    setImageZoom(1);
    setIsIngredientDetailOpen(false);
    setTempIngredient(null);
    setIsTempServingSizeOpen(false);
    // Fix: Clear ingredient deletion state on form reset
    setIsDeleteIngredientModalOpen(false);
    setSelectedIngredientIndex(null);
    setSelectedIngredientName('');
    setCalorieData(null);
  };

  const removeIngredient = (idx: number) => {
    const updated = [...ingredients];
    const removed = updated.splice(idx, 1)[0];
    setIngredients(updated);

    if (selectedFood && selectedFood.nutrients) {
    const n = selectedFood.nutrients;

    setSelectedFood({
      ...selectedFood,
      nutrients: {
        foodId: n.foodId, // keep existing foodId
        calories: Math.max(0, Math.round((n.calories - (removed?.nutrients?.calories || 0)) * 10) / 10),
        protein: n.protein || 0,
        carbs: n.carbs || 0,
        fat: n.fat || 0,
        fiber: n.fiber || 0,
        updatedAt: Date.now(),
        calDataSource: n.calDataSource, // optional
      },
    });
    }
  };

  const updateIngredientWeight = (idx: number, newWeight: number) => {
    if (newWeight < 0) return;
    
    const updatedIngredients = [...ingredients];
    const ing = updatedIngredients[idx];
    const oldCalories = ing.nutrients.calories;
    
    const currentWeight = ing.servingSize || 100;
    const factor = currentWeight > 0 ? newWeight / currentWeight : 0;
    
    const updatedNutrients = {
      ...ing.nutrients,
      calories: Math.round(ing.nutrients.calories * factor * 10) / 10,
      protein: Math.round((ing.nutrients.protein || 0) * factor * 10) / 10,
      carbs: Math.round((ing.nutrients.carbs || 0) * factor * 10) / 10,
      fat: Math.round((ing.nutrients.fat || 0) * factor * 10) / 10,
      fiber: Math.round((ing.nutrients.fiber || 0) * factor * 10) / 10,
    };

    updatedIngredients[idx] = {
      ...ing,
      servingSize: newWeight,
      nutrients: updatedNutrients
    };

    setIngredients(updatedIngredients);

    if (selectedFood) {
      const calorieDiff = updatedNutrients.calories - oldCalories;
      setSelectedFood({
        ...selectedFood,
        nutrients: {
          ...selectedFood.nutrients,
          calories: Math.round((selectedFood.nutrients.calories + calorieDiff) * 10) / 10
        }
      });
    }
  };

  const openEditMeal = (meal: MealEntry) => {
    setActiveCategory(meal.mealType);
    setEditingMealId(meal.id);
    setPreviewUrl(meal.photoUrl || null);

     // Look up the actual food by its ID (or name if needed)
    const foodFromDb = SEARCHABLE_FOODS.find(f => f.id === meal.foodId);

    if (foodFromDb) {
        setSelectedFood(foodFromDb);
      } else {
        console.warn("Food not found for meal:", meal.foodId);
      }

    setIsAdjusting(true);
    setIngredients(meal.ingredients || []);
  };

  const handleConfirmRemoveIngredient = () => {
  if (selectedIngredientIndex !== null) {
    removeIngredient(selectedIngredientIndex);
  }
  setIsDeleteIngredientModalOpen(false);
  setSelectedIngredientIndex(null);
  setSelectedIngredientName('');
};

  const handleAddIngredientFinal = () => {
    if (!tempIngredient || !selectedFood) return;
    
    // Calculate final calories based on serving adjustment
    const adjustedCalories = Math.round(tempIngredient.nutrients.calories * tempServingValue);
    const newIng: Food = {
    id: tempIngredient.id, // required
    name: tempIngredient.name,
    group: tempIngredient.group || "Ingredient", // fallback
    servingSize: tempIngredient.servingSize || tempBaseGrams,
    servingUnit: tempIngredient.servingUnit || "g",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nutrients: {
      ...tempIngredient.nutrients,
      calories: adjustedCalories,
    },
  };
    
    setIngredients([...ingredients, newIng]);
    
    // Update main dish calories immediately to keep UI in sync
    const newDishCalories = Math.round((selectedFood.nutrients.calories + adjustedCalories) * 10) / 10;
    setSelectedFood({
      ...selectedFood,
      nutrients: {
        ...selectedFood.nutrients,
        calories: newDishCalories
      }
    });

    setIsIngredientDetailOpen(false);
    setTempIngredient(null);
    setIsSearching(false);
    setIsEditingIngredients(false);
  };

// Daily goals for the category view (mocked targets per category)
  const categoryTargets = { calories: 548, protein: 41, fat: 18, carbs: 52, fiber: 5 };
  const categoryCurrent = useMemo(() => {
    return todaysMeals
      .filter(m => m.mealType === activeCategory)  // use mealType instead of category
      .reduce(
        (acc, m) => {
          m.ingredients.forEach(ing => {
            const n = ing.nutrients;
            if (!n) return;
            acc.calories += n.calories || 0;
            acc.protein += n.protein || 0;
            acc.fat += n.fat || 0;
            acc.carbs += n.carbs || 0;
            acc.fiber += n.fiber || 0;
          });
          return acc;
        },
        { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
      );
  }, [todaysMeals, activeCategory]);

  const ingredientSummary = useMemo(() => {
    if (!ingredients || ingredients.length === 0) return null;

    const names = ingredients.map(i => i.name).join(', ');
    const totalCalories = ingredients.reduce(
      (sum, i) => sum + (i.nutrients?.calories || 0),
      0
    );

    return { names, totalCalories };
  }, [ingredients]);

  const MacroRing = ({ label, current, target, color }: { label: string, current: number, target: number, color: string }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(current / target, 1);
    const strokeDashoffset = circumference - progress * circumference;

    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-14 h-14">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="28" cy="28" r={radius} stroke="#F3F4F6" strokeWidth="4" fill="transparent" />
            <circle
              cx="28" cy="28" r={radius} stroke={color} strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round" fill="transparent"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
            <span className="text-[11px] font-black text-gray-800 leading-none">{Math.round(current)}</span>
            <span className="text-[9px] text-gray-400 font-bold leading-none">/{target}g</span>
          </div>
        </div>
        <span className="text-[11px] font-bold text-gray-400">{label}</span>
      </div>
    );
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="bg-white px-4 py-4 space-y-4 shadow-sm sticky top-0 z-[60]">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center">
            <Target className="w-6 h-6 text-sky-400" />
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={goToPrevDay}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors active:scale-90"
            >
              <ChevronLeft className="w-6 h-6 text-gray-400" />
            </button>
            <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="flex items-center space-x-2 cursor-pointer active:scale-95 transition-all">
              <CalendarIcon className="w-6 h-6 text-gray-800" />
              <span className="font-black text-gray-900 text-lg tracking-tight">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </button>
            <button 
              onClick={goToNextDay}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors active:scale-90"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </div>
          <div className="w-10" />
        </div>

        {/* Scrollable Mini Calendar */}
        <div 
          ref={scrollContainerRef}
          className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide snap-x"
        >
          {days.map((d, i) => {
              const isSelected = d.toDateString() === selectedDate.toDateString();
              return (
                <button 
                  key={i} 
                  data-selected={isSelected}
                  onClick={() => setSelectedDate(new Date(d))} 
                  className={`flex-shrink-0 w-14 flex flex-col items-center space-y-2 py-3 px-1 rounded-2xl border-2 transition-all snap-center ${
                    isSelected ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-transparent bg-white'
                  }`}
                >
                  <span className={`text-[10px] uppercase font-black tracking-tighter ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-emerald-500 text-white' : 'text-gray-600'
                  }`}>
                      <span className="text-sm font-black">{d.getDate()}</span>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Calendar Modal Overlay */}
        {isCalendarOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[89] backdrop-blur-sm" onClick={() => setIsCalendarOpen(false)} />
            <div className="fixed inset-x-0 bottom-0 bg-white z-[90] rounded-tl-3xl rounded-tr-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest">Select Date</h3>
                <button onClick={() => setIsCalendarOpen(false)} className="p-2 bg-gray-50 rounded-full"><X size={20} /></button>
              </div>
              <div className="flex justify-center pb-8">
                <Calendar 
                  value={selectedDate} 
                  onChange={(date) => {
                    setSelectedDate(date as Date);
                    setIsCalendarOpen(false);
                  }}
                  className="w-full max-w-sm rounded-2xl border-none shadow-none"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-6 space-y-6">
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-start text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-1 text-gray-400">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Goal</span>
              </div>
              <p className="font-black text-gray-900 text-xl">{targetCal} <span className="text-xs text-gray-400 font-normal">kcal</span></p>
            </div>
            <div className="text-gray-200 text-3xl font-light pt-2">-</div>
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-1 text-gray-400">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Food</span>
              </div>
              <p className="font-black text-gray-900 text-xl">{totals.calories} <span className="text-xs text-gray-400 font-normal">kcal</span></p>
            </div>
            <div className="text-gray-200 text-3xl font-light pt-2">=</div>
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-1 text-gray-400">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Left</span>
              </div>
              <p className="font-black text-emerald-600 text-xl">{remainingCal} <span className="text-xs text-gray-400 font-normal">kcal</span></p>
            </div>
          </div>
          
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="absolute h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min((totals.calories / targetCal) * 100, 100)}%` }} />
            {/* <div className="absolute w-2 h-2 bg-gray-900 rounded-full -top-[2.5px]" style={{ left: `${Math.min((totals.calories / targetCal) * 100, 100)}%` }} /> */}
          </div>

          {/* <div className="flex justify-between px-2 pt-2">
            {[{ label: 'CARBS', color: 'bg-sky-400', perc: 0 }, { label: 'PROTEIN', color: 'bg-purple-500', perc: 0 }, { label: 'FAT', color: 'bg-orange-500', perc: 0 }].map((m) => (
              <div key={m.label} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${m.color}`} />
                <span className="text-[10px] font-black uppercase text-gray-500">{m.label} {m.perc}%</span>
                <Info className="w-4 h-4 text-gray-300" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-6 gap-2 pt-4 border-t border-gray-50">
            {FOOD_GROUPS.map((group) => (
              <div key={group.name} className="flex flex-col items-center space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter text-center leading-tight">{group.name}</p>
                <div className={`w-10 h-10 rounded-2xl ${group.bg} flex items-center justify-center p-2`}>
                    <group.icon className={`w-full h-full ${group.color}`} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter text-center leading-tight">0 / {group.target}</p>
              </div>
            ))}
          </div> */}

          <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Macronutrients</p>
          {/* Macro & Fiber Rings Grid */}
              <div className="grid grid-cols-4 gap-2 pt-0 border-t border-gray-50">
                <MacroRing 
                  label="Protein" 
                  current={totals.protein} 
                  target={userProfile.targetProtein || 60} 
                  color="#FF9999" 
                />
                <MacroRing 
                  label="Fat" 
                  current={totals.fat} 
                  target={userProfile.targetFat || 50} 
                  color="#FFE066" 
                />
                <MacroRing 
                  label="Carbs" 
                  current={totals.carbs} 
                  target={userProfile.targetCarbs || 150} 
                  color="#99E0FF" 
                />
                <MacroRing 
                  label="Fiber" 
                  current={totals.fiber} 
                  target={userProfile.targetFiber || 25} 
                  color="#D5B4B4" 
                />
              </div>
        </div>

        {(['breakfast','lunch','dinner','snack'] as MealType[]).map((cat) => (
          <div key={cat} className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[#1A2A33] font-black uppercase tracking-widest text-xs">{cat}</h3>
              <button onClick={() => { setActiveCategory(cat); setIsScanning(true); }} className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                <span>AI Scan</span>
                <Camera size={14} />
              </button>
            </div>
            {todaysMeals.filter(m => m.mealType === cat).map(meal => (
              <div key={meal.id} onClick={() => openEditMeal(meal)} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                    {meal.photoUrl ? <img src={meal.photoUrl} className="w-full h-full object-cover rounded-2xl" /> : <Utensils className="w-6 h-6 text-gray-300" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{meal.food.name}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{meal.food.nutrients.calories} kcal</p>
                  </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-200" />
              </div>
            ))}
            <button onClick={() => { setActiveCategory(cat); setIsSearching(true); }} className="w-full bg-gray-50 text-gray-400 font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest border border-gray-100 hover:bg-gray-100 transition-colors">
              Add {cat}
            </button>
          </div>
        ))}
      </div>

      {/* ADJUSTMENT OVERLAY (Logged Food Details) */}
      {isAdjusting && selectedFood && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
          {/* Header Row */}
          <div className="p-4 flex items-center justify-between border-b border-gray-50 pb-0">
            <button 
              onClick={() => setIsAdjusting(false)} 
              className="flex items-center space-x-2 text-gray-400 font-black text-[10px] uppercase tracking-widest bg-gray-50 px-4 py-2.5 rounded-3xl"
            >
              <Pencil size={14} />
              <span>Edit Meal</span>
            </button>
            <button 
              onClick={confirmMeal}
              className="bg-[#1A2A33] text-white px-8 py-2.5 rounded-3xl font-black text-xs shadow-xl active:scale-95 transition-all hover:bg-black active:scale-[0.98] uppercase tracking-widest"
            >
              Done
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-10">
            {/* Category Summary Header */}
            <div className="px-6 py-8 text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-4xl font-black text-[#1A2A33]">{activeCategory}</h2>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-800">{Math.round(categoryCurrent.calories)} / {targetCal} Cal</p>
                <div className="w-full max-w-[240px] mx-auto h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((categoryCurrent.calories / targetCal) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Macro Rings Row */}
            <div className="grid grid-cols-4 gap-2 px-6 mb-10">
              <MacroRing label="Protein" current={categoryCurrent.protein} target={categoryTargets.protein} color="#FF9999" />
              <MacroRing label="Fat" current={categoryCurrent.fat} target={categoryTargets.fat} color="#FFE066" />
              <MacroRing label="Carbs" current={categoryCurrent.carbs} target={categoryTargets.carbs} color="#99E0FF" />
              <MacroRing label="Fiber" current={categoryCurrent.fiber} target={categoryTargets.fiber} color="#D5B4B4" />
            </div>

            <div className="h-[1px] bg-gray-100 mx-6 mb-8" />

            {/* Food Item Details */}
            <div className="px-6 space-y-2 mb-10">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-[#1A2A33] leading-tight">{selectedFood.name}</h3>
                  <div className="text-sm text-gray-500 font-medium leading-relaxed">
                    {/* INGREDIENTS LIST - Displayed when clicking a logged food */}
                    <div className="mt-3 space-y-2">
                      {ingredientSummary && (
                        <span>
                          With:{' '}
                          <span className="text-gray-900 font-semibold">
                            {ingredientSummary.names}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={24} />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <span className="text-lg font-bold text-gray-800">{currentNutrients?.calories} Cal, 1 serving ({Math.round(gramsValue)} g)</span>
              </div>
            </div>

            <div className="h-[1px] bg-gray-100 mx-6 mb-10" />

            {/* Malaysian Nutrition Facts Label */}
            <div className="px-6">
              <div className="border-[4px] border-black p-5 space-y-4 text-black max-w-sm mx-auto shadow-sm">
                <h2 className="text-3xl font-black border-b-[10px] border-black pb-1 uppercase italic leading-none tracking-tighter">Nutrition Facts</h2>
                
                <div className="border-b border-black py-1">
                  <div className="flex justify-between items-baseline font-black">
                    <span className="text-sm">Serving size</span>
                    <span className="text-xl">{Math.round(gramsValue)}g</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest">Amount Per Serving</p>
                  <div className="flex justify-between items-baseline border-b-[6px] border-black pb-1">
                    <span className="text-3xl font-black tracking-tighter">Calories</span>
                    <span className="text-4xl font-black">{currentNutrients?.calories}</span>
                  </div>
                </div>

                <div className="flex justify-end border-b border-black py-1">
                  <span className="text-[10px] font-black uppercase">% Daily Value*</span>
                </div>

                <div className="space-y-2">
                  {[
                    { name: 'Total Fat', value: currentNutrients?.fat, perc: Math.round(((currentNutrients?.fat || 0) / 65) * 100) },
                    { name: 'Total Carbohydrate', value: currentNutrients?.carbs, perc: Math.round(((currentNutrients?.carbs || 0) / 300) * 100) },
                    { name: 'Protein', value: currentNutrients?.protein, perc: Math.round(((currentNutrients?.protein || 0) / 50) * 100) },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-baseline border-b border-black/20 pb-1 last:border-0">
                      <p className="text-sm font-black uppercase tracking-tight">{item.name} <span className="font-medium lowercase tracking-normal">{item.value}g</span></p>
                      <span className="text-sm font-black">{item.perc}%</span>
                    </div>
                  ))}
                </div>

                <div className="border-t-[6px] border-black pt-2">
                  <p className="text-[8px] leading-tight font-bold italic">
                    * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Full-Screen Component */}
      {isScanning && (
        <CameraScanner 
          category={activeCategory}
          currentCalories={categoryCurrent.calories}
          targetCalories={userProfile.targetCalories / 3} // Mock category target
          onCapture={handleCapture}
          onClose={() => setIsScanning(false)}
        />
      )}

      {/* AI SCANNING OVERLAY */}
      {analyzing && (
        <div className="fixed inset-0 bg-white/95 z-[100] flex flex-col items-center justify-center p-8 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative w-48 h-48 mb-12">
            <div className="absolute inset-0 bg-sky-100 rounded-[40px] animate-pulse" />
            <div className="absolute inset-4 overflow-hidden rounded-[32px] border-4 border-white shadow-xl bg-gray-50 flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover scale-110" alt="Scanning" />
              ) : (
                <Utensils className="w-12 h-12 text-sky-200" />
              )}
              <div className="absolute inset-0 bg-sky-400/20 animate-scan-line" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-transparent p-4 rounded-2xl text-white shadow-lg animate-bounce">
              <div className="relative">
              <div className="w-16 h-16 bg-emerald-50 rounded-[40px] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden group">
                <MakanFitAvatar size={42} className="group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            </div>
          </div>
          <div className="space-y-4 text-center">
            <h3 className="text-2xl font-black text-gray-800">MakanFit AI Scanning</h3>
            <p className="text-emerald-500 font-bold transition-all animate-in fade-in slide-in-from-bottom duration-500">
              {SCAN_MESSAGES[scanMessageIndex]}
            </p>
          </div>
          <div className="mt-12 flex items-center space-x-3 text-gray-300 text-sm font-bold tracking-widest uppercase">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Image</span>
          </div>
        </div>
      )}

      {/* AI SCAN RESULTS PAGE (REDESIGNED BASED ON IMAGES) */}
      {selectedFood && (
        <div className="fixed inset-0 bg-white z-[95] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
          {/* Header Image Section */}
          <div className="relative h-[40vh] w-full">
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-full object-cover" alt="Result" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Utensils className="w-20 h-20 text-white" />
              </div>
            )}
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            
            {/* Top Bar Controls */}
            <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-10">
              <button
              onClick={() => {
                  // If we are editing a meal, go back to the Logged Food Details page
                  // instead of exiting entirely to the diary.
                  if (editingMealId) {
                    setIsAdjusting(true);
                  } else {
                    resetForm();
                  }
                }}
              className="p-2 text-white">
                <ArrowLeft className="w-6 h-6" />
              </button>
              {/* <button className="p-2 text-white">
                <Star className="w-6 h-6" />
              </button> */}
              
              <div className="relative">
                <button
                  onClick={() => setShowHelp(prev => !prev)}
                  className="flex-shrink-0"
                >
                  <HelpCircle
                    className="text-white active:scale-95 transition-transform"
                    size={25}
                  />
                </button>

                {showHelp && (
                  <div className="absolute right-0 mt-0 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 shadow-lg">
                      <p className="text-[10px] text-sky-800 font-bold leading-relaxed">
                        Can't recognize the dish? Our AI handles 120 Malaysian local foods, but if it's not covered, Search Manually instead!
                      </p>
                      <p className="text-[10px] text-sky-800 font-bold leading-relaxed">
                        Segmentation might sometimes be off, partially wrong, or fail to detect ingredients if the image is unclear.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Title Overlay with Image Expand Hint */}
            <div className="absolute bottom-10 left-0 w-full px-6">
              <div className="flex items-start justify-between gap-4">
                {/* Title Section */}
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-white leading-tight mb-1">{selectedFood.name}</h2>
                  <p className="text-white/80 text-sm font-medium">
                    {ingredients.length > 0 
                      ? `Contains: ${ingredients.map(i => i.name).join(", ")}`
                      : ""
                    }
                  </p>
                </div>

                {/* Image Expand Hint */}
                {previewUrl && (
                  <button 
                    onClick={() => setIsImageViewerOpen(true)}
                    className="flex-shrink-0 p-2 bg-white/90 rounded-full shadow-lg backdrop-blur-sm hover:bg-white transition-colors active:scale-95"
                    title="Click to expand"
                  >
                    <Maximize2 className="w-4 h-4 text-gray-800" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Floating Action Card Content */}
          <div className="flex-1 bg-white rounded-t-[32px] -mt-8 relative z-20 overflow-y-auto pb-24 shadow-2xl">
            {/* Sentiment / Summary Strip */}
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center space-x-3">
              {(() => {
                const sentiment = getSentiment(currentNutrients?.calories || 0);
                return (
                  <>
                    <div className={`w-10 h-10 ${sentiment.bg} rounded-full flex items-center justify-center`}>
                      <sentiment.Icon className={`w-6 h-6 ${sentiment.color}`} />
                    </div>
                    <span className="text-lg font-bold text-gray-800">{sentiment.text}</span>
                  </>
                );
              })()}
            </div>
            {calorieData?.calorie_range_kcal && (
              <div className="text-xl font-black text-gray-800">
                {Math.round(calorieData.calorie_range_kcal.min_kcal)} <span className="text-gray-400 font-semibold">–</span> {Math.round(calorieData.calorie_range_kcal.max_kcal)} <span className="text-lg text-gray-400 font-semibold">kcal</span>
              </div>
            )}
          </div>

            {/* Serving Size Selector */}
            <div className="px-6 py-0 pt-0">
              <div className="relative">
                <button 
                  onClick={() => setIsServingSizeOpen(!isServingSizeOpen)}
                  className="flex items-center bg-gray-50 rounded-2xl px-3 py-3 justify-between border border-gray-100 w-full hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <input 
                      type="number" 
                      value={servingSizeMode === 'serving' ? servingSizeValue : gramsValue}
                      onChange={(e) => {
                        if (servingSizeMode === 'serving') {
                          setServingSizeValue(parseFloat(e.target.value) || 1);
                        } else {
                          setGramsValue(parseFloat(e.target.value) || 0);
                        }
                      }}
                      className="text-[16px] font-bold text-[#1A2A33] bg-transparent w-12 outline-none border-none"
                      step="0.5"
                      min="0.5"
                    />
                    <div className="h-6 w-[1px] bg-gray-200" />
                    <span className="text-[16px] font-bold text-[#1A2A33]">
                      {servingSizeMode === 'serving' 
                        ? `serving (${Math.round((selectedFood?.servingSize) * servingSizeValue)} g)`
                        : `g`
                      }
                    </span>
                  </div>
                  <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isServingSizeOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
              {isServingSizeOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setServingSizeMode('serving');
                      // Calculate serving from current grams
                      const newServing = gramsValue / (selectedFood?.servingSize);
                      setServingSizeValue(parseFloat(newServing.toFixed(2)));
                      setIsServingSizeOpen(false);
                    }}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors font-bold flex items-center justify-between ${servingSizeMode === 'serving' ? 'bg-sky-50 text-sky-600' : 'text-gray-800'}`}
                  >
                    <span className="text-[15px]">
                      {parseFloat((gramsValue / (selectedFood?.servingSize)).toFixed(2))} serving ({Math.round(gramsValue)} g)
                      </span>
                    {servingSizeMode === 'serving' && <Check className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => {
                      setServingSizeMode('g');
                      // Calculate grams from current serving
                      const newGrams = servingSizeValue * (selectedFood?.servingSize || 250);
                      setGramsValue(newGrams);
                      setIsServingSizeOpen(false);
                    }}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors font-bold flex items-center justify-between border-t border-gray-50 ${servingSizeMode === 'g' ? 'bg-sky-50 text-sky-600' : 'text-gray-800'}`}
                  >
                    <span className="text-[15px]">
                      {Math.round(servingSizeValue * (selectedFood?.servingSize))} g ({servingSizeValue.toFixed(1)} serving)
                      </span>
                    {servingSizeMode === 'g' && <Check className="w-5 h-5" />}
                  </button>
                </div>
              )}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex px-6 border-b border-gray-50 mt-2">
              <button 
                onClick={() => setActiveResultTab('nutrition')}
                className={`flex-1 py-4 flex items-center justify-center space-x-2 relative transition-all ${activeResultTab === 'nutrition' ? 'text-gray-800' : 'text-gray-400'}`}
              >
                {/* <Leaf className={`w-5 h-5 ${activeResultTab === 'nutrition' ? 'text-gray-800' : 'text-gray-400'}`} /> */}
                <span className="font-bold text-sm uppercase tracking-widest">Nutrition</span>
                {activeResultTab === 'nutrition' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-800" />}
              </button>
              <button 
                onClick={() => setActiveResultTab('customize')}
                className={`flex-1 py-4 flex items-center justify-center space-x-2 relative transition-all ${activeResultTab === 'customize' ? 'text-gray-800' : 'text-gray-400'}`}
              >
                {/* <Pencil className={`w-5 h-5 ${activeResultTab === 'customize' ? 'text-gray-800' : 'text-gray-400'}`} /> */}
                <span className="font-bold text-sm uppercase tracking-widest">Customize</span>
                {activeResultTab === 'customize' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-800" />}
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeResultTab === 'nutrition' ? (
                <div className="space-y-8">
                  {/* <h4 className="text-lg font-bold text-gray-800">Nutritional facts</h4> */}
                  
                  {/* Total Calories Goal */}
                  {/* <div className="space-y-3">
                    <div className="flex justify-between items-baseline font-bold text-gray-800">
                      <span className="text-sm">Total calories</span>
                      <span className="text-sm">{selectedFood.nutrients.calories} / {targetCal} Cal</span>
                    </div>
                    <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((selectedFood.nutrients.calories / targetCal) * 100, 100)}%` }} />
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-800">{targetCal - selectedFood.nutrients.calories} Cal left</span>
                    </div>
                  </div> */}

                  {/* Protein Goal */}
                  {/* <div className="space-y-3">
                    <div className="flex justify-between items-baseline font-bold text-gray-800">
                      <span className="text-sm">Protein</span>
                      <span className="text-sm">{selectedFood.nutrients.protein} / {targetProtein} g</span>
                    </div>
                    <div className="h-2 w-full bg-orange-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${Math.min((selectedFood.nutrients.protein / targetProtein) * 100, 100)}%` }} />
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-800">{targetProtein - selectedFood.nutrients.protein} g left</span>
                    </div>
                  </div> */}

                  {/* <div className="p-4 flex items-center justify-center border-b border-gray-100 relative">
                    <button onClick={() => setIsShowingNutritionLabel(false)} className="absolute left-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                      <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="text-gray-400" size={20} />
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Nutrition Information</span>
                    </div>
                  </div> */}
                  
                  <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 pt-0">
                    {/* Malaysian Style Label */}
                    <div className="border-[3px] border-black p-4 space-y-4 text-black">
                      <h2 className="text-2xl font-black border-b-8 border-black pb-1 uppercase italic leading-none">Nutrition Facts</h2>
                      
                      <div className="border-b border-black py-1">
                        <div className="flex justify-between items-baseline font-bold">
                          <span className="text-sm">Serving size</span>
                          <span className="text-lg">{Math.round(gramsValue)} g</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase">Amount Per Serving</p>
                        <div className="flex justify-between items-baseline border-b-4 border-black pb-1">
                        <span className="text-xl font-black">Calories</span>

                        {calorieData?.calorie_range_kcal && (
                          <span className="text-lg font-bold">
                            {Math.round(calorieData.calorie_range_kcal.min_kcal)}
                            <span className="text-gray-400 font-semibold"> – </span>
                            {Math.round(calorieData.calorie_range_kcal.max_kcal)} kcal
                          </span>
                        )}
                      </div>
                      </div>

                      <div className="flex justify-end border-b border-black py-1">
                        <span className="text-[10px] font-black uppercase">% Daily Value*</span>
                      </div>

                      {/* <div className="space-y-1.5">
                        {[
                          { name: 'Total Fat', value: selectedFood.nutrients.fat, perc: Math.round((selectedFood.nutrients.fat / 65) * 100) },
                          { name: 'Total Carbohydrate', value: selectedFood.nutrients.carbs, perc: Math.round((selectedFood.nutrients.carbs / 300) * 100) },
                          { name: 'Protein', value: selectedFood.nutrients.protein, perc: Math.round((selectedFood.nutrients.protein / 50) * 100) },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-baseline border-b border-black/20 pb-1 last:border-0">
                            <p className="text-sm font-bold">{item.name} <span className="font-normal">{item.value}g</span></p>
                            <span className="text-sm font-black">{item.perc}%</span>
                          </div>
                        ))}
                      </div> */}

                      <div className="space-y-1.5">
                        {calorieData?.total_nutrition && [
                          {
                            name: 'Total Fat',
                            value: calorieData.total_nutrition.fat_g,
                            perc: Math.round((calorieData.total_nutrition.fat_g / 65) * 100),
                          },
                          {
                            name: 'Total Carbohydrate',
                            value: calorieData.total_nutrition.carbohydrates_g,
                            perc: Math.round((calorieData.total_nutrition.carbohydrates_g / 300) * 100),
                          },
                          {
                            name: 'Dietary Fiber',
                            value: calorieData.total_nutrition.fiber_g,
                            perc: Math.round((calorieData.total_nutrition.fiber_g / 25) * 100),
                          },
                          {
                            name: 'Protein',
                            value: calorieData.total_nutrition.protein_g,
                            perc: Math.round((calorieData.total_nutrition.protein_g / 50) * 100),
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-baseline border-b border-black/20 pb-1 last:border-0"
                          >
                            <p className="text-sm font-bold">
                              {item.name}{' '}
                              <span className="font-normal">
                                {item.value}g
                              </span>
                            </p>
                            <span className="text-sm font-black">
                              {item.perc}%
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t-4 border-black pt-2">
                        <p className="text-[8px] leading-tight font-medium">
                          * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
                        </p>
                      </div>
                    </div>

                    {/* Composition Breakdown */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                        Serving Breakdown
                      </p>

                      <div className="flex h-4 w-full rounded-full overflow-hidden">
                        <div className="bg-sky-400" style={{ width: `${carbsPerc}%` }} />
                        <div className="bg-purple-400" style={{ width: `${proteinPerc}%` }} />
                        <div className="bg-orange-400" style={{ width: `${fatPerc}%` }} />
                      </div>

                      <div className="flex justify-between px-1">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          <span className="text-[9px] font-bold text-gray-400 uppercase">
                            Carbs {Math.round(carbsPerc)}%
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span className="text-[9px] font-bold text-gray-400 uppercase">
                            Protein {Math.round(proteinPerc)}%
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                          <span className="text-[9px] font-bold text-gray-400 uppercase">
                            Fat {Math.round(fatPerc)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* <h4 className="text-lg font-bold text-gray-800">For 1 serving ({selectedFood.servingSize} g)</h4> */}
                  <p className="text-[10px] text-center text-gray-400 font-medium px-4">
                    <button className="text-gray-400">
                      <Info size={12} />
                    </button>
                    {' '}AI-estimated food composition based on detected ingredients. Results may be inaccurate and should be manually reviewed.
                  </p>

                  <div className="space-y-4">
                    {ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="w-full bg-gray-50 rounded-2xl border hover:shadow-md transition-all relative overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedIngredientIdx(expandedIngredientIdx === idx ? null : idx)}
                          className="w-full text-left p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`transition-transform duration-200 ${expandedIngredientIdx === idx ? 'rotate-90' : ''}`}>
                              <ChevronRight size={18} className="text-emerald-500" />
                            </div>
                            <span className="font-bold text-gray-700 text-sm capitalize">{ing.name}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-bold text-gray-400">{ing.nutrients.calories}{' '}kcal</span>
                            {/* Delete button in row */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIngredientIndex(idx);
                                setSelectedIngredientName(ing.name);
                                setIsDeleteIngredientModalOpen(true);
                              }}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </button>

                          {expandedIngredientIdx === idx && (
                            <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="pt-2 border-t border-emerald-100/50">
                                <div className="flex items-center justify-between text-xs text-gray-600 font-medium mb-3">
                                  <div className="flex items-center space-x-1">
                                    <span>Weight:</span>
                                    <input
                                      type="number"
                                      value={ing.servingSize || 0}
                                      onChange={(e) => updateIngredientWeight(idx, parseFloat(e.target.value) || 0)}
                                      className="w-16 bg-white border border-emerald-200 rounded-lg px-2 py-0.5 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-400 text-center"
                                    />
                                    <span>g</span>
                                  </div>
                                  <span><strong>{Math.round((ing.nutrients.calories / (selectedFood?.nutrients.calories || 1)) * 100)}%</strong> of dish</span>
                                </div>

                                {/* Mini Macro Grid */}
                                <div className="grid grid-cols-4 gap-1.5 mb-3">
                                  <div className="text-center p-1.5 bg-white rounded shadow-sm">
                                    <p className="text-[7px] font-black text-gray-400 uppercase">Pro</p>
                                    <p className="text-xs font-bold text-purple-700">{(ing.nutrients.protein || 0).toFixed(1)}g</p>
                                  </div>
                                  <div className="text-center p-1.5 bg-white rounded shadow-sm">
                                    <p className="text-[7px] font-black text-gray-400 uppercase">Carbs</p>
                                    <p className="text-xs font-bold text-sky-700">{(ing.nutrients.carbs || 0).toFixed(1)}g</p>
                                  </div>
                                  <div className="text-center p-1.5 bg-white rounded shadow-sm">
                                    <p className="text-[7px] font-black text-gray-400 uppercase">Fat</p>
                                    <p className="text-xs font-bold text-orange-700">{(ing.nutrients.fat || 0).toFixed(1)}g</p>
                                  </div>
                                  <div className="text-center p-1.5 bg-white rounded shadow-sm">
                                    <p className="text-[7px] font-black text-gray-400 uppercase">Fiber</p>
                                    <p className="text-xs font-bold text-amber-700">{(ing.nutrients.fiber || 0).toFixed(1)}g</p>
                                  </div>
                                </div>

                                {/* Proportion Bar */}
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-emerald-400 to-sky-400"
                                      style={{ width: `${Math.min((ing.nutrients.calories / (selectedFood?.nutrients.calories || 1)) * 100, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-[9px] font-bold text-gray-500 w-8 text-right">
                                    {Math.round((ing.nutrients.calories / (selectedFood?.nutrients.calories || 1)) * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>

                  {/* <button 
                    onClick={() => {setIsEditingIngredients(true); setIsSearching(true);}}
                    className="flex items-center space-x-4 p-4 text-gray-800 hover:bg-gray-50 transition-colors w-full"
                  >
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white">
                      <Plus size={24} />
                    </div>
                    <span className="font-bold text-lg">Add ingredients</span>
                  </button> */}

                  <button
                  onClick={() => {setIsEditingIngredients(true); setIsSearching(true);}}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center space-x-2 text-slate-400 font-bold uppercase text-xs">
                      <Plus size={16} />
                      <span>Add Ingredient</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer Button */}
          <div className="absolute bottom-0 left-0 w-full p-6 bg-transparent z-30">
            <button 
              onClick={() => confirmMeal()}
              className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
            >
              {editingMealId ? 'Save this food' : 'Log this food'}
            </button>
          </div>
        </div>
      )}

      {/* NEW: INGREDIENT ADDITION OVERLAY (triggered after selecting from search) */}
      {isIngredientDetailOpen && tempIngredient && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-[140]"
            onClick={() => setIsIngredientDetailOpen(false)}
          />

          {/* Bottom Half Sheet */}
          <div
            className="
              fixed bottom-0 left-0 right-0
              h-[66vh]
              bg-white
              z-[150]
              flex flex-col
              rounded-t-[32px]
              shadow-2xl
              animate-in slide-in-from-bottom duration-300
            "
          >
            {/* Drag handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />

            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <button 
                onClick={() => setIsIngredientDetailOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-50 rounded-full"
              >
                <ArrowLeft size={24} />
              </button>
              <span className="font-black text-gray-800 uppercase tracking-widest text-xs">
                Add Ingredient
              </span>
              <div className="w-10" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-black text-[#1A2A33] leading-tight">
                  {tempIngredient.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-md font-bold text-gray-500">
                    {Math.round(tempIngredient.nutrients.calories * tempServingValue)} Cal
                  </span>
                </div>
              </div>

              {/* Serving Adjustment Mode Dropdown (same logic as main page) */}
              <div className="relative">
                <button 
                  onClick={() => setIsTempServingSizeOpen(!isTempServingSizeOpen)}
                  className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 flex items-center justify-between w-full hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center flex-1">
                    <input 
                      type="number" 
                      value={tempServingSizeMode === 'serving' ? tempServingValue : Math.round(tempGramsValue)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (tempServingSizeMode === 'serving') {
                          setTempServingValue(val);
                        } else {
                          setTempGramsValue(val);
                        }
                      }}
                      className="w-16 text-xl font-bold text-[#1A2A33] bg-transparent outline-none border-none text-center"
                      step="0.5"
                      min="0.1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="h-8 w-[1px] bg-gray-200 mx-4" />
                    <span className="text-lg font-bold text-[#1A2A33]">
                      {tempServingSizeMode === 'serving' 
                        ? `serving (${Math.round(tempServingValue * tempBaseGrams)} g)` 
                        : `g (${tempServingValue.toFixed(1)} serving)`
                      }
                    </span>
                  </div>
                  <ChevronDown className={`text-gray-400 w-6 h-6 transition-transform ${isTempServingSizeOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Options for Temp Ingredient */}
                {isTempServingSizeOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-[160] overflow-hidden">
                    <button
                      onClick={() => {
                        setTempServingSizeMode('serving');
                        setIsTempServingSizeOpen(false);
                      }}
                      className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors font-bold flex items-center justify-between ${tempServingSizeMode === 'serving' ? 'bg-sky-50 text-sky-600' : 'text-gray-800'}`}
                    >
                      <span>{tempServingValue.toFixed(1)} serving ({Math.round(tempServingValue * tempBaseGrams)} g)</span>
                      {tempServingSizeMode === 'serving' && <Check className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => {
                        setTempServingSizeMode('g');
                        setIsTempServingSizeOpen(false);
                      }}
                      className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors font-bold flex items-center justify-between border-t border-gray-50 ${tempServingSizeMode === 'g' ? 'bg-sky-50 text-sky-600' : 'text-gray-800'}`}
                    >
                      <span>{Math.round(tempGramsValue)} g ({tempServingValue.toFixed(1)} serving)</span>
                      {tempServingSizeMode === 'g' && <Check className="w-5 h-5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-gray-50">
              <button 
                onClick={handleAddIngredientFinal}
                className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-3xl uppercase tracking-widest text-xs shadow-xl active:scale-[0.98] transition-all"
              >
                Add this ingredient
              </button>
            </div>
          </div>
        </>
      )}

      {/* FULLSCREEN IMAGE VIEWER MODAL */}
      {isImageViewerOpen && previewUrl && (
        <div className="fixed inset-0 bg-black z-[150] flex flex-col items-center justify-center animate-in fade-in duration-300">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black via-black/50 to-transparent">
            <button 
              onClick={() => setIsImageViewerOpen(false)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <span className="text-white font-bold text-sm">{selectedFood?.name}</span>
            <div className="w-10" />
          </div>

          {/* Image Container with Zoom */}
          <div className="flex-1 flex items-center justify-center w-full overflow-auto">
            <div 
              className="relative cursor-zoom-in hover:cursor-zoom-out transition-transform"
              style={{
                transform: `scale(${imageZoom})`,
                transformOrigin: 'center'
              }}
              onClick={() => setImageZoom(imageZoom === 1 ? 1.5 : 1)}
            >
              <img 
                src={previewUrl}
                alt={selectedFood?.name}
                className="object-contain"
                style={{
                  maxWidth: imageZoom === 1 ? '90vw' : '100%',
                  maxHeight: imageZoom === 1 ? '70vh' : '100%',
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/50 to-transparent flex items-center justify-center space-x-4 z-10">
            <button 
              onClick={() => setImageZoom(Math.max(1, imageZoom - 0.2))}
              className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white font-bold text-sm min-w-[60px] text-center">
              {Math.round(imageZoom * 100)}%
            </span>
            <button 
              onClick={() => setImageZoom(Math.min(3, imageZoom + 0.2))}
              className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <button 
              onClick={() => {
                setImageZoom(1);
                setIsImageViewerOpen(false);
              }}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsDeleteModalOpen(false)} 
          />
          <div className="relative bg-white w-full max-w-sm rounded-[48px] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                <Trash2 size={25} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Delete item?</h3>
                <p className="text-gray-400 font-bold leading-relaxed">
                  Are you sure you want to remove <span className="text-gray-600">"{selectedFood?.name}"</span> from your diary? This action cannot be undone.
                </p>
              </div>

              <div className="w-full space-y-3 pt-2">
                <button 
                  onClick={handleDeleteMealConfirm}
                  className="w-full bg-red-500 text-white font-black py-5 rounded-3xl shadow-xl shadow-red-100 active:scale-[0.95] transition-all uppercase text-xs tracking-widest"
                >
                  Yes, Remove Item
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full bg-gray-50 text-gray-400 font-black py-5 rounded-3xl active:scale-[0.95] transition-all uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-8 right-8 p-2 bg-gray-50 rounded-full text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM INGREDIENT REMOVAL MODAL */}
      {isDeleteIngredientModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsDeleteIngredientModalOpen(false)} 
          />
          <div className="relative bg-white w-full max-w-sm rounded-[48px] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                <Trash2 size={25} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Remove ingredient?</h3>
                <p className="text-gray-400 font-bold leading-relaxed">
                  Are you sure you want to remove <span className="text-gray-600">"{selectedIngredientName}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="w-full space-y-3 pt-2">
                <button 
                  onClick={handleConfirmRemoveIngredient}
                  className="w-full bg-red-500 text-white font-black py-5 rounded-3xl shadow-xl shadow-red-100 active:scale-[0.95] transition-all uppercase text-xs tracking-widest"
                >
                  Yes, Remove
                </button>
                <button 
                  onClick={() => setIsDeleteIngredientModalOpen(false)}
                  className="w-full bg-gray-50 text-gray-400 font-black py-5 rounded-3xl active:scale-[0.95] transition-all uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => setIsDeleteIngredientModalOpen(false)}
              className="absolute top-8 right-8 p-2 bg-gray-50 rounded-full text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* NUTRITION FACTS OVERLAY */}
      {isShowingNutritionLabel && selectedFood && (
        <div className="fixed inset-0 bg-white z-[120] flex flex-col animate-in fade-in duration-300">
          <div className="p-4 flex items-center justify-center border-b border-gray-100 relative">
            <button onClick={() => setIsShowingNutritionLabel(false)} className="absolute left-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center space-x-2">
              <ClipboardList className="text-gray-400" size={20} />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Nutrition Information</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            {/* Malaysian Style Label */}
            <div className="border-[3px] border-black p-4 space-y-4 text-black">
              <h2 className="text-2xl font-black border-b-8 border-black pb-1 uppercase italic leading-none">Nutrition Facts</h2>
              
              <div className="border-b border-black py-1">
                <div className="flex justify-between items-baseline font-bold">
                  <span className="text-sm">Serving size</span>
                  <span className="text-lg">{selectedFood.servingSize || 458}g</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase">Amount Per Serving</p>
                <div className="flex justify-between items-baseline border-b-4 border-black pb-1">
                  <span className="text-2xl font-black">Calories</span>
                  <span className="text-2xl font-black">{selectedFood.nutrients.calories}</span>
                </div>
              </div>

              <div className="flex justify-end border-b border-black py-1">
                <span className="text-[10px] font-black uppercase">% Daily Value*</span>
              </div>

              <div className="space-y-1.5">
                {[
                  { name: 'Total Fat', value: selectedFood.nutrients.fat, perc: Math.round((selectedFood.nutrients.fat / 65) * 100) },
                  { name: 'Total Carbohydrate', value: selectedFood.nutrients.carbs, perc: Math.round((selectedFood.nutrients.carbs / 300) * 100) },
                  { name: 'Protein', value: selectedFood.nutrients.protein, perc: Math.round((selectedFood.nutrients.protein / 50) * 100) },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-baseline border-b border-black/20 pb-1 last:border-0">
                    <p className="text-sm font-bold">{item.name} <span className="font-normal">{item.value}g</span></p>
                    <span className="text-sm font-black">{item.perc}%</span>
                  </div>
                ))}
              </div>

              <div className="border-t-4 border-black pt-2">
                <p className="text-[8px] leading-tight font-medium">
                  * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
                </p>
              </div>
            </div>

            {/* Composition Breakdown */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Serving Breakdown</p>
              <div className="flex h-4 w-full rounded-full overflow-hidden">
                <div className="bg-sky-400" style={{ width: '45%' }} />
                <div className="bg-purple-400" style={{ width: '25%' }} />
                <div className="bg-orange-400" style={{ width: '30%' }} />
              </div>
              <div className="flex justify-between px-1">
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Carbs</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Protein</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Fat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH OVERLAY */}
      {isSearching && (
        <div className="fixed inset-0 bg-white z-[100] p-4 flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center space-x-3 mb-6">
            <button onClick={() => { setIsSearching(false); setIsEditingIngredients(false); if (searchFromResults) { setSearchFromResults(false); } }} className="p-2"><ChevronLeft /></button>
            <input type="text" autoFocus placeholder="Search food..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-gray-50 p-4 rounded-2xl text-sm outline-none" />
          </div>
          <div className="space-y-2 overflow-y-auto flex-1">
            {results.map(f => (
              <button 
                key={f.id} 
                onClick={() => { 
                  if (isEditingIngredients && selectedFood) {
                    // NEW FLOW: Show intermediate detail overlay
                    setTempIngredient({
                      ...f,
                      nutrients: {
                        ...f.nutrients,
                      },
                    });
                    setTempServingValue(1);
                    setTempBaseGrams(f.servingSize || 100);
                    setTempGramsValue(f.servingSize || 100);
                    setIsIngredientDetailOpen(true);
                    setTempServingSizeMode('serving');
                    setIsIngredientDetailOpen(true);
                  } else {
                    setSelectedFood(f); 
                    setIngredients(f.ingredients || []); 
                    setIsSearching(false); 
                  }
                }} 
                className="w-full p-5 border-b border-gray-50 text-left flex justify-between items-center group"
              >
                <div><p className="font-bold text-gray-800">{f.name}</p><p className="text-xs text-gray-400">{f.group}</p></div>
                <div className="text-right">
                  <p className="font-bold text-sky-600">{f.nutrients.calories}</p>
                  <p className="text-[10px] text-gray-400 uppercase">kcal</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI SCAN CAMERA SELECTION OVERLAY */}
      {/* {isScanning && !analyzing && (
        <div className="fixed inset-0 bg-black/80 z-[90] flex items-end justify-center w-screen p-0  backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full rounded-tl-[30px] rounded-tr-[30px] p-8 space-y-5 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-800">AI Food Scan</h3>
              <button onClick={() => setIsScanning(false)} className="p-2 bg-gray-50 rounded-full"><X /></button>
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center space-x-6 p-8 border-4 border-dashed border-sky-100 rounded-[32px] hover:bg-sky-50 transition-all group">
              <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-sky-500" />
              </div>
              <div className="text-left">
                <p className="font-black text-xl text-gray-800">Take Photo</p>
                <p className="text-sm text-gray-400 font-medium">Auto-recognize Malaysian meals</p>
              </div>
            </button> */}
            {/* <input type="file" ref={fileInputRef} onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              const reader = new FileReader(); 
              reader.onloadend = async () => {
                const base64 = reader.result as string; 
                setPreviewUrl(base64); 
                setAnalyzing(true);
                try {
                  const result = await analyzeFoodImage(base64);
                  setSelectedFood({ 
                    name: result.dishName, 
                    nutrients: result.estimatedNutrients, 
                    servingSize: result.estimatedNutrients.calories > 600 ? 550 : 450
                  });
                  setIngredients(result.ingredients);
                  setAnalyzing(false);
                  setIsScanning(false);
                } catch { 
                  alert("Error analyzing food. Check your connection."); 
                  setAnalyzing(false);
                }
              }; 
              reader.readAsDataURL(file);
            }} accept="image/*" capture="environment" className="hidden" /> */}

            {/* For testing */}
            {/* <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64 = reader.result as string;
                  setPreviewUrl(base64);
                  setAnalyzing(true);
                  
                  // Simulate API delay
                  setTimeout(() => {
                    try {
                      // Mock result for testing
                      const result = {
                        dishName: "Nasi Lemak Biasa",
                        estimatedNutrients: {
                          calories: 520,
                          protein: 12,
                          carbs: 65,
                          fat: 22,
                          fiber: 25
                        },
                        ingredients: [
                          { name: "Rice", calories: 300 },
                          { name: "Coconut Milk", calories: 100 },
                          { name: "Anchovies", calories: 60 },
                          { name: "Peanuts", calories: 40 },
                          { name: "Cucumber", calories: 15 },
                          { name: "Egg", calories: 5 }
                        ]
                      };
                      
                      setSelectedFood({
                        id: Math.random().toString(36).substr(2, 9),
                        name: result.dishName,
                        timestamp: Date.now(), // required
                        nutrients: result.estimatedNutrients,
                        servingSize: result.estimatedNutrients.calories > 600 ? 550 : 450,
                        brand: 'AI Scanned',
                        group: 'Scanned',
                        category: 'Breakfast', // choose a valid value or map based on AI result
                        foodCategory: 'Scanned', // required field
                        ingredients: result.ingredients || [],
                        photoUrl: base64 // optional
                      });
                      setIngredients(result.ingredients || []);
                      setAnalyzing(false);
                      setIsScanning(false);
                    } catch {
                      alert("Error analyzing food. Check your connection.");
                      setAnalyzing(false);
                    }
                  }, 1500);
                };
                reader.readAsDataURL(file);
              }}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
          </div>
        </div>
      )} */}

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          position: absolute;
          width: 100%;
          height: 8px;
          background: linear-gradient(to bottom, transparent, #38bdf8, transparent);
          box-shadow: 0 0 25px #38bdf8;
          animation: scan 2s infinite linear;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Diary;
