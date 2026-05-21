export interface OfflineFoodInfo {
  detectedFood: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  tips: string[];
}

export const OFFLINE_FOOD_DATABASE: Record<string, Omit<OfflineFoodInfo, 'detectedFood'>> = {
  banana: {
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.3,
    healthScore: 90,
    tips: ["Rich in potassium and source of quick energy", "Great pre-workout snack"]
  },
  apple: {
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    healthScore: 95,
    tips: ["High in soluble fiber and vitamin C", "Promotes heart health and digestion"]
  },
  egg: {
    calories: 78,
    protein: 6.3,
    carbs: 0.6,
    fat: 5.3,
    healthScore: 85,
    tips: ["Excellent source of high-quality protein", "Contains essential choline for brain health"]
  },
  chicken: {
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    healthScore: 90,
    tips: ["Very lean protein source, great for muscle repair", "Low in saturated fat when skinless"]
  },
  salad: {
    calories: 150,
    protein: 3,
    carbs: 10,
    fat: 12,
    healthScore: 95,
    tips: ["Full of dietary fiber, vitamins, and minerals", "Choose olive oil or light vinaigrette dressings"]
  },
  salmon: {
    calories: 208,
    protein: 22,
    carbs: 0,
    fat: 13,
    healthScore: 98,
    tips: ["Loaded with anti-inflammatory omega-3 fatty acids", "Great source of protein & vitamin B"]
  },
  oatmeal: {
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 2.5,
    healthScore: 90,
    tips: ["Contains beta-glucan fiber which lowers cholesterol", "Keeps you full and satisfied through the morning"]
  },
  rice: {
    calories: 205,
    protein: 4.3,
    carbs: 45,
    fat: 0.4,
    healthScore: 70,
    tips: ["Easy to digest carbohydrates for quick fuel", "Prefer brown rice for more fiber and micronutrients"]
  },
  bread: {
    calories: 79,
    protein: 2.7,
    carbs: 15,
    fat: 1,
    healthScore: 65,
    tips: ["Provides complex carbohydrates for energy", "Look for 100% whole grain to maximize fiber intake"]
  },
  milk: {
    calories: 149,
    protein: 8,
    carbs: 12,
    fat: 8,
    healthScore: 80,
    tips: ["Excellent source of calcium and vitamin D", "Helps in bone development and muscle maintenance"]
  },
  yogurt: {
    calories: 100,
    protein: 10,
    carbs: 6,
    fat: 3,
    healthScore: 92,
    tips: ["Rich in gut-friendly probiotics", "Greek yogurt has double the protein of regular yogurt"]
  },
  avocado: {
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    healthScore: 95,
    tips: ["Loaded with heart-healthy monounsaturated fats", "Excellent source of fiber, potassium, and vitamin E"]
  },
  burger: {
    calories: 540,
    protein: 30,
    carbs: 40,
    fat: 28,
    healthScore: 40,
    tips: ["Often high in sodium and saturated fats", "Pair with water or unsweetened tea instead of soda"]
  },
  pizza: {
    calories: 285,
    protein: 12,
    carbs: 36,
    fat: 10,
    healthScore: 45,
    tips: ["Often high in calories, simple carbs, and sodium", "Add vegetable toppings and opt for thin crust if possible"]
  },
  pasta: {
    calories: 220,
    protein: 8,
    carbs: 43,
    fat: 1.3,
    healthScore: 65,
    tips: ["Energy-dense fuel source", "Pair with lean protein and vegetable-based sauces"]
  },
  steak: {
    calories: 271,
    protein: 25,
    carbs: 0,
    fat: 19,
    healthScore: 75,
    tips: ["Rich in iron, zinc, and energy-releasing B vitamins", "Choose lean cuts like sirloin to reduce saturated fat"]
  },
  broccoli: {
    calories: 31,
    protein: 2.5,
    carbs: 6,
    fat: 0.4,
    healthScore: 98,
    tips: ["Packed with cancer-fighting sulfur compounds", "Extremely low-calorie yet incredibly nutrient-dense"]
  },
  coffee: {
    calories: 2,
    protein: 0.3,
    carbs: 0,
    fat: 0,
    healthScore: 85,
    tips: ["Rich in antioxidants and can boost metabolic rate", "Limit added sugar and heavy cream to keep calories low"]
  },
  toast: {
    calories: 80,
    protein: 3,
    carbs: 15,
    fat: 1,
    healthScore: 70,
    tips: ["Simple carb source, great pre-workout or breakfast base", "Pair with avocado or peanut butter for healthy fats"]
  },
  almond: {
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    healthScore: 90,
    tips: ["Packed with essential nutrients, fiber, and vitamin E", "Supports heart health and helps control blood sugar"]
  },
  orange: {
    calories: 62,
    protein: 1.2,
    carbs: 15,
    fat: 0.2,
    healthScore: 95,
    tips: ["Full of vitamin C which boosts immune system", "Eat whole fruit rather than juice to keep the fiber"]
  },
  banana_bread: {
    calories: 196,
    protein: 2.6,
    carbs: 33,
    fat: 6.3,
    healthScore: 55,
    tips: ["Often high in added refined sugar", "Contains some potassium from bananas. Best enjoyed in moderation"]
  },
  cheese: {
    calories: 113,
    protein: 7,
    carbs: 0.4,
    fat: 9,
    healthScore: 75,
    tips: ["Good source of calcium and high-quality protein", "High in saturated fat and sodium, watch portion size"]
  },
  spinach: {
    calories: 7,
    protein: 0.9,
    carbs: 1,
    fat: 0.1,
    healthScore: 99,
    tips: ["Packed with iron, lutein, vitamin K, and folate", "Excellent leafy green for smoothies, salads, or cooking"]
  },
  carrot: {
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    healthScore: 96,
    tips: ["Rich in beta-carotene which is good for vision", "A crunchy, low-calorie snack satisfying cravings"]
  },
  potato: {
    calories: 110,
    protein: 3,
    carbs: 26,
    fat: 0.2,
    healthScore: 75,
    tips: ["Excellent source of potassium and vitamin C", "Eat skin to maximize dietary fiber; watch toppings"]
  },
  tomato: {
    calories: 22,
    protein: 1.1,
    carbs: 4.8,
    fat: 0.2,
    healthScore: 95,
    tips: ["Terrific source of lycopene, a powerful antioxidant", "Vitamin-rich food that supports heart and skin health"]
  },
  oat: {
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 2.5,
    healthScore: 90,
    tips: ["Contains beta-glucan fiber which lowers cholesterol", "Keeps you full and satisfied through the morning"]
  },
  cereal: {
    calories: 120,
    protein: 2,
    carbs: 24,
    fat: 1,
    healthScore: 60,
    tips: ["Choose options with less than 5g of sugar and more than 3g of fiber", "Great source of fortified vitamins & minerals"]
  },
  sushi: {
    calories: 300,
    protein: 12,
    carbs: 45,
    fat: 5,
    healthScore: 80,
    tips: ["Low fat protein option. Rich in iodine and omega-3s if fish is included", "Watch out for rich sauces (spicy mayo) and fried elements"]
  }
};

/**
 * Parses user text or image descriptive words to analyze food offline.
 * Aggregates information if multiple keywords are matched.
 */
export function analyzeMealOffline(textInput?: string, fileName?: string): OfflineFoodInfo {
  const normText = `${textInput || ''} ${fileName || ''}`.toLowerCase().replace(/[^a-z0-9_\s-]/g, ' ');
  const words = normText.split(/\s+/);
  
  // Load dynamic offline database items
  let dynamicDatabase: Record<string, Omit<OfflineFoodInfo, 'detectedFood'>> = {};
  if (typeof window !== 'undefined') {
    try {
      const dynamicDbStr = localStorage.getItem('nutrilens_dynamic_offline_db');
      if (dynamicDbStr) {
        dynamicDatabase = JSON.parse(dynamicDbStr);
      }
    } catch (e) {
      console.error("Failed to parse dynamic database", e);
    }
  }

  const mergedDatabase = { ...OFFLINE_FOOD_DATABASE, ...dynamicDatabase };
  const matchedEntries: { key: string; val: Omit<OfflineFoodInfo, 'detectedFood'> }[] = [];
  
  // Look for keys or partial keys in the text
  for (const [key, val] of Object.entries(mergedDatabase)) {
    // Check if key exists as a full or partial word
    // Simple check: if normal text contains the key (using boundaries)
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    const plurRegex = new RegExp(`\\b${key}s\\b`, 'i'); // handles simple plurals like eggs, apples
    if (regex.test(normText) || plurRegex.test(normText)) {
      matchedEntries.push({ key, val });
    }
  }

  // Handle scenario when no direct keyword found but sub-key found
  if (matchedEntries.length === 0) {
    for (const [key, val] of Object.entries(mergedDatabase)) {
      if (normText.includes(key)) {
        matchedEntries.push({ key, val });
      }
    }
  }

  // If one or more foods are matched, aggregate them
  if (matchedEntries.length > 0) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalHealthScore = 0;
    const allTipsSet = new Set<string>();
    const names: string[] = [];

    matchedEntries.forEach(item => {
      totalCalories += item.val.calories;
      totalProtein += item.val.protein;
      totalCarbs += item.val.carbs;
      totalFat += item.val.fat;
      totalHealthScore += item.val.healthScore;
      item.val.tips.forEach(t => allTipsSet.add(t));
      // Capitalize first letter of matched word
      names.push(item.key.charAt(0).toUpperCase() + item.key.slice(1).replace('_', ' '));
    });

    const averageHealthScore = Math.round(totalHealthScore / matchedEntries.length);
    const resolvedFoodName = names.join(" & ");
    let finalTips = Array.from(allTipsSet);
    
    // Supplement fallback tips
    if (finalTips.length < 2) {
      finalTips.push("Log your meal daily to stick to your dietary guidelines.");
    }
    
    return {
      detectedFood: resolvedFoodName,
      calories: totalCalories,
      protein: Number(totalProtein.toFixed(1)),
      carbs: Number(totalCarbs.toFixed(1)),
      fat: Number(totalFat.toFixed(1)),
      healthScore: averageHealthScore,
      tips: finalTips.slice(0, 3)
    };
  }

  // Completely fallback when no keywords match
  // Guess based on description word length, or provide customizable custom food
  const genericInput = textInput?.trim() || "Meal Scan";
  const capitalName = genericInput.charAt(0).toUpperCase() + genericInput.slice(1);
  
  return {
    detectedFood: capitalName.length > 30 ? capitalName.slice(0, 27) + "..." : capitalName,
    calories: 250,
    protein: 10.0,
    carbs: 30.0,
    fat: 8.0,
    healthScore: 75,
    tips: [
      "Offline Estimation Mode: Estimating values based on average meal portions.",
      "Adjust the nutritional values manually if you need absolute accuracy.",
      "Great job staying consistent logging your meal while offline!"
    ]
  };
}

export interface CustomFoodCacheEntry {
  id: string;
  timestamp: number;
  imageUrl?: string;
  fileName?: string;
  description?: string;
  detectedFood: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  tips: string[];
}

export function getCustomFallbackCache(): CustomFoodCacheEntry[] {
  try {
    const data = localStorage.getItem('nutrilens_custom_fallback');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveCustomFallbackCache(cache: CustomFoodCacheEntry[]): void {
  try {
    localStorage.setItem('nutrilens_custom_fallback', JSON.stringify(cache));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

export function findCachedMeal(image?: string, description?: string, fileName?: string): CustomFoodCacheEntry | null {
  const cache = getCustomFallbackCache();
  
  // 1. First priority: Match image
  if (image) {
    const match = cache.find(item => item.imageUrl && item.imageUrl === image);
    if (match) return match;
    
    if (fileName) {
      const fnMatch = cache.find(item => item.fileName && item.fileName.toLowerCase() === fileName.toLowerCase());
      if (fnMatch) return fnMatch;
    }
  }
  
  // 2. Second priority: Match text description
  if (description && description.trim()) {
    const normDesc = description.trim().toLowerCase();
    const match = cache.find(item => 
      (item.description && item.description.trim().toLowerCase() === normDesc) || 
      item.detectedFood.trim().toLowerCase() === normDesc
    );
    if (match) return match;
  }
  
  return null;
}

export function saveMealToCustomFallback(meal: Omit<CustomFoodCacheEntry, 'id' | 'timestamp'>): void {
  const cache = getCustomFallbackCache();
  let index = -1;
  
  if (meal.imageUrl) {
    index = cache.findIndex(item => item.imageUrl === meal.imageUrl);
  }
  
  if (index === -1 && meal.fileName && meal.imageUrl) {
    index = cache.findIndex(item => item.fileName?.toLowerCase() === meal.fileName?.toLowerCase());
  }
  
  if (index === -1 && meal.description && meal.description.trim()) {
    const normDesc = meal.description.trim().toLowerCase();
    index = cache.findIndex(item => 
      (item.description && item.description.trim().toLowerCase() === normDesc) || 
      item.detectedFood.trim().toLowerCase() === normDesc
    );
  }

  const newEntry: CustomFoodCacheEntry = {
    ...meal,
    id: index !== -1 ? cache[index].id : Math.random().toString(36).substr(2, 9),
    timestamp: Date.now()
  };

  if (index !== -1) {
    cache[index] = newEntry;
  } else {
    cache.unshift(newEntry);
  }
  
  saveCustomFallbackCache(cache);
}

export function isFoodInDatabase(textInput?: string, fileName?: string): boolean {
  const normText = `${textInput || ''} ${fileName || ''}`.toLowerCase().replace(/[^a-z0-9_\s-]/g, ' ');
  
  let dynamicDatabase: Record<string, Omit<OfflineFoodInfo, 'detectedFood'>> = {};
  if (typeof window !== 'undefined') {
    try {
      const dynamicDbStr = localStorage.getItem('nutrilens_dynamic_offline_db');
      if (dynamicDbStr) {
        dynamicDatabase = JSON.parse(dynamicDbStr);
      }
    } catch (e) {
      // Ignored
    }
  }

  const mergedDatabase = { ...OFFLINE_FOOD_DATABASE, ...dynamicDatabase };

  for (const key of Object.keys(mergedDatabase)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    const plurRegex = new RegExp(`\\b${key}s\\b`, 'i');
    if (regex.test(normText) || plurRegex.test(normText)) {
      return true;
    }
  }

  for (const key of Object.keys(mergedDatabase)) {
    if (normText.includes(key)) {
      return true;
    }
  }

  return false;
}

export function saveToDynamicOfflineDatabase(foodKey: string, foodData: Omit<OfflineFoodInfo, 'detectedFood'>): void {
  if (typeof window === 'undefined') return;
  try {
    const dynamicDbStr = localStorage.getItem('nutrilens_dynamic_offline_db');
    const dynamicDatabase = dynamicDbStr ? JSON.parse(dynamicDbStr) : {};
    
    // Normalize key
    const normalizedKey = foodKey.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');
    if (!normalizedKey) return;

    dynamicDatabase[normalizedKey] = {
      calories: foodData.calories,
      protein: foodData.protein,
      carbs: foodData.carbs,
      fat: foodData.fat,
      healthScore: foodData.healthScore || 75,
      tips: foodData.tips || ["Naturally loaded nutritional selection."]
    };
    
    localStorage.setItem('nutrilens_dynamic_offline_db', JSON.stringify(dynamicDatabase));
  } catch (e) {
    console.error("Failed to write to dynamic offline database", e);
  }
}

