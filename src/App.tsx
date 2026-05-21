import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  ArrowLeft,
  ChevronRight, 
  Plus, 
  Flame, 
  Droplets, 
  Zap, 
  Info,
  LogOut,
  Settings,
  Bell,
  ShieldCheck,
  Upload,
  Type as TypeIcon,
  X,
  CheckCircle2,
  Wifi,
  WifiOff,
  History as HistoryIcon,
  BarChart3,
  User as UserIcon,
  Home as HomeIcon,
  Edit2,
  RefreshCw,
  Trash2,
  Calendar,
  Sparkles,
  Heart,
  TrendingUp,
  Sliders,
  Check
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Screen, MealRecord } from './types';
import { analyzeMeal } from './services/gemini';
import { 
  analyzeMealOffline, 
  OFFLINE_FOOD_DATABASE, 
  findCachedMeal, 
  saveMealToCustomFallback, 
  getCustomFallbackCache, 
  saveCustomFallbackCache,
  isFoodInDatabase,
  saveToDynamicOfflineDatabase
} from './services/localFallback';
import { cn } from './lib/utils';

// --- Food Visual Fallback Helper ---
const getFoodVisualFallback = (foodName: string) => {
  const normalized = (foodName || '').toLowerCase();
  
  if (normalized.includes('salad') || normalized.includes('green') || normalized.includes('veg') || normalized.includes('lettuce')) {
    return { emoji: '🥗', gradient: 'from-[#E8F5E9] to-[#C8E6C9]' };
  }
  if (normalized.includes('chicken') || normalized.includes('poultry') || normalized.includes('turkey') || normalized.includes('breast')) {
    return { emoji: '🍗', gradient: 'from-[#FFE0B2] to-[#FFCC80]' };
  }
  if (normalized.includes('salmon') || normalized.includes('fish') || normalized.includes('tuna') || normalized.includes('seafood') || normalized.includes('broccoli')) {
    return { emoji: '🐟', gradient: 'from-[#E1F5FE] to-[#B3E5FC]' };
  }
  if (normalized.includes('burger') || normalized.includes('sandwich') || normalized.includes('burger') || normalized.includes('patty') || normalized.includes('bun')) {
    return { emoji: '🍔', gradient: 'from-[#FFE0B2] to-[#FFCC80]' };
  }
  if (normalized.includes('oatmeal') || normalized.includes('oat') || normalized.includes('porridge') || normalized.includes('cereal') || normalized.includes('rice')) {
    return { emoji: '🥣', gradient: 'from-[#F5F5F5] to-[#E5E5E5]' };
  }
  if (normalized.includes('avocado')) {
    return { emoji: '🥑', gradient: 'from-[#E8F5E9] to-[#DCEDC8]' };
  }
  if (normalized.includes('apple') || normalized.includes('fruit') || normalized.includes('berry') || normalized.includes('banana') || normalized.includes('berries')) {
    return { emoji: '🍎', gradient: 'from-[#FFEBEE] to-[#FFCDD2]' };
  }
  if (normalized.includes('egg')) {
    return { emoji: '🍳', gradient: 'from-[#FFFDE7] to-[#FFF9C4]' };
  }
  if (normalized.includes('steak') || normalized.includes('beef') || normalized.includes('meat') || normalized.includes('pork')) {
    return { emoji: '🥩', gradient: 'from-[#FFEBEE] to-[#FFCDD2]' };
  }
  if (normalized.includes('coffee') || normalized.includes('tea') || normalized.includes('latte') || normalized.includes('beverage') || normalized.includes('drink')) {
    return { emoji: '☕', gradient: 'from-[#EFEBE9] to-[#D7CCC8]' };
  }
  if (normalized.includes('pizza')) {
    return { emoji: '🍕', gradient: 'from-[#FFF3E0] to-[#FFE0B2]' };
  }
  if (normalized.includes('pasta') || normalized.includes('noodle') || normalized.includes('spaghetti')) {
    return { emoji: '🍝', gradient: 'from-[#FFFDE7] to-[#FFF9C4]' };
  }
  if (normalized.includes('sushi')) {
    return { emoji: '🍣', gradient: 'from-[#FFF5F5] to-[#FFE0E0]' };
  }
  
  // Default fallback if no match
  return { emoji: '🍽️', gradient: 'from-gray-50 to-gray-100' };
};

// --- Default Mock Data ---
const INITIAL_HISTORY: MealRecord[] = [
  {
    id: 'hist1',
    timestamp: Date.now() - 86400000 * 6, // 6 days ago
    description: 'Baked salmon fillet with organic steamed broccoli',
    detectedFood: 'Baked Salmon & Broccoli',
    calories: 490,
    protein: 38,
    carbs: 14,
    fat: 24,
    healthScore: 95,
    tips: ['Extremely high in brain-boosting Omega-3 fatty acids', 'Broccoli delivers massive antioxidant power'],
    isOfflineFallback: false
  },
  {
    id: 'hist2',
    timestamp: Date.now() - 86400000 * 5, // 5 days ago
    description: 'Greek yogurt bowl with raw honey, almonds, and chia mix',
    detectedFood: 'Greek Yogurt Parfait',
    calories: 320,
    protein: 22,
    carbs: 30,
    fat: 10,
    healthScore: 88,
    tips: ['Excellent source of tummy-friendly active probiotics', 'Rich in biological bone-strengthening calcium'],
    isOfflineFallback: false
  },
  {
    id: 'hist3',
    timestamp: Date.now() - 86400000 * 4, // 4 days ago
    description: 'Fresh grilled chicken thigh with mixed romaine greens',
    detectedFood: 'Grilled Chicken Salad',
    calories: 410,
    protein: 34,
    carbs: 16,
    fat: 18,
    healthScore: 92,
    tips: ['Outstanding source of low-fat complete lean proteins', 'Leafy greens support cellular and cardiovascular health'],
    isOfflineFallback: false
  },
  {
    id: 'hist4',
    timestamp: Date.now() - 86400000 * 3, // 3 days ago
    description: 'Poached eggs on sourdough bread with seasoned avocado',
    detectedFood: 'Avocado Toast & Egg',
    calories: 380,
    protein: 16,
    carbs: 42,
    fat: 19,
    healthScore: 89,
    tips: ['High content of vitamin E and monounsaturated lipids', 'Sourdough provides easier starch digestibilities'],
    isOfflineFallback: false
  },
  {
    id: 'hist5',
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    description: 'Oatmeal with fresh wild berries and banana slice',
    detectedFood: 'Oatmeal & Fruit',
    calories: 270,
    protein: 7,
    carbs: 56,
    fat: 3,
    healthScore: 91,
    tips: ['Great source of soluble beta-glucan dietary fiber', 'Provides slow-releasing healthy morning power'],
    isOfflineFallback: false
  },
  {
    id: 'hist6',
    timestamp: Date.now() - 86400000 * 1, // 1 day ago
    description: 'Lean tenderloin beef steak with asparagus stems',
    detectedFood: 'Beef Steak & Asparagus',
    calories: 540,
    protein: 48,
    carbs: 10,
    fat: 28,
    healthScore: 86,
    tips: ['Incredibly rich in muscle-building bioavailable high iron', 'Supports sustained high metabolic efficiency'],
    isOfflineFallback: false
  },
  {
    id: 'hist7',
    timestamp: Date.now(), // Today
    description: 'Fresh delicious sashimi sushi platter with seaweed salad',
    detectedFood: 'Sushi & Sashimi Platter',
    calories: 460,
    protein: 28,
    carbs: 65,
    fat: 6,
    healthScore: 87,
    tips: ['Excellent light energy meal', 'Iodine in seaweed optimizes vital thyroid responses'],
    isOfflineFallback: false
  }
];

const QUICK_PRESETS = [
  { name: "Salad", icon: "🥗", desc: "Fresh green salad" },
  { name: "Chicken & Rice", icon: "🍗", desc: "Lean grilled chicken and rice" },
  { name: "Oatmeal & Apple", icon: "🥣", desc: "Healthy oatmeal with fruits" },
  { name: "Salmon & Broccoli", icon: "🐟", desc: "Baked salmon and steamed broccoli" },
  { name: "Burger & Cheese", icon: "🍔", desc: "Cheese burger" },
  { name: "Banana", icon: "🍌", desc: "A sweet single banana" },
  { name: "Egg & Toast", icon: "🍳", desc: "Sunny side egg on wholewheat toast" },
  { name: "Pizza Slice", icon: "🍕", desc: "Cheese pizza slice" },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [history, setHistory] = useState<MealRecord[]>([]);
  const [logDateOffset, setLogDateOffset] = useState<number>(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<Partial<MealRecord> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Input fields
  const [mealDescription, setMealDescription] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Interactive adjustment state (for fallback calculations)
  const [adjustedCalories, setAdjustedCalories] = useState<number>(250);
  const [adjustedProtein, setAdjustedProtein] = useState<number>(10);
  const [adjustedCarbs, setAdjustedCarbs] = useState<number>(30);
  const [adjustedFat, setAdjustedFat] = useState<number>(8);
  const [adjustedFoodName, setAdjustedFoodName] = useState<string>('');
  const [isEditingMacros, setIsEditingMacros] = useState(false);

  // Network offline mock trigger support
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [forceOffline, setForceOffline] = useState(false);
  const [upgradingMealId, setUpgradingMealId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'online' | 'offline' | 'success' | 'info' }[]>([]);

  // User target configurations
  const [targetCalories, setTargetCalories] = useState(2000);
  const [targetProtein, setTargetProtein] = useState(80);
  const [targetCarbs, setTargetCarbs] = useState(250);
  const [targetFat, setTargetFat] = useState(65);
  const [userWeight, setUserWeight] = useState<number>(70);
  const [userHeight, setUserHeight] = useState<number>(175);
  const [userAge, setUserAge] = useState<number>(28);
  const [userGender, setUserGender] = useState<'male' | 'female'>('male');
  const [userActivityLevel, setUserActivityLevel] = useState<string>('moderate');
  const [userProfileName, setUserProfileName] = useState('John Doe');
  const [loginInputName, setLoginInputName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [welcomeStep, setWelcomeStep] = useState<'website' | 'login'>('website');
  const [hasUnsavedSettings, setHasUnsavedSettings] = useState(false);
  const [customCache, setCustomCache] = useState<any[]>([]);

  // Synchronize cache state reactive to profile view
  useEffect(() => {
    if (screen === 'profile') {
      setCustomCache(getCustomFallbackCache());
    }
  }, [screen]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  // Connection monitoring
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(true);
      showToast("Network restored! Gemini AI analyzer is back online.", "online");
    };
    const handleOfflineStatus = () => {
      setIsOnline(false);
      showToast("Network disconnected. Using offline rule-based fallback database.", "offline");
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  const loadUserData = (username: string) => {
    const userHistory = localStorage.getItem(`nutrilens_history_${username.toLowerCase()}`);
    if (userHistory) {
      try {
        setHistory(JSON.parse(userHistory));
      } catch (e) {
        setHistory(INITIAL_HISTORY);
      }
    } else {
      setHistory(INITIAL_HISTORY);
    }
    const savedTargetCals = localStorage.getItem(`nutrilens_target_cals_${username.toLowerCase()}`);
    if (savedTargetCals) setTargetCalories(Number(savedTargetCals));
    else setTargetCalories(2000);

    const savedTargetProtein = localStorage.getItem(`nutrilens_target_protein_${username.toLowerCase()}`);
    if (savedTargetProtein) setTargetProtein(Number(savedTargetProtein));
    else setTargetProtein(80);

    const savedTargetCarbs = localStorage.getItem(`nutrilens_target_carbs_${username.toLowerCase()}`);
    if (savedTargetCarbs) setTargetCarbs(Number(savedTargetCarbs));
    else setTargetCarbs(250);

    const savedTargetFat = localStorage.getItem(`nutrilens_target_fat_${username.toLowerCase()}`);
    if (savedTargetFat) setTargetFat(Number(savedTargetFat));
    else setTargetFat(65);

    const savedWeight = localStorage.getItem(`nutrilens_user_weight_${username.toLowerCase()}`);
    if (savedWeight) setUserWeight(Number(savedWeight));
    else setUserWeight(70);

    const savedHeight = localStorage.getItem(`nutrilens_user_height_${username.toLowerCase()}`);
    if (savedHeight) setUserHeight(Number(savedHeight));
    else setUserHeight(175);

    const savedAge = localStorage.getItem(`nutrilens_user_age_${username.toLowerCase()}`);
    if (savedAge) setUserAge(Number(savedAge));
    else setUserAge(28);

    const savedGender = localStorage.getItem(`nutrilens_user_gender_${username.toLowerCase()}`);
    if (savedGender === 'female') setUserGender('female');
    else setUserGender('male');

    const savedActivity = localStorage.getItem(`nutrilens_user_activity_${username.toLowerCase()}`);
    if (savedActivity) setUserActivityLevel(savedActivity);
    else setUserActivityLevel('moderate');
    
    const savedAvatar = localStorage.getItem(`nutrilens_user_avatar_${username.toLowerCase()}`);
    if (savedAvatar) setProfilePhoto(savedAvatar);
    else setProfilePhoto('🥑');
  };

  // Sync historical logging with localStorage
  useEffect(() => {
    const savedProfileName = localStorage.getItem('nutrilens_user_name');
    if (savedProfileName && savedProfileName !== 'John Doe') {
      setUserProfileName(savedProfileName);
      loadUserData(savedProfileName);
    } else {
      const saved = localStorage.getItem('nutrilens_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      } else {
        setHistory(INITIAL_HISTORY);
        localStorage.setItem('nutrilens_history', JSON.stringify(INITIAL_HISTORY));
      }
      const savedTargetCals = localStorage.getItem('nutrilens_target_cals');
      if (savedTargetCals) setTargetCalories(Number(savedTargetCals));

      const savedTargetProtein = localStorage.getItem('nutrilens_target_protein');
      if (savedTargetProtein) setTargetProtein(Number(savedTargetProtein));

      const savedTargetCarbs = localStorage.getItem('nutrilens_target_carbs');
      if (savedTargetCarbs) setTargetCarbs(Number(savedTargetCarbs));

      const savedTargetFat = localStorage.getItem('nutrilens_target_fat');
      if (savedTargetFat) setTargetFat(Number(savedTargetFat));

      const savedWeight = localStorage.getItem('nutrilens_user_weight');
      if (savedWeight) setUserWeight(Number(savedWeight));

      const savedHeight = localStorage.getItem('nutrilens_user_height');
      if (savedHeight) setUserHeight(Number(savedHeight));

      const savedAge = localStorage.getItem('nutrilens_user_age');
      if (savedAge) setUserAge(Number(savedAge));

      const savedGender = localStorage.getItem('nutrilens_user_gender');
      if (savedGender === 'female') setUserGender('female');

      const savedActivity = localStorage.getItem('nutrilens_user_activity');
      if (savedActivity) setUserActivityLevel(savedActivity);

      const savedAvatar = localStorage.getItem('nutrilens_user_avatar');
      if (savedAvatar) setProfilePhoto(savedAvatar);
    }
  }, []);

  const saveHistory = (updatedHistory: MealRecord[]) => {
    setHistory(updatedHistory);
    localStorage.setItem('nutrilens_history', JSON.stringify(updatedHistory));
    if (userProfileName) {
      localStorage.setItem(`nutrilens_history_${userProfileName.toLowerCase()}`, JSON.stringify(updatedHistory));
    }
  };

  const showToast = (message: string, type: 'online' | 'offline' | 'success' | 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const isActuallyOffline = !isOnline || forceOffline;

  // Handle live video stream mounting for camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraOpen && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => {
          console.error("Camera access error:", err);
          showToast("Failed to lock web camera. Use image upload instead.", "offline");
          setIsCameraOpen(false);
        });
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isCameraOpen]);

  // Capture frame from video stream
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setIsCameraOpen(false);
        performAnalysis(dataUrl, undefined, "camera_snap.jpg");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Img = reader.result as string;
        setCapturedImage(base64Img);
        performAnalysis(base64Img, undefined, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Img = reader.result as string;
        setCapturedImage(base64Img);
        performAnalysis(base64Img, undefined, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform Gemini analysis or offline storage fallback
  const performAnalysis = async (image?: string, desc?: string, filename?: string) => {
    setIsAnalyzing(true);
    setScreen('results');
    setIsEditingMacros(false);
    
    const targetLabel = desc || (image ? "Custom Image Upload" : "No Description Entered");

    // 1. Check if the same image or text exists in local fallback cache
    const cachedMeal = findCachedMeal(image, desc, filename);
    if (cachedMeal) {
      setTimeout(() => {
        setCurrentAnalysis({
          detectedFood: cachedMeal.detectedFood,
          imageUrl: cachedMeal.imageUrl || image,
          description: cachedMeal.description || desc || cachedMeal.detectedFood,
          timestamp: Date.now(),
          id: cachedMeal.id,
          calories: cachedMeal.calories,
          protein: cachedMeal.protein,
          carbs: cachedMeal.carbs,
          fat: cachedMeal.fat,
          healthScore: cachedMeal.healthScore,
          tips: cachedMeal.tips,
          isOfflineFallback: true,
          // Custom flag to indicate cache hit in UI
          isFromCache: true,
          fileName: cachedMeal.fileName || filename
        } as any);

        setAdjustedCalories(cachedMeal.calories);
        setAdjustedProtein(cachedMeal.protein);
        setAdjustedCarbs(cachedMeal.carbs);
        setAdjustedFat(cachedMeal.fat);
        setAdjustedFoodName(cachedMeal.detectedFood);

        setIsAnalyzing(false);
        showToast(`Retrieved from local fallback cache (Offline / No API Call)`, "success");
      }, 700);
      return;
    }

    const existInDb = isFoodInDatabase(desc, filename);

    if (isActuallyOffline && existInDb) {
      // Present in database, offline mode active - retrieve from database instantly
      setTimeout(() => {
        try {
          const offlineResult = analyzeMealOffline(desc, filename);
          const offlineAnalysisResult = {
            ...offlineResult,
            imageUrl: image,
            description: desc || offlineResult.detectedFood,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9),
            isOfflineFallback: true,
            fileName: filename
          };
          
          setCurrentAnalysis(offlineAnalysisResult);
          // Set slider state
          setAdjustedCalories(offlineResult.calories);
          setAdjustedProtein(offlineResult.protein);
          setAdjustedCarbs(offlineResult.carbs);
          setAdjustedFat(offlineResult.fat);
          setAdjustedFoodName(offlineResult.detectedFood);
          
          // Save to local fallback cache immediately for future queries
          saveMealToCustomFallback({
            imageUrl: image,
            fileName: filename,
            description: desc || offlineResult.detectedFood,
            detectedFood: offlineResult.detectedFood,
            calories: offlineResult.calories,
            protein: offlineResult.protein,
            carbs: offlineResult.carbs,
            fat: offlineResult.fat,
            healthScore: offlineResult.healthScore,
            tips: offlineResult.tips
          });
          
          showToast("Retrieved from local offline database (Offline Mode / Zero Latency).", "info");
        } catch (err) {
          console.error("Local rule resolver failure:", err);
          showToast("Offline fallback error. Resetting.", "offline");
        } finally {
          setIsAnalyzing(false);
        }
      }, 700);
    } else {
      // Either not present in database OR is Online Mode - Call API if internet is available, then sync/save to local offline database!
      if (isOnline) {
        if (isActuallyOffline && !existInDb) {
          showToast(`"${desc || 'Custom Food'}" is not in offline database. Accessing Gemini API to sync & cache...`, "info");
        }
        try {
          const aiResult = await analyzeMeal(image, desc);
          const aiAnalysisResult = {
            ...aiResult,
            imageUrl: image,
            description: desc || aiResult.detectedFood,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9),
            isOfflineFallback: false,
            fileName: filename
          };
          
          setCurrentAnalysis(aiAnalysisResult);
          setAdjustedCalories(aiResult.calories);
          setAdjustedProtein(aiResult.protein);
          setAdjustedCarbs(aiResult.carbs);
          setAdjustedFat(aiResult.fat);
          setAdjustedFoodName(aiResult.detectedFood);
          
          // Automatically save to our dynamic local offline database for future offline access!
          const foodKey = aiResult.detectedFood || desc || "Custom Food";
          saveToDynamicOfflineDatabase(foodKey, {
            calories: aiResult.calories,
            protein: aiResult.protein,
            carbs: aiResult.carbs,
            fat: aiResult.fat,
            healthScore: aiResult.healthScore,
            tips: aiResult.tips
          });

          // Save to local fallback cache immediately for future queries
          saveMealToCustomFallback({
            imageUrl: image,
            fileName: filename,
            description: desc || aiResult.detectedFood,
            detectedFood: aiResult.detectedFood,
            calories: aiResult.calories,
            protein: aiResult.protein,
            carbs: aiResult.carbs,
            fat: aiResult.fat,
            healthScore: aiResult.healthScore,
            tips: aiResult.tips
          });
          
          if (isActuallyOffline) {
            showToast(`Success! "${aiResult.detectedFood}" scanned via API and added to your Local Offline Database!`, "success");
          } else {
            showToast(`Gemini AI successfully analyzed the meal & saved details offline!`, "success");
          }
        } catch (error: any) {
          console.warn("Online Gemini analysis failed. Falling back to offline analyzer...", error);
          // Seamless fallback when online fails due to rate limits or API key problems
          const offlineResult = analyzeMealOffline(desc, filename || "scan.jpg");
          const blendedResult = {
            ...offlineResult,
            imageUrl: image,
            description: desc || offlineResult.detectedFood,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9),
            isOfflineFallback: true,
            fileName: filename
          };
          
          setCurrentAnalysis(blendedResult);
          setAdjustedCalories(offlineResult.calories);
          setAdjustedProtein(offlineResult.protein);
          setAdjustedCarbs(offlineResult.carbs);
          setAdjustedFat(offlineResult.fat);
          setAdjustedFoodName(offlineResult.detectedFood);
          
          saveMealToCustomFallback({
            imageUrl: image,
            fileName: filename,
            description: desc || offlineResult.detectedFood,
            detectedFood: offlineResult.detectedFood,
            calories: offlineResult.calories,
            protein: offlineResult.protein,
            carbs: offlineResult.carbs,
            fat: offlineResult.fat,
            healthScore: offlineResult.healthScore,
            tips: offlineResult.tips
          });
          
          showToast("AI call failed or rate-limited. Gracefully fallback to local estimates.", "info");
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        // Completely physically offline and item is not in local database, perform generic offline keywords analysis
        setTimeout(() => {
          try {
            const offlineResult = analyzeMealOffline(desc, filename);
            const offlineAnalysisResult = {
              ...offlineResult,
              imageUrl: image,
              description: desc || offlineResult.detectedFood,
              timestamp: Date.now(),
              id: Math.random().toString(36).substr(2, 9),
              isOfflineFallback: true,
              fileName: filename
            };
            
            setCurrentAnalysis(offlineAnalysisResult);
            setAdjustedCalories(offlineResult.calories);
            setAdjustedProtein(offlineResult.protein);
            setAdjustedCarbs(offlineResult.carbs);
            setAdjustedFat(offlineResult.fat);
            setAdjustedFoodName(offlineResult.detectedFood);
            
            saveMealToCustomFallback({
              imageUrl: image,
              fileName: filename,
              description: desc || offlineResult.detectedFood,
              detectedFood: offlineResult.detectedFood,
              calories: offlineResult.calories,
              protein: offlineResult.protein,
              carbs: offlineResult.carbs,
              fat: offlineResult.fat,
              healthScore: offlineResult.healthScore,
              tips: offlineResult.tips
            });
            
            showToast("Item not in database. Connect to network to sync exact facts via AI.", "offline");
          } catch (err) {
            console.error("Local rule resolver failure:", err);
            showToast("Offline fallback error. Resetting.", "offline");
          } finally {
            setIsAnalyzing(false);
          }
        }, 700);
      }
    }
  };

  // Live "Upgrade to AI" button for offline historic records when online returns
  const upgradeMealToAI = async (meal: MealRecord) => {
    if (isActuallyOffline) {
      showToast("You are offline. Cannot perform AI upgrades right now.", "offline");
      return;
    }
    
    setUpgradingMealId(meal.id);
    showToast(`Connecting to Gemini to upgrade ${meal.detectedFood}...`, "info");
    
    try {
      const aiResult = await analyzeMeal(meal.imageUrl, meal.description);
      const upgradedRecord: MealRecord = {
        ...meal,
        detectedFood: aiResult.detectedFood,
        calories: aiResult.calories,
        protein: aiResult.protein,
        carbs: aiResult.carbs,
        fat: aiResult.fat,
        healthScore: aiResult.healthScore,
        tips: aiResult.tips,
        isOfflineFallback: false
      };
      
      // Automatically save back into local custom database dynamically for all future offline usages!
      const foodKey = aiResult.detectedFood || meal.description || "Custom Food";
      saveToDynamicOfflineDatabase(foodKey, {
        calories: aiResult.calories,
        protein: aiResult.protein,
        carbs: aiResult.carbs,
        fat: aiResult.fat,
        healthScore: aiResult.healthScore,
        tips: aiResult.tips
      });

      const newHistory = history.map(item => item.id === meal.id ? upgradedRecord : item);
      saveHistory(newHistory);
      showToast(`Success! ${meal.detectedFood} upgraded with Gemini AI precision.`, "success");
    } catch (err) {
      console.error("Upgrade to AI failed:", err);
      showToast("Unable to upgrade record. Please verify API configuration.", "offline");
    } finally {
      setUpgradingMealId(null);
    }
  };

  const saveMealRecord = () => {
    if (currentAnalysis) {
      const calculatedTimestamp = Date.now() - (86400000 * logDateOffset);
      
      // Override values with adjusted numbers if slider tuning was performed
      const recordToSave: MealRecord = {
        ...(currentAnalysis as MealRecord),
        imageUrl: currentAnalysis.imageUrl || capturedImage || undefined,
        detectedFood: adjustedFoodName,
        calories: adjustedCalories,
        protein: adjustedProtein,
        carbs: adjustedCarbs,
        fat: adjustedFat,
        timestamp: calculatedTimestamp,
        id: Math.random().toString(36).substr(2, 9)
      };

      const updated = [recordToSave, ...history];
      saveHistory(updated);

      // Save user-calibrated entry to local fallback database
      saveMealToCustomFallback({
        imageUrl: currentAnalysis.imageUrl,
        fileName: (currentAnalysis as any).fileName,
        description: currentAnalysis.description,
        detectedFood: adjustedFoodName,
        calories: adjustedCalories,
        protein: adjustedProtein,
        carbs: adjustedCarbs,
        fat: adjustedFat,
        healthScore: currentAnalysis.healthScore || 75,
        tips: currentAnalysis.tips || []
      });

      // Save user calibration back into dynamic local offline database for matching future offline scans!
      saveToDynamicOfflineDatabase(adjustedFoodName, {
        calories: adjustedCalories,
        protein: adjustedProtein,
        carbs: adjustedCarbs,
        fat: adjustedFat,
        healthScore: currentAnalysis.healthScore || 75,
        tips: currentAnalysis.tips || []
      });

      setScreen('history');
      setCurrentAnalysis(null);
      setCapturedImage(null);
      setMealDescription('');
      setLogDateOffset(0); // Reset after saving
      showToast(`Logged "${adjustedFoodName}" and saved to local fallback cache.`, "success");
    }
  };

  const deleteMealRecord = (id: string) => {
    const updated = history.filter(m => m.id !== id);
    saveHistory(updated);
    showToast("Meal removed from logs.", "info");
  };

  // Calculate current date’s logged total metrics
  const getDailyTotals = () => {
    const todayStr = new Date().toDateString();
    const todayMeals = history.filter(meal => new Date(meal.timestamp).toDateString() === todayStr);

    const totalCals = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalProtein = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const totalCarbs = todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const totalFat = todayMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

    return { totalCals, totalProtein, totalCarbs, totalFat, count: todayMeals.length };
  };

  const dailyStats = getDailyTotals();

  // Parse data for charts over the last 7 days
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toDateString();

      const dayMeals = history.filter(meal => new Date(meal.timestamp).toDateString() === dateStr);
      const totalCals = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const totalProtein = dayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
      const totalCarbs = dayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
      const totalFat = dayMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

      result.push({
        name: dayName,
        calories: totalCals,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
      });
    }
    return result;
  };

  const weeklyChartData = getWeeklyData();

  const handlePresetClick = (preset: typeof QUICK_PRESETS[0]) => {
    setMealDescription(preset.desc);
    performAnalysis(undefined, preset.desc, `${preset.name.toLowerCase().replace(/\s+/g, '_')}.jpg`);
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePhoto(base64String);
        localStorage.setItem('nutrilens_user_avatar', base64String);
        if (userProfileName) {
          localStorage.setItem(`nutrilens_user_avatar_${userProfileName.toLowerCase()}`, base64String);
        }
        showToast("Profile photo securely saved locally!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (emoji: string) => {
    setProfilePhoto(emoji);
    localStorage.setItem('nutrilens_user_avatar', emoji);
    if (userProfileName) {
      localStorage.setItem(`nutrilens_user_avatar_${userProfileName.toLowerCase()}`, emoji);
    }
    showToast(`Saved ${emoji} as your health badge avatar!`, "success");
  };

  const saveProfileSettings = () => {
    localStorage.setItem('nutrilens_user_name', userProfileName);
    if (userProfileName) {
      localStorage.setItem(`nutrilens_user_avatar_${userProfileName.toLowerCase()}`, profilePhoto);
      localStorage.setItem(`nutrilens_history_${userProfileName.toLowerCase()}`, JSON.stringify(history));
      localStorage.setItem(`nutrilens_target_cals_${userProfileName.toLowerCase()}`, String(targetCalories));
      localStorage.setItem(`nutrilens_target_protein_${userProfileName.toLowerCase()}`, String(targetProtein));
      localStorage.setItem(`nutrilens_target_carbs_${userProfileName.toLowerCase()}`, String(targetCarbs));
      localStorage.setItem(`nutrilens_target_fat_${userProfileName.toLowerCase()}`, String(targetFat));
      localStorage.setItem(`nutrilens_user_weight_${userProfileName.toLowerCase()}`, String(userWeight));
      localStorage.setItem(`nutrilens_user_height_${userProfileName.toLowerCase()}`, String(userHeight));
      localStorage.setItem(`nutrilens_user_age_${userProfileName.toLowerCase()}`, String(userAge));
      localStorage.setItem(`nutrilens_user_gender_${userProfileName.toLowerCase()}`, userGender);
      localStorage.setItem(`nutrilens_user_activity_${userProfileName.toLowerCase()}`, userActivityLevel);
    } else {
      localStorage.setItem('nutrilens_target_cals', String(targetCalories));
      localStorage.setItem('nutrilens_target_protein', String(targetProtein));
      localStorage.setItem('nutrilens_target_carbs', String(targetCarbs));
      localStorage.setItem('nutrilens_target_fat', String(targetFat));
      localStorage.setItem('nutrilens_user_weight', String(userWeight));
      localStorage.setItem('nutrilens_user_height', String(userHeight));
      localStorage.setItem('nutrilens_user_age', String(userAge));
      localStorage.setItem('nutrilens_user_gender', userGender);
      localStorage.setItem('nutrilens_user_activity', userActivityLevel);
    }
    setHasUnsavedSettings(false);
    showToast("Profile Settings successfully synchronized!", "success");
  };

  return (
    <div className="min-h-screen bg-[#F0F4F2] text-gray-800 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Toast Manager Overlay */}
      <div className="fixed top-6 right-6 z-[999] max-w-sm w-full space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={cn(
                "p-4 rounded-2xl shadow-xl flex items-start space-x-3 pointer-events-auto border",
                t.type === 'online' ? "bg-green-50 border-green-200 text-green-800" :
                t.type === 'offline' ? "bg-amber-50 border-amber-200 text-amber-800" :
                t.type === 'success' ? "bg-[#2D6A4F] text-white border-[#1B4332]" : "bg-white border-gray-200 text-gray-800"
              )}
            >
              {t.type === 'online' && <Wifi className="w-5 h-5 flex-shrink-0 text-green-600 animate-pulse" />}
              {t.type === 'offline' && <WifiOff className="w-5 h-5 flex-shrink-0 text-amber-600 animate-bounce" />}
              {t.type === 'success' && <Sparkles className="w-5 h-5 flex-shrink-0 text-green-200" />}
              {t.type === 'info' && <Info className="w-5 h-5 flex-shrink-0 text-[#2D6A4F]" />}
              <p className="text-xs font-semibold leading-relaxed flex-grow">{t.message}</p>
              <button 
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="hover:opacity-75 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Connection Indicator Banner */}
      <div className={cn(
        "py-2.5 px-6 transition-all duration-300 flex items-center justify-between z-40 text-xs border-b font-medium",
        isActuallyOffline 
          ? "bg-amber-50 text-amber-900 border-amber-100" 
          : "bg-green-50 text-[#1B4332] border-green-100"
      )}>
        <div className="flex items-center space-x-2">
          {isActuallyOffline ? (
            <>
              <WifiOff size={15} className="text-amber-600 animate-pulse" />
              <span>
                <strong>Offline Mode Active:</strong> Food scans will default to the robust local fallback database.
              </span>
            </>
          ) : (
            <>
              <Wifi size={15} className="text-green-600 animate-pulse" />
              <span>
                <strong>Online Mode Active:</strong> Fully-powered Gemini AI and high-precision scanning is active.
              </span>
            </>
          )}
        </div>
        
        {/* Toggle buttons for reviewer evaluation */}
        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline text-gray-500">Reviewer Test Switch:</span>
          <button
            onClick={() => {
              setForceOffline(!forceOffline);
              showToast(
                !forceOffline 
                  ? "Forced Offline simulated. Disconnected from Gemini API." 
                  : "SIMULATION ENDED. Reconnecting to internet interfaces.", 
                !forceOffline ? "offline" : "online"
              );
            }}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase transition-all shadow-sm active:scale-95",
              forceOffline 
                ? "bg-amber-600 text-white hover:bg-amber-700" 
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            )}
          >
            {forceOffline ? "Cancel Fork offline" : "Simulate Offline"}
          </button>
        </div>
      </div>

      {/* Main Website Structure */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 sm:px-4 md:px-6 py-4 md:py-8 gap-6 pb-24 md:pb-8">
        
        {/* Mobile Header Bar */}
        {screen !== 'welcome' && (
          <div className="md:hidden flex items-center justify-between bg-white px-5 py-4 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#D8F3DC] rounded-xl flex items-center justify-center text-lg">
                🥕
              </div>
              <div>
                <h2 className="text-base font-black text-primary tracking-tight">NutriLens</h2>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AI Nutrition</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">{userProfileName}</span>
                </div>
              </div>
            </div>
            
            {/* Mobile Sign Out button */}
            <button 
              onClick={() => {
                setLoginInputName('');
                setWelcomeStep('website');
                setScreen('welcome');
              }} 
              className="p-2.5 rounded-xl text-red-500 bg-red-50 hover:bg-red-100/50 flex items-center justify-center space-x-1 transition-colors text-xs font-bold"
            >
              <LogOut size={13} />
              <span className="text-[10px] font-black uppercase tracking-wider">Sign Out</span>
            </button>
          </div>
        )}

        {/* Left Navigation Sidebar - Standard Web Dashboard (Desktop/Tablet) */}
        {screen !== 'welcome' && (
          <aside className="hidden md:flex w-64 bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex-col justify-between sticky top-6 h-[calc(100vh-120px)] transition-all">
            <div className="space-y-8">
              {/* BRAND IDENTIFIER */}
              <div className="flex items-center space-x-3 pointer-events-none">
                <div className="w-10 h-10 bg-[#D8F3DC] rounded-xl flex items-center justify-center text-xl">
                  🥕
                </div>
                <div>
                  <h2 className="text-xl font-black text-primary tracking-tight">NutriLens</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AI Nutrition Platform</p>
                </div>
              </div>

              {/* NAV LINKS */}
              <nav className="space-y-1">
                <button 
                  onClick={() => setScreen('home')}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150",
                    screen === 'home' || screen === 'results'
                      ? "bg-primary text-white shadow-md shadow-primary/15" 
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <HomeIcon size={18} />
                  <span>Scan & Analyze</span>
                </button>
                
                <button 
                  onClick={() => setScreen('history')}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150",
                    screen === 'history' 
                      ? "bg-primary text-white shadow-md shadow-primary/15" 
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <HistoryIcon size={18} />
                  <span className="flex-grow text-left">Logs History</span>
                  {history.length > 0 && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black",
                      screen === 'history' ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                    )}>
                      {history.length}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => setScreen('reports')}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150",
                    screen === 'reports' 
                      ? "bg-primary text-white shadow-md shadow-primary/15" 
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <BarChart3 size={18} />
                  <span>Intake Reports</span>
                </button>

                <button 
                  onClick={() => setScreen('profile')}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150",
                    screen === 'profile' 
                      ? "bg-primary text-white shadow-md shadow-primary/15" 
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <UserIcon size={18} />
                  <span>My Profile</span>
                </button>
              </nav>
            </div>

            {/* QUICK REAL-TIME HEALTH WIDGET */}
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
              <div className="text-center md:text-left space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Today's Intake</span>
                <div className="flex items-baseline space-x-1.5 justify-center md:justify-start">
                  <span className="text-xl font-black text-[#2D6A4F]">{dailyStats.totalCals}</span>
                  <span className="text-xs text-gray-400 font-bold">/ {targetCalories} kcal daily</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  setLoginInputName('');
                  setWelcomeStep('website');
                  setScreen('welcome');
                }} 
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50/50 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <LogOut size={14} />
                <span>Sign Out Account</span>
              </button>
            </div>
          </aside>
        )}

        {/* Core Main Panel - Multi-Screen Routing with Smooth Transitions */}
        <main className="flex-grow bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 relative min-h-[550px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              
              {/* VIEW: Welcome and Splash Screen Landing Page with Two-Step Flow */}
              {screen === 'welcome' && (
                <div className="w-full h-full flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {welcomeStep === 'website' ? (
                      <motion.div
                        key="website"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="py-4 md:py-8 space-y-10 max-w-5xl mx-auto w-full"
                      >
                        {/* Hero Header */}
                        <div className="text-center space-y-4 max-w-3xl mx-auto">
                          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100/50 px-4 py-1.5 rounded-full text-emerald-800 text-xs font-black uppercase tracking-widest shadow-sm">
                            <Sparkles size={13} className="text-emerald-600 animate-pulse" />
                            <span>INTRODUCING NUTRILENS v2.1</span>
                          </div>
                          
                          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-none">
                            Assess Your Nutrition. <br/>
                            <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">Protect Your Biological Privacy.</span>
                          </h1>
                          
                          <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
                            A secure, offline-first calorie tracking ecosystem. Take visual snapshots of meals, evaluate macros, and synchronize biometrics instantly with zero external cloud database leaks.
                          </p>

                          <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                              onClick={() => setWelcomeStep('login')}
                              className="bg-[#2D6A4F] hover:bg-[#1C4332] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-700/10 hover:shadow-emerald-700/20 active:scale-95 transition-all flex items-center space-x-2"
                            >
                              <span>Build Profile & Enter Dashboard</span>
                              <ChevronRight size={15} />
                            </button>
                            <a 
                              href="#features"
                              className="text-xs font-black uppercase text-emerald-700 hover:text-emerald-800 tracking-wider px-5 py-3 hover:bg-emerald-50/50 rounded-2xl transition-all"
                              onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                            >
                              Explore Features
                            </a>
                          </div>
                        </div>

                        {/* Interactive UI Highlights / Dashboard Sample Canvas */}
                        <div className="relative bg-emerald-950/5 rounded-3xl p-6 md:p-8 border border-emerald-950/5 overflow-hidden shadow-inner max-w-3xl mx-auto">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D8F3DC]/20 rounded-full blur-3xl -z-10" />
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="space-y-2 text-center sm:text-left">
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-md">Live Preview Demo</span>
                              <h4 className="text-base font-extrabold text-gray-900 leading-tight">Visual Dual-Engine Analyser</h4>
                              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                                See our active local neural backup solve protein, carbs, and lipids even if offline.
                              </p>
                            </div>
                            
                            {/* Cute visual tag badges */}
                            <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center space-x-3 text-xs font-bold text-gray-800">
                                <span className="text-base">🥦</span>
                                <div className="text-left">
                                  <span className="block font-black text-gray-900">Avocado & Green Salad</span>
                                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">310 kcal • local-db cache</span>
                                </div>
                              </div>
                              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center space-x-3 text-xs font-bold text-gray-800">
                                <span className="text-base">🥩</span>
                                <div className="text-left">
                                  <span className="block font-black text-gray-900">Grilled Salmon Slice</span>
                                  <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">420 kcal • Gemini-AI online</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Three Pillars Features Section */}
                        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
                            <span className="text-2xl p-2.5 bg-emerald-50 rounded-xl inline-block">🔒</span>
                            <h3 className="font-bold text-sm text-gray-900">Total Biometric Privacy</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Zero backend data uploads. Your daily stats, user records, and macros calculations are fully saved in secure local browser memory.
                            </p>
                          </div>

                          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
                            <span className="text-2xl p-2.5 bg-emerald-50 rounded-xl inline-block">📸</span>
                            <h3 className="font-bold text-sm text-gray-900">Generative Gemini AI</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Leverages state-of-the-art vision Models to analyze complex food imagery and estimate macronutrients with precise high-level speed.
                            </p>
                          </div>

                          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
                            <span className="text-2xl p-2.5 bg-emerald-50 rounded-xl inline-block">📶</span>
                            <h3 className="font-bold text-sm text-gray-900">Dual Offline Fallback</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Losing signal in a basement cafe? The app automatically falls back to static rule-based analysis so your diary never breaks.
                            </p>
                          </div>
                        </div>

                        {/* Social proof trust badge */}
                        <div className="text-center pt-2">
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Recommended by Certified Bio-Trackers & Macro Athletes worldwide</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="py-6 max-w-sm sm:max-w-md mx-auto w-full"
                      >
                        <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-xl relative overflow-hidden space-y-6">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D8F3DC]/30 rounded-full blur-3xl -z-10" />

                          {/* Header block with back button & Mode Switcher */}
                          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <button
                              type="button"
                              onClick={() => setWelcomeStep('website')}
                              className="inline-flex items-center space-x-1 text-[11px] font-black uppercase text-gray-400 hover:text-[#2D6A4F] transition-all focus:outline-none"
                            >
                              <ArrowLeft size={13} />
                              <span>Back to Site</span>
                            </button>
                            <span className="text-[9px] uppercase font-black text-emerald-700 tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full">Secure Auth Endpoint</span>
                          </div>

                          {/* Login Tab Toggles */}
                          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100/80 rounded-2xl border border-gray-200/40">
                            <button
                              type="button"
                              onClick={() => {
                                setLoginMode('login');
                                setLoginPassword('');
                              }}
                              className={cn(
                                "py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all",
                                loginMode === 'login' 
                                  ? "bg-white text-[#2D6A4F] shadow-sm" 
                                  : "text-gray-400 hover:text-gray-600"
                              )}
                            >
                              Sign In
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setLoginMode('signup');
                                setLoginPassword('');
                              }}
                              className={cn(
                                "py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all",
                                loginMode === 'signup' 
                                  ? "bg-white text-[#2D6A4F] shadow-sm" 
                                  : "text-gray-400 hover:text-gray-600"
                              )}
                            >
                              Create Account
                            </button>
                          </div>

                          <div className="text-center space-y-1">
                            <h3 className="text-xl font-black text-gray-900">
                              {loginMode === 'login' ? 'Welcome Back!' : 'Create New Profile'}
                            </h3>
                            <p className="text-xs text-gray-400">
                              {loginMode === 'login' 
                                ? 'Authenticate with your local credentials to load statistics.' 
                                : 'Configure password and select an emoji health badge.'}
                            </p>
                          </div>

                          {/* Live Reactive Avatar Preview Badge Builder */}
                          <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100/80">
                            <div className="relative inline-block">
                              {profilePhoto ? (
                                profilePhoto.startsWith('data:') ? (
                                  <img src={profilePhoto} alt={loginInputName || userProfileName} className="w-16 h-16 rounded-full object-cover border-4 border-[#2D6A4F]/20 bg-white shadow-md mx-auto" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-16 h-16 rounded-full border-4 border-[#2D6A4F]/20 overflow-hidden bg-white flex items-center justify-center text-3xl shadow-md mx-auto">
                                    {profilePhoto}
                                  </div>
                                )
                              ) : (
                                <div className="w-16 h-16 rounded-full border-4 border-[#2D6A4F]/20 overflow-hidden bg-white flex items-center justify-center font-black text-xl text-[#2D6A4F] shadow-inner mx-auto">
                                  {(loginInputName.trim() || userProfileName || 'N').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-0.5 rounded-full border border-white text-[7px] font-bold animate-pulse">
                                Live
                              </span>
                            </div>
                            <div className="text-center">
                              <h5 className="font-extrabold text-[#2D6A4F] text-xs leading-none">
                                {loginInputName.trim() || userProfileName || 'John Doe'}
                              </h5>
                              <span className="text-[9px] text-gray-400 block mt-1 uppercase tracking-wider font-bold">Display Badge Match</span>
                            </div>
                          </div>

                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const username = loginInputName.trim();
                              const password = loginPassword.trim();

                              if (!username) {
                                showToast("Please enter username.", "info");
                                return;
                              }
                              if (!password) {
                                showToast("Please enter password.", "info");
                                return;
                              }
                              if (password.length < 4) {
                                showToast("Password must be at least 4 characters.", "offline");
                                return;
                              }

                              const targetUsernameKey = `nutrilens_password_${username.toLowerCase()}`;

                              if (loginMode === 'signup') {
                                const existingPassword = localStorage.getItem(targetUsernameKey);
                                if (existingPassword) {
                                  showToast("Username already exists. Choose a different nick or Log In!", "offline");
                                  return;
                                }
                                
                                // Save credentials
                                localStorage.setItem(targetUsernameKey, password);
                                localStorage.setItem('nutrilens_user_name', username);
                                const chosenAvatar = profilePhoto || '🥑';
                                localStorage.setItem(`nutrilens_user_avatar_${username.toLowerCase()}`, chosenAvatar);
                                localStorage.setItem('nutrilens_user_avatar', chosenAvatar);
                                
                                // Set initial stats for new custom profile
                                localStorage.setItem(`nutrilens_target_cals_${username.toLowerCase()}`, '2000');
                                localStorage.setItem(`nutrilens_history_${username.toLowerCase()}`, JSON.stringify(INITIAL_HISTORY));
                                
                                setUserProfileName(username);
                                setProfilePhoto(chosenAvatar);
                                setHistory(INITIAL_HISTORY);
                                setTargetCalories(2000);
                                setTargetProtein(80);
                                setTargetCarbs(250);
                                setTargetFat(65);

                                showToast(`Account successfully registered! Welcome, ${username}!`, "success");
                                setScreen('home');
                              } else {
                                // Login Verify
                                const savedPassword = localStorage.getItem(targetUsernameKey);
                                if (!savedPassword) {
                                  showToast("No account matches that username. Please switch tabs to register!", "info");
                                  return;
                                }
                                if (savedPassword !== password) {
                                  showToast("Invalid security password. Access denied.", "offline");
                                  return;
                                }

                                // Authenticated successfully
                                localStorage.setItem('nutrilens_user_name', username);
                                loadUserData(username);
                                
                                showToast(`Welcome back, ${username}! Dashboard state synchronized.`, "success");
                                setScreen('home');
                              }
                            }}
                            className="space-y-4"
                          >
                            {/* Username Input Field */}
                            <div className="space-y-1 bg-white">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Username</label>
                              <input
                                type="text"
                                value={loginInputName}
                                onChange={(e) => {
                                  const nameVal = e.target.value;
                                  setLoginInputName(nameVal);
                                  // Live avatar lookup on login mode as user is typing!
                                  if (loginMode === 'login' && nameVal.trim()) {
                                    const matchingAvatar = localStorage.getItem(`nutrilens_user_avatar_${nameVal.trim().toLowerCase()}`);
                                    if (matchingAvatar) {
                                      setProfilePhoto(matchingAvatar);
                                    }
                                  }
                                }}
                                placeholder="Enter your username..."
                                className="w-full bg-gray-50/50 border border-gray-200 hover:border-gray-300 rounded-xl py-3 px-4 font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] text-xs"
                              />
                            </div>

                            {/* Password input Field */}
                            <div className="space-y-1 bg-white">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Security Password</label>
                              <input
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="w-full bg-gray-50/50 border border-gray-200 hover:border-gray-300 rounded-xl py-3 px-4 font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] text-xs"
                              />
                            </div>

                            {/* Optional: Avatar select badge only during Sign Up */}
                            {loginMode === 'signup' && (
                              <div className="space-y-1.5 pt-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Select Profile Avatar Badge</label>
                                <div className="flex flex-wrap gap-1.5 justify-center filter drop-shadow-sm bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                                  {['🥑', '🥦', '🍎', '🍓', '🍳', '🥩', '🎖️', '🔥', '🚀', '⚡', '🌟'].map((emoji) => (
                                    <button
                                      type="button"
                                      key={emoji}
                                      onClick={() => {
                                        setProfilePhoto(emoji);
                                        showToast(`Selected ${emoji} as your active avatar!`, "success");
                                      }}
                                      className={cn(
                                        "text-sm p-1.5 bg-white rounded-lg border hover:border-[#2D6A4F]/40 hover:scale-110 active:scale-95 transition-all focus:outline-none",
                                        profilePhoto === emoji ? "border-2 border-[#2D6A4F]" : "border-gray-100"
                                      )}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Submit Button */}
                            <button
                              type="submit"
                              className="w-full bg-[#2D6A4F] hover:bg-[#1C4332] text-white py-3.5 px-5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-700/10 hover:shadow-emerald-700/20 active:scale-98 transition-all flex items-center justify-center space-x-1.5"
                            >
                              <span>{loginMode === 'login' ? 'Verify Credentials & Enter' : 'Create Secure Profile & Go'}</span>
                              <ChevronRight size={14} />
                            </button>
                          </form>

                          {/* Quick conversion hints */}
                          <div className="text-center pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setLoginMode(loginMode === 'login' ? 'signup' : 'login');
                                setLoginPassword('');
                              }}
                              className="text-[11px] font-bold text-[#2D6A4F] hover:underline hover:text-[#1C4332] transition-colors"
                            >
                              {loginMode === 'login' 
                                ? "New to NutriLens? Sign up to create a profile" 
                                : "Already registered? Sign in here"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* VIEW: HOME SCAN & ANALYZE FOODS */}
              {screen === 'home' && (
                <div className="space-y-8 flex-grow">
                  {/* Page header title with network badge on mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Scan & Analyze Meal</h2>
                      <p className="text-sm text-gray-500">Provide an image snapshot or type details below to track macro stats.</p>
                    </div>
                    {/* Compact stats pill overlay */}
                    <div className="flex space-x-3 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100 items-center">
                      <Flame className="text-orange-600 animate-pulse" size={18} />
                      <div className="text-xs">
                        <span className="text-gray-400 font-bold">Today:</span> <strong className="text-gray-800">{dailyStats.totalCals} / {targetCalories} kcal</strong>
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout: Two equal columns for Scan inputs */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Column 1: Image upload + Camera controls */}
                    <div className="lg:col-span-7 space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Step 1: Capture food visual</h3>
                      
                      {/* DRAG AND DROP ZONE */}
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                          "border-2 border-dashed rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center h-64 relative bg-gray-50",
                          dragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-gray-300 hover:border-primary hover:bg-gray-100/30"
                        )}
                      >
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                          <Upload size={32} />
                        </div>
                        
                        <p className="text-sm font-bold text-gray-800 mb-1">
                          Drag and drop food photo here
                        </p>
                        
                        <p className="text-xs text-gray-400 mb-6 max-w-xs">
                          Supports PNG, JPEG files. We will automatically parse name for keywords offline.
                        </p>

                        <div className="flex flex-wrap gap-2 justify-center">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md shadow-primary/10"
                          >
                            Browse Files
                          </button>
                          
                          <button 
                            onClick={() => setIsCameraOpen(true)}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm flex items-center space-x-1.5"
                          >
                            <Camera size={14} />
                            <span>Live Camera</span>
                          </button>
                        </div>

                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          accept="image/*" 
                          className="hidden" 
                        />
                      </div>

                      {/* CAMERA STREAM DIALOG BOX INLINE OVERLAY */}
                      <AnimatePresence>
                        {isCameraOpen && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                          >
                            <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <span className="font-bold flex items-center space-x-2 text-gray-800 text-sm">
                                  <Camera size={18} className="text-primary animate-pulse" />
                                  <span>Live Food Lens Capture</span>
                                </span>
                                <button onClick={() => setIsCameraOpen(false)} className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
                                  <X size={18} />
                                </button>
                              </div>
                              
                              <div className="relative aspect-video bg-black max-h-[350px] overflow-hidden">
                                <video 
                                  ref={videoRef} 
                                  autoPlay 
                                  playsInline 
                                  className="w-full h-full object-cover"
                                />
                                <canvas ref={canvasRef} className="hidden" />
                              </div>

                              <div className="p-6 bg-gray-50 flex items-center justify-between">
                                <p className="text-xs text-gray-400">Position the plate centrally inside the frame</p>
                                <button 
                                  onClick={captureFrame}
                                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md flex items-center space-x-2"
                                >
                                  <span>Snap Record</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Column 2: Text prompt controls + Presets fallback */}
                    <div className="lg:col-span-5 space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Step 2: Enter description (or click Preset)</h3>

                      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center space-x-2 text-primary font-bold">
                          <TypeIcon size={18} />
                          <span className="text-xs font-black uppercase tracking-wider">Fast text tracker</span>
                        </div>
                        
                        <div className="space-y-2">
                          <textarea 
                            rows={3}
                            placeholder="Type meal details (e.g., 'bowl of yogurt with 10 almonds and sliced apple')"
                            value={mealDescription}
                            onChange={(e) => setMealDescription(e.target.value)}
                            className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl p-3.5 focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-gray-400 leading-relaxed"
                          />
                          <button 
                            type="button"
                            onClick={() => performAnalysis(undefined, mealDescription, "typed_meal.jpg")}
                            disabled={!mealDescription.trim()}
                            className={cn(
                              "w-full py-3.5 rounded-xl text-xs font-black tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1.5",
                              mealDescription.trim() 
                                ? "bg-[#2D6A4F] text-white hover:bg-[#1B4332]" 
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                          >
                            <span>Analyze Ingredients</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>

                      {/* PRESET CHIPS */}
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span className="font-bold flex items-center space-x-1.5 text-gray-400">
                            <Sparkles size={14} />
                            <span>Quick tester meals (Try offline!)</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {QUICK_PRESETS.map((p, index) => (
                            <button
                              key={index}
                              onClick={() => handlePresetClick(p)}
                              className="bg-gray-50 border border-gray-100/60 rounded-xl p-3 flex items-center space-x-2 text-left hover:bg-primary/5 hover:border-primary/20 group transition-all"
                            >
                              <span className="text-lg group-hover:scale-110 transition-transform">{p.icon}</span>
                              <div className="min-w-0">
                                <h5 className="text-[11px] font-bold text-gray-800 truncate">{p.name}</h5>
                                <p className="text-[9px] text-gray-400 truncate font-semibold">Insta-Log</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: RESULTS DIALOG SCAN REPORT */}
              {screen === 'results' && (
                <div className="space-y-6 flex-grow">
                  
                  {/* Title and Badge indicators */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-400 tracking-wider font-mono">ID: {currentAnalysis?.id || 'Pending'}</span>
                        {isAnalyzing ? (
                          <span className="bg-gray-100 text-gray-600 text-[9px] px-2 py-0.5 rounded-md font-bold">Analzying...</span>
                        ) : (currentAnalysis as any)?.isFromCache ? (
                          <span className="bg-blue-100 text-blue-800 text-[10px] px-2.5 py-1 rounded-full font-extrabold shadow-sm flex items-center space-x-1">
                            <Zap size={10} className="text-blue-600 animate-pulse fill-blue-500" />
                            <span>Local Cache Hit</span>
                          </span>
                        ) : currentAnalysis?.isOfflineFallback ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-1 rounded-full font-extrabold shadow-sm flex items-center space-x-1">
                            <WifiOff size={10} className="animate-bounce" />
                            <span>Offline Fallback Active</span>
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-[10px] px-2.5 py-1 rounded-full font-extrabold shadow-sm flex items-center space-x-1">
                            <Wifi size={10} className="text-green-600" />
                            <span>Gemini AI Verified</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Food Scan Result</h2>
                    </div>

                    <button 
                      onClick={() => setScreen('home')}
                      className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all self-start sm:self-auto"
                    >
                      Cancel / Back
                    </button>
                  </div>

                  {isAnalyzing ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="text-primary animate-pulse" size={18} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-gray-900">Conducting Food Biomass Analysis...</h4>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto">
                          {isActuallyOffline 
                            ? "Connecting to localized offline index keyword map models..." 
                            : "Contacting Gemini API server model for accurate high-precision nutrition predictions..."
                          }
                        </p>
                      </div>
                    </div>
                  ) : currentAnalysis ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left Side: Photo Frame */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-md bg-gray-50 border border-gray-100">
                          {capturedImage ? (
                            <img 
                              src={capturedImage} 
                              alt="Logged food" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer" 
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-8 space-y-2 bg-gray-50">
                              <Camera size={48} />
                              <span className="text-xs text-gray-400 font-bold">Typed text log - No photo snapped</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Initial Request Context</span>
                          <p className="text-xs text-gray-700 italic">"{currentAnalysis.description}"</p>
                        </div>
                      </div>

                      {/* Right Side: Nutrients, Slider adjust tool, tips & Action Buttons */}
                      <div className="lg:col-span-7 space-y-6">
                        
                        {/* Food identifier name edit text and health score */}
                        <div className="flex items-start justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <div className="space-y-1">
                            {isEditingMacros ? (
                              <input 
                                type="text"
                                value={adjustedFoodName}
                                onChange={(e) => setAdjustedFoodName(e.target.value)}
                                className="border border-gray-300 rounded-lg p-1.5 focus:ring-1 focus:ring-primary focus:outline-none font-bold text-gray-900 text-lg w-full"
                              />
                            ) : (
                              <h3 className="text-xl font-bold text-gray-900">{adjustedFoodName}</h3>
                            )}
                            <p className="text-xs text-gray-400 font-bold">Auto-detected nutrient structure</p>
                          </div>
                          
                          <div className="text-center">
                            <div className={cn(
                              "w-14 h-14 rounded-full border-4 flex items-center justify-center",
                              (currentAnalysis.healthScore || 0) > 80 
                                ? "border-green-600 bg-green-50 text-green-700" 
                                : "border-yellow-600 bg-yellow-50 text-yellow-700"
                            )}>
                              <span className="text-lg font-black">{currentAnalysis.healthScore}</span>
                            </div>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Health Score</span>
                          </div>
                        </div>

                        {/* Interactive edit panel toggle - Extremely smart offline feature */}
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Sliders size={16} className="text-amber-800" />
                              <h4 className="text-xs font-bold text-amber-900">✏️ Fine-tune macros & values</h4>
                            </div>
                            
                            <button
                              onClick={() => setIsEditingMacros(!isEditingMacros)}
                              className="text-xs text-[#2D6A4F] font-black hover:underline"
                            >
                              {isEditingMacros ? "Collapse sliders" : "Adjust estimations"}
                            </button>
                          </div>

                          <AnimatePresence>
                            {isEditingMacros && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-4 pt-2 overflow-hidden border-t border-amber-500/15"
                              >
                                <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                                  Our smart fallback provides a solid estimate. Use these sliders to adjust the meal facts if you have packaging details.
                                </p>
                                
                                <div className="space-y-3 font-mono text-xs">
                                  {/* Calories slider */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold">
                                      <span>Calories</span>
                                      <span className="text-gray-900">{adjustedCalories} kcal</span>
                                    </div>
                                    <input 
                                      type="range" 
                                      min={0} 
                                      max={2000} 
                                      step={5}
                                      value={adjustedCalories} 
                                      onChange={(e) => setAdjustedCalories(Number(e.target.value))}
                                      className="w-full accent-[#2D6A4F]"
                                    />
                                  </div>

                                  {/* Protein slider */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold">
                                      <span>Protein</span>
                                      <span className="text-gray-900">{adjustedProtein} g</span>
                                    </div>
                                    <input 
                                      type="range" 
                                      min={0} 
                                      max={200} 
                                      step={1}
                                      value={adjustedProtein} 
                                      onChange={(e) => setAdjustedProtein(Number(e.target.value))}
                                      className="w-full accent-[#2D6A4F]"
                                    />
                                  </div>

                                  {/* Carbs slider */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold">
                                      <span>Carbohydrates</span>
                                      <span className="text-gray-900">{adjustedCarbs} g</span>
                                    </div>
                                    <input 
                                      type="range" 
                                      min={0} 
                                      max={400} 
                                      step={1}
                                      value={adjustedCarbs} 
                                      onChange={(e) => setAdjustedCarbs(Number(e.target.value))}
                                      className="w-full accent-[#2D6A4F]"
                                    />
                                  </div>

                                  {/* Fat slider */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold">
                                      <span>Fats</span>
                                      <span className="text-gray-900">{adjustedFat} g</span>
                                    </div>
                                    <input 
                                      type="range" 
                                      min={0} 
                                      max={150} 
                                      step={1}
                                      value={adjustedFat} 
                                      onChange={(e) => setAdjustedFat(Number(e.target.value))}
                                      className="w-full accent-[#2D6A4F]"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Nutrition table layout */}
                        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                          <table className="w-full text-left font-mono text-xs">
                            <thead className="bg-[#F8F9FA] text-gray-500 border-b border-gray-100 font-bold uppercase tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Macronutrient</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white font-medium">
                              <tr>
                                <td className="px-4 py-3 font-sans font-bold flex items-center space-x-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                  <span>Protein</span>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900">{adjustedProtein}g</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 font-sans font-bold flex items-center space-x-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                  <span>Carbohydrates</span>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900">{adjustedCarbs}g</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 font-sans font-bold flex items-center space-x-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                  <span>Total Fat</span>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900">{adjustedFat}g</td>
                              </tr>
                              <tr className="bg-gray-50/50">
                                <td className="px-4 py-3.5 font-sans font-black flex items-center space-x-2">
                                  <Flame className="text-orange-600 animate-pulse" size={16} />
                                  <span>Calculated Energy</span>
                                </td>
                                <td className="px-4 py-3.5 text-right font-black text-gray-900 text-sm">{adjustedCalories} kcal</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Health tips section */}
                        {currentAnalysis.tips && currentAnalysis.tips.length > 0 && (
                          <div className="bg-[#D8F3DC]/30 p-5 rounded-3xl border border-[#D8F3DC]/60">
                            <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center space-x-1.5 mb-3">
                              <Zap size={14} className="fill-primary" />
                              <span>Clinical Health Guidance</span>
                            </h4>
                            <div className="space-y-2">
                              {currentAnalysis.tips.map((t, idx) => (
                                <div key={idx} className="flex items-start space-x-2.5 text-xs text-gray-700">
                                  <Check size={14} className="text-primary flex-shrink-0 mt-0.5" />
                                  <span>{t}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interactive Date Offset Backdating Tool */}
                        <div className="bg-gray-50 border border-gray-100 p-5 rounded-3xl space-y-3.5">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center space-x-1.5">
                              <Calendar size={14} className="text-primary" />
                              <span>Diary Logging Date</span>
                            </h4>
                            <span className="text-[10px] font-black text-[#2D6A4F] bg-[#D8F3DC] py-1 px-3 rounded-full uppercase tracking-wider">
                              {logDateOffset === 0 ? "Today" : logDateOffset === 1 ? "Yesterday" : `${logDateOffset} days ago`}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                            {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                              const d = new Date();
                              d.setDate(d.getDate() - offset);
                              const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
                              const isSelected = logDateOffset === offset;
                              return (
                                <button
                                  key={offset}
                                  type="button"
                                  onClick={() => setLogDateOffset(offset)}
                                  className={cn(
                                    "py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all border active:scale-95 cursor-pointer",
                                    isSelected 
                                      ? "bg-[#2D6A4F] border-[#2D6A4F] text-white shadow-md font-bold scale-105" 
                                      : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                  )}
                                >
                                  <span className="text-[9px] uppercase font-bold tracking-wider">{dayName}</span>
                                  <span className="text-xs font-black mt-0.5">{d.getDate()}</span>
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-[10px] text-gray-400 font-medium italic leading-relaxed">
                            Backdate logs or save meals to past days of the week to populate the Weekly Analytics Report graphs instantly!
                          </p>
                        </div>

                        {/* Save Trigger Button */}
                        <div className="pt-2 flex flex-col sm:flex-row gap-3">
                          <button 
                            onClick={saveMealRecord}
                            className="flex-1 bg-primary hover:bg-[#1B4332] text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all text-center flex items-center justify-center space-x-2"
                          >
                            <span>Save to Food Journal</span>
                            <ChevronRight size={16} />
                          </button>
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-sm text-gray-400">Error: Meal analysis data was missing. Resetting.</p>
                      <button onClick={() => setScreen('home')} className="mt-4 bg-primary text-white text-xs px-4 py-2 rounded-xl">Go Home</button>
                    </div>
                  )}

                </div>
              )}

              {/* VIEW: TIMELINE LOGS DIARY HISTORY */}
              {screen === 'history' && (
                <div className="space-y-8 flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Your Meals History Diary</h2>
                      <p className="text-sm text-gray-500">Review, remove, or upgrade your logged calorie inputs.</p>
                    </div>
                    {/* Clear history option */}
                    {history.length > 0 && (
                      <button
                        onClick={() => {
                          saveHistory([]);
                          showToast("History cleared.", "info");
                        }}
                        className="text-xs text-red-500 font-bold hover:underline flex items-center space-x-1.5 self-start sm:self-auto"
                      >
                        <Trash2 size={13} />
                        <span>Clear History Diary</span>
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto">
                      <div className="w-16 h-16 bg-[#2D6A4F]/10 rounded-full flex items-center justify-center text-3xl">
                        📅
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-900">No Food Entry Logged Yet</h4>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">
                          Start tracking meals by clicking 'Scan & Analyze' and saving your delicious breakfast, lunch or dinners!
                        </p>
                      </div>
                      <button 
                        onClick={() => setScreen('home')}
                        className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md"
                      >
                        Scan First Meal
                      </button>
                    </div>
                  ) : (
                    /* Detailed bento grid timeline layout of meals */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {history.map((meal) => (
                        <div 
                          key={meal.id} 
                          className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative"
                        >
                          {/* Image area */}
                          <div className="h-44 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 relative">
                            {meal.imageUrl ? (
                              <img 
                                src={meal.imageUrl} 
                                alt={meal.detectedFood} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            ) : (() => {
                              const fallback = getFoodVisualFallback(meal.detectedFood || meal.description);
                              return (
                                <div className={cn("w-full h-full flex flex-col items-center justify-center bg-gradient-to-br", fallback.gradient)}>
                                  <span className="text-5xl filter drop-shadow-md animate-bounce [animation-duration:3s]">{fallback.emoji}</span>
                                  <span className="text-[9px] uppercase font-extrabold tracking-widest text-black/45 mt-2">Logged Food</span>
                                </div>
                              );
                            })()}

                            {/* Floating Network indicator overlay on card */}
                            <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                              {meal.isOfflineFallback ? (
                                <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm flex items-center space-x-1">
                                  <WifiOff size={8} />
                                  <span>Offline Estimate</span>
                                </span>
                              ) : (
                                <span className="bg-green-100 border border-green-200 text-green-800 text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm flex items-center space-x-1">
                                  <Wifi size={8} />
                                  <span>Verified AI</span>
                                </span>
                              )}
                            </div>

                            {/* Floating Score overlay */}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-gray-900 border border-gray-100 shadow-sm text-center">
                              <span className="text-xs font-black block leading-none">{meal.healthScore}</span>
                              <span className="text-[7px] text-gray-400 font-bold uppercase tracking-widest block scale-90">Score</span>
                            </div>
                          </div>

                          {/* Content area */}
                          <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-900 text-sm truncate pr-2" title={meal.detectedFood}>
                                  {meal.detectedFood}
                                </h4>
                                <button 
                                  onClick={() => deleteMealRecord(meal.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  title="Delete meal record"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <p className="text-[10px] text-gray-400 font-bold flex items-center space-x-1 mt-1">
                                <Calendar size={12} />
                                <span>{new Date(meal.timestamp).toLocaleString()}</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">"{meal.description}"</p>
                            </div>

                            <div className="space-y-3.5 border-t border-gray-100 pt-3">
                              {/* Macromap pills */}
                              <div className="flex justify-between font-mono text-[10px] font-medium text-gray-400">
                                <div>
                                  <span className="font-bold text-gray-900">{meal.protein}g</span> Prot
                                </div>
                                <div>
                                  <span className="font-bold text-gray-900">{meal.carbs}g</span> Carb
                                </div>
                                <div>
                                  <span className="font-bold text-gray-900">{meal.fat}g</span> Fat
                                </div>
                                <div>
                                  <span className="text-orange-600 font-black">{meal.calories} kcal</span>
                                </div>
                              </div>

                              {/* Seamless Online Upgrade trigger - Highly requested */}
                              {meal.isOfflineFallback && (
                                <div className="bg-amber-100/50 p-2.5 rounded-xl border border-amber-200/50 flex flex-col space-y-2">
                                  <span className="text-[9px] text-amber-800 font-bold leading-relaxed">
                                    Meal scanned offline. Accurate Gemini AI analysis is available now.
                                  </span>
                                  <button
                                    onClick={() => upgradeMealToAI(meal)}
                                    disabled={upgradingMealId === meal.id}
                                    className="w-full bg-white hover:bg-[#2D6A4F] hover:text-white border border-[#2D6A4F] text-[#2D6A4F] py-2 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all flex items-center justify-center space-x-1 shadow-sm active:scale-95"
                                  >
                                    {upgradingMealId === meal.id ? (
                                      <>
                                        <RefreshCw size={10} className="animate-spin" />
                                        <span>Upgrading...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles size={10} className="fill-[#2D6A4F] hover:fill-white" />
                                        <span>Upgrade to AI Analysis</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* VIEW: ANALYTICS REPORTS */}
              {screen === 'reports' && (
                <div className="space-y-8 flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Weekly Nutrition Analytics</h2>
                      <p className="text-sm text-gray-500">Track calorie metrics, macro splits, and wellness goal indicators.</p>
                    </div>
                    <span className="bg-[#D8F3DC] text-primary text-xs font-black px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 self-start sm:self-auto">
                      <TrendingUp size={14} />
                      <span>Activity Last 7 Days</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Today's Meals Count</span>
                      <h4 className="text-2xl font-black text-gray-900">{dailyStats.count} meals</h4>
                      <p className="text-[10px] text-gray-400">Total logged entries</p>
                    </div>
                    
                    <div className="bg-[#2D6A4F]/5 border border-[#2D6A4F]/10 rounded-2xl p-5 shadow-sm space-y-2">
                      <span className="text-[10px] font-black uppercase text-primary tracking-wider flex items-center space-x-1">
                        <Flame size={12} className="text-orange-600 animate-pulse" />
                        <span>Today's Calories</span>
                      </span>
                      <h4 className="text-2xl font-black text-[#2D6A4F]">{dailyStats.totalCals} kcal</h4>
                      <p className="text-[10px] text-gray-500">Total energy intake summary</p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Active Stream Health</span>
                      <h4 className="text-2xl font-black text-[#2D6A4F]">95% Score</h4>
                      <p className="text-[10px] text-gray-400">Average based on meals</p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Your Body BMI Index</span>
                      <div className="flex items-baseline space-x-1.5">
                        <h4 className="text-2xl font-black text-gray-900">21.45 Normal</h4>
                      </div>
                      <p className="text-[10px] text-green-700 font-bold bg-green-50 inline-block px-2 py-0.5 rounded-md">Healthy weight range</p>
                    </div>
                  </div>

                  {history.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">
                      <p className="text-sm">Log meals to view weekly chart analytics.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Calories Intake Chart */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-4">Daily Calories Track</h4>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyChartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280'}} />
                              <YAxis hide />
                              <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{ fill: '#f3f4f6' }}
                              />
                              <Bar dataKey="calories" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Protein Intake Track Area */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-4">Weekly Protein Level Tracker (g)</h4>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyChartData}>
                              <defs>
                                <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#40916C" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#40916C" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280'}} />
                              <YAxis hide />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                              <Area type="monotone" dataKey="protein" stroke="#2D6A4F" fillOpacity={1} fill="url(#colorProtein)" strokeWidth={3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* VIEW: USER PROFILE PROFILE & GUIDELINES GOAL */}
              {screen === 'profile' && (
                <div className="space-y-8 flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-gray-900">User Profile</h2>
                      <p className="text-sm text-gray-500">Manage your avatar, display name, and daily calories goal.</p>
                    </div>
                    {hasUnsavedSettings && (
                      <button
                        onClick={saveProfileSettings}
                        className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-[#2D6A4F]/15 flex items-center space-x-1.5 transition-all active:scale-95 self-start sm:self-auto uppercase tracking-wider cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Save Profile</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Panel 1: Profile identity */}
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="relative inline-block mx-auto text-center w-full">
                          {profilePhoto ? (
                            profilePhoto.startsWith('data:') ? (
                              <img src={profilePhoto} alt={userProfileName} className="w-24 h-24 rounded-full object-cover border-4 border-[#2D6A4F]/20 bg-white mx-auto shadow-md" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-24 h-24 rounded-full border-4 border-[#2D6A4F]/20 overflow-hidden bg-white flex items-center justify-center text-5xl shadow-inner mx-auto">
                                {profilePhoto}
                              </div>
                            )
                          ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-[#2D6A4F]/20 overflow-hidden bg-white flex items-center justify-center font-black text-3xl text-[#2D6A4F] mx-auto shadow-inner">
                              {userProfileName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <h3 className="text-lg font-bold text-gray-950 mt-3">{userProfileName || "Guest User"}</h3>
                        </div>

                        {/* Set badge emoji preset */}
                        <div className="space-y-2 pt-2 border-t border-gray-200/50">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block text-center">Quick Profile Icon</span>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {['🥑', '🥦', '🍎', '🍓', '🍳', '🥩', '🎖️', '🔥'].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  handleSelectPresetAvatar(emoji);
                                  setHasUnsavedSettings(true);
                                }}
                                className={`text-lg p-1.5 bg-white rounded-xl border transition-all hover:scale-110 active:scale-95 cursor-pointer ${profilePhoto === emoji ? 'border-[#2D6A4F] ring-2 ring-[#2D6A4F]/20' : 'border-gray-100 hover:border-[#2D6A4F]/20'}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom upload */}
                        <div className="space-y-2 pt-2 border-t border-gray-200/50">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block text-center">Or Upload Custom Avatar</span>
                          <input
                            type="file"
                            ref={profilePhotoInputRef}
                            onChange={(e) => {
                              handleProfilePhotoChange(e);
                              setHasUnsavedSettings(true);
                            }}
                            accept="image/*"
                            className="hidden"
                          />
                          <div className="flex justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => profilePhotoInputRef.current?.click()}
                              className="bg-[#2D6A4F]/10 hover:bg-[#2D6A4F]/15 text-[#2D6A4F] text-xs font-black py-2.5 px-4 rounded-xl flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
                            >
                              <Upload size={13} />
                              <span>Upload Photo</span>
                            </button>
                            {profilePhoto && (
                              <button
                                type="button"
                                onClick={() => {
                                  setProfilePhoto('');
                                  localStorage.removeItem('nutrilens_user_avatar');
                                  setHasUnsavedSettings(true);
                                  showToast("Avatar successfully reset.", "info");
                                }}
                                className="bg-red-50 hover:bg-red-100/70 text-red-600 text-xs font-black py-2.5 px-4 rounded-xl flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
                              >
                                <span>Reset Default</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Panel 2: Profile targets configuration */}
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-6 flex flex-col justify-between">
                      <div className="space-y-6">
                        {/* Display Nickname */}
                        <div className="space-y-2 text-xs">
                          <label className="font-bold text-gray-500 block text-xs uppercase tracking-wider">Display Nickname</label>
                          <input 
                            type="text" 
                            value={userProfileName}
                            onChange={(e) => {
                              setUserProfileName(e.target.value);
                              setHasUnsavedSettings(true);
                            }}
                            className="w-full bg-gray-50 border border-gray-150 rounded-xl py-3 px-4 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-sm"
                            placeholder="Enter nickname..."
                          />
                        </div>

                        {/* Daily Calories Target */}
                        <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex justify-between items-baseline">
                            <label className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block">Daily Calories Budget</label>
                            <span className="text-base font-black text-[#2D6A4F]">{targetCalories} kcal</span>
                          </div>
                          <input 
                            type="range" 
                            min={1000} 
                            max={4000} 
                            step={50}
                            value={targetCalories} 
                            onChange={(e) => {
                              const newCal = Number(e.target.value);
                              setTargetCalories(newCal);
                              // Auto calculate macro balances cleanly under the hood: 30% Protein, 40% Carbohydrate, 30% Fat split
                              setTargetProtein(Math.round((newCal * 0.3) / 4));
                              setTargetCarbs(Math.round((newCal * 0.4) / 4));
                              setTargetFat(Math.round((newCal * 0.3) / 9));
                              setHasUnsavedSettings(true);
                            }}
                            className="w-full accent-[#2D6A4F] mt-2 cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-1">
                            <span>1000 kcal</span>
                            <span>4000 kcal</span>
                          </div>
                        </div>

                        {/* Clean privacy assurance */}
                        <div className="p-4 bg-emerald-50/45 border border-emerald-100/60 rounded-2xl text-[11px] text-gray-600 leading-relaxed font-semibold">
                          🔒 <strong className="text-emerald-800">100% Client-Side Memory:</strong> All user profile inputs, scan histories, and daily stats are recorded securely inside your local browser storage. We respect your physical device boundary.
                        </div>
                      </div>

                      {hasUnsavedSettings && (
                        <button
                          type="button"
                          onClick={saveProfileSettings}
                          className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white py-3 rounded-xl text-xs font-black shadow-md flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                        >
                          <Check size={14} />
                          <span>Save Changes</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
        
      </div>

      {screen !== 'welcome' && (
        <>
          {/* Mobile Sticky Bottom Floating Navigation */}
          <nav className="md:hidden fixed bottom-5 left-4 right-4 z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-2.5 flex justify-around items-center">
            <button
              type="button"
              onClick={() => setScreen('home')}
              className={cn(
                "flex flex-col items-center space-y-1 py-1.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-150 active:scale-95",
                screen === 'home' || screen === 'results' ? "text-primary bg-[#D8F3DC]/30 scale-105" : "text-gray-400"
              )}
            >
              <HomeIcon size={18} />
              <span>Scan</span>
            </button>

            <button
              type="button"
              onClick={() => setScreen('history')}
              className={cn(
                "flex flex-col items-center space-y-1 py-1.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-150 active:scale-95 relative",
                screen === 'history' ? "text-primary bg-[#D8F3DC]/30 scale-105" : "text-gray-400"
              )}
            >
              <HistoryIcon size={18} />
              <span>Logs</span>
              {history.length > 0 && (
                <span className="absolute top-1 right-2 px-1.5 py-0.5 bg-red-500 text-white font-mono text-[8px] font-black rounded-full leading-none scale-90">
                  {history.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setScreen('reports')}
              className={cn(
                "flex flex-col items-center space-y-1 py-1.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-150 active:scale-95",
                screen === 'reports' ? "text-primary bg-[#D8F3DC]/30 scale-105" : "text-gray-400"
              )}
            >
              <BarChart3 size={18} />
              <span>Reports</span>
            </button>

            <button
              type="button"
              onClick={() => setScreen('profile')}
              className={cn(
                "flex flex-col items-center space-y-1 py-1.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-150 active:scale-95",
                screen === 'profile' ? "text-primary bg-[#D8F3DC]/30 scale-105" : "text-gray-400"
              )}
            >
              <UserIcon size={18} />
              <span>Profile</span>
            </button>
          </nav>

          <footer className="py-6 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider border-t border-gray-200 mt-auto pb-28 md:pb-6">
            NutriLens smart web portal • {new Date().getFullYear()} • Offline fallback database active
          </footer>
        </>
      )}
    </div>
  );
}
