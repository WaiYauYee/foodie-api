
//App.tsx
import React, { useState, useEffect } from 'react';
import { Page, User, WeightEntry, Food, MealEntry, MealType } from './types/types';
import Dashboard from './components/Dashboard';
import Diary from './components/Diary';
import Profile from './components/Profile';
import PersonalInfo from './components/PersonalInfo';
import ChangePassword from './components/ChangePassword';
import Goal from './components/Goal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermOfService from './components/TermOfService';
import AddWeight from './components/AddWeight';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Onboarding from './components/Onboarding';
import { LayoutDashboard, User as UserIcon, Utensils } from 'lucide-react';
import AccountSetting from './components/AccountSetting';
// import Pal from './components/Pal';

const INITIAL_USER: User = {
  userId: 'u1',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  passwordHash: 'hashed_password_here',
  gender: 'male',             // 'male' | 'female'
  birthDate: '1990-01-01',    // ISO string
  heightCm: 175,
  isActive: true,

  // Profile / fitness info
  startWeight: 65,
  currentWeight: 65,
  goalWeight: 55,
  activityLevel: 'Sedentary',
  dietaryGoal: 'Gradual Lose Weight',
  goalOrigin: 'standard',
  targetCalories: 2000,
  targetProtein: 100,
  targetCarbs: 250,
  targetFat: 65,
  targetFiber: 20,
  macroGoalOrigin: 'standard',
  onboardingComplete: false,
  triedOtherApps: false,
  primaryGoal: 'healthier',
  dietType: 'Classic',

  // Timestamps
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const MOCK_MEALS: MealEntry[] = [
  {
    id: 'm1',
    userId: 'u1',
    foodId: '1',                  // id of main dish food
    food: {                        // full Food object for the main dish
      id: '1',
      name: 'Nasi Lemak Biasa',
      group: 'Rice Dishes',
      servingSize: 200,
      servingUnit: 'g',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      nutrients: {
        foodId: '1',
        calories: 450,
        protein: 12,
        carbs: 60,
        fat: 18,
        fiber: 10,
        updatedAt: Date.now(),
      },
      ingredients: [], // optional nested ingredients
    },
    mealType: 'breakfast',        // matches MealType
    consumedAt: Date.now(),       // timestamp
    createdAt: Date.now(),
    ingredients: [
      {
        id: '1',
        name: 'Nasi Lemak Biasa',
        group: 'Rice Dishes',
        servingSize: 200,
        servingUnit: 'g',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        nutrients: {
          foodId: '1',
          calories: 450,
          protein: 12,
          carbs: 60,
          fat: 18,
          fiber: 10,
          updatedAt: Date.now(),
        },
        ingredients: [], // optional
      }
    ],
    estimatedCalories: 450,
    actualProtein_g: 12,
    actualCarbs_g: 60,
    actualFat_g: 18,
    actualFiber_g: 10,
    photoUrl: '',                 // optional
    photoAnalysisStatus: 1,       // optional
  }
];

const MOCK_WEIGHTS: WeightEntry[] = [
  { 
    id: 'w1',
    userId: 'user1',            // you need a userId
    weight: 65,                 // matches the interface
    recordedAt: new Date('2026-01-24T10:00:00').getTime(), // timestamp
    createdAt: Date.now(),      // or some fixed timestamp
  },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'privacy' | 'terms'>('login');
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [meals, setMeals] = useState<MealEntry[]>(MOCK_MEALS);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(MOCK_WEIGHTS);
  const [user, setUser] = useState<User>(INITIAL_USER);

  useEffect(() => {
    const savedAuth = localStorage.getItem('makanfit_auth') === 'true';
    setIsAuthenticated(savedAuth);

    // FIXED: Check onboarding status from user object, not just localStorage flag
    const savedUser = localStorage.getItem('makanfit_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser) as User;
        setUser(userData);
        // Use the user's onboardingComplete property
        setHasCompletedOnboarding(userData.onboardingComplete === true);
      } catch (error) {
        console.error('Error parsing user:', error);
        // Fallback to localStorage flag
        const onboardingDone = localStorage.getItem('makanfit_onboarding_done') === 'true';
        setHasCompletedOnboarding(onboardingDone);
      }
    } else {
      // No saved user, check localStorage flag as fallback
      const onboardingDone = localStorage.getItem('makanfit_onboarding_done') === 'true';
      setHasCompletedOnboarding(onboardingDone);
    }

    const savedMeals = localStorage.getItem('makanfit_meals');
    if (savedMeals) setMeals(JSON.parse(savedMeals));

    const savedWeights = localStorage.getItem('makanfit_weights');
    if (savedWeights) setWeightHistory(JSON.parse(savedWeights));
  }, []);


  // FIXED: Improved handleLogin with proper onboarding status detection
  const handleLogin = () => {
    setIsAuthenticated(true);

    // Get the user data from localStorage (set by authService.ts during login)
    const savedUser = localStorage.getItem('makanfit_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser) as User;
        setUser(userData);
        // Check the backend's onboarding status
        // Backend returns onboardingComplete as true/false
        setHasCompletedOnboarding(userData.onboardingComplete === true);
      } catch (error) {
        console.error('Error parsing user:', error);
        // Fallback: check localStorage flag
        const onboardingDone = localStorage.getItem('makanfit_onboarding_done') === 'true';
        setHasCompletedOnboarding(onboardingDone);
      }
    }

    // Navigate to dashboard - Onboarding component will show if needed
    setCurrentPage(Page.DASHBOARD);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    localStorage.removeItem('makanfit_auth');
    localStorage.removeItem('makanfit_onboarding_done');
    setAuthPage('login');
  };

  // FIXED: Improved onboarding completion handler
  const handleOnboardingComplete = (data: Partial<User>) => {
    const updatedUser = { 
      ...user, 
      ...data, 
      onboardingComplete: true  // Mark onboarding as complete
    };
    setUser(updatedUser);
    setHasCompletedOnboarding(true);
    
    // FIXED: Sync with localStorage
    localStorage.setItem('makanfit_onboarding_done', 'true');
    localStorage.setItem('makanfit_user', JSON.stringify(updatedUser));
    
    setCurrentPage(Page.DASHBOARD);
  };

 const handleAddMeal = (food: Food, mealType: MealType = 'breakfast') => {
  const newMeal: MealEntry = {
    id: Math.random().toString(36).substr(2, 9),
    userId: user.userId,
    foodId: food.id,
    food,
    mealType: mealType,
    consumedAt: Date.now(),
    createdAt: Date.now(),
    ingredients: [food],      // main dish as ingredient
    estimatedCalories: food.nutrients?.calories,
    actualProtein_g: food.nutrients?.protein,
    actualCarbs_g: food.nutrients?.carbs,
    actualFat_g: food.nutrients?.fat,
    actualFiber_g: food.nutrients?.fiber,
  };

  setMeals(prev => [newMeal, ...prev]);
};


  const handleDeleteMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const handleAddWeight = (weight: number) => {
     const newEntry: WeightEntry = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.userId,         // add the current user's ID
        weight,                      // same as before
        recordedAt: Date.now(),      // replaces 'timestamp'
        createdAt: Date.now(),       // required field
      };
    setWeightHistory(prev => [newEntry, ...prev]);
    setUser(prev => ({ ...prev, weight }));
  };

  const handleUpdateUser = (updatedFields: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

    if (!isAuthenticated) {
    if (authPage === 'privacy') return <PrivacyPolicy onBack={() => setAuthPage('signup')} />;
    if (authPage === 'terms') return <TermOfService onBack={() => setAuthPage('signup')} />;

    return authPage === 'login' 
      ? <Login onLogin={handleLogin} onNavigateToSignUp={() => setAuthPage('signup')} />
      : <SignUp 
          onSignUp={handleLogin}
          onNavigateToLogin={() => setAuthPage('login')}
          onNavigateToPrivacy={() => setAuthPage('privacy')}
          onNavigateToTerms={() => setAuthPage('terms')}
        />;
  }

  // Only after user is authenticated
  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return (
          <Dashboard 
            meals={meals} 
            user={user} 
            weightHistory={weightHistory} 
            onNavigateToAddWeight={() => setCurrentPage(Page.ADD_WEIGHT)} 
          />
        );
      case Page.DIARY:
        return <Diary meals={meals} onAddMeal={handleAddMeal} onDeleteMeal={handleDeleteMeal} />;
      // case Page.PAL: return <Pal />;
      case Page.PROFILE:
        return (
          <Profile 
            user={user} 
            onNavigateToAccount={() => setCurrentPage(Page.PERSONAL_INFO)}
            onNavigateToSetting={() => setCurrentPage(Page.ACCOUNT_SETTING)}
            onNavigateToSecurity={() => setCurrentPage(Page.CHANGE_PASSWORD)}
            onNavigateToGoal={() => setCurrentPage(Page.GOAL)}
            onNavigateToPrivacy={() => setCurrentPage(Page.PRIVACY_POLICY)}
            onLogout={handleLogout}
          />
        );
      case Page.PERSONAL_INFO:
        return <PersonalInfo user={user} onBack={() => setCurrentPage(Page.PROFILE)} onSave={handleUpdateUser} />;
      case Page.ACCOUNT_SETTING:
        return <AccountSetting user={user} onBack={() => setCurrentPage(Page.PROFILE)} onSave={handleUpdateUser} />;
      case Page.CHANGE_PASSWORD:
        return <ChangePassword onBack={() => setCurrentPage(Page.PROFILE)} onSave={() => console.log('Password saved')} />;
      case Page.GOAL:
        return <Goal user={user} onBack={() => setCurrentPage(Page.PROFILE)} onSave={handleUpdateUser} />;
      case Page.PRIVACY_POLICY:
        return <PrivacyPolicy onBack={() => setCurrentPage(Page.PROFILE)} />;
      case Page.ADD_WEIGHT:
        return (
          <AddWeight 
            currentWeight={user.currentWeight} 
            onBack={() => setCurrentPage(Page.DASHBOARD)} 
            onAdd={handleAddWeight} 
          />
        );
      default:
        return <Dashboard meals={meals} user={user} weightHistory={weightHistory} onNavigateToAddWeight={() => setCurrentPage(Page.ADD_WEIGHT)} />;
    }
  };

  // const NavItems = () => (
  //   <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-8 z-[50]">
  //     <button 
  //       onClick={() => setCurrentPage(Page.DASHBOARD)}
  //       className={`flex flex-col items-center space-y-1 transition-all ${[Page.DASHBOARD, Page.ADD_WEIGHT].includes(currentPage) ? 'text-emerald-600' : 'text-gray-300'}`}
  //     >
  //       <LayoutDashboard className="w-6 h-6" />
  //       <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
  //     </button>
  //     <button 
  //       onClick={() => setCurrentPage(Page.DIARY)}
  //       className={`flex flex-col items-center space-y-1 transition-all ${currentPage === Page.DIARY ? 'text-emerald-600' : 'text-gray-300'}`}
  //     >
  //       <Utensils className="w-6 h-6" />
  //       <span className="text-[10px] font-black uppercase tracking-widest">Diary</span>
  //     </button>
  //     <button 
  //       onClick={() => setCurrentPage(Page.PROFILE)}
  //       className={`flex flex-col items-center space-y-1 transition-all ${[Page.PROFILE, Page.PERSONAL_INFO, Page.CHANGE_PASSWORD, Page.GOAL, Page.PRIVACY_POLICY].includes(currentPage) ? 'text-emerald-600' : 'text-gray-300'}`}
  //     >
  //       <UserIcon className="w-6 h-6" />
  //       <span className="text-[10px] font-black uppercase tracking-widest">Me</span>
  //     </button>
  //   </div>
  // );

  const NavItems = () => (
  <div className="
    fixed md:static bottom-0 left-0 right-0
    h-20 md:h-auto
    bg-white
    border-t md:border-t-0 border-gray-100
    flex md:flex-col items-center md:items-stretch
    justify-around md:justify-start
    md:space-y-2
    px-8 md:px-2
    z-[50]
  ">
    {/* Home */}
    <button 
      onClick={() => setCurrentPage(Page.DASHBOARD)}
      className={`flex flex-col md:flex-row items-center md:justify-start
        space-y-1 md:space-y-0 md:space-x-4
        px-4 py-3 rounded-xl transition-all
        ${[Page.DASHBOARD, Page.ADD_WEIGHT].includes(currentPage)
          ? 'text-emerald-600 md:bg-emerald-50'
          : 'text-gray-300 hover:text-emerald-600 hover:bg-gray-50'
        }`}
    >
      <LayoutDashboard className="w-6 h-6 md:w-7 md:h-7" />
      <span className="text-[10px] md:text-base font-black md:font-bold uppercase md:normal-case tracking-widest md:tracking-normal">
        Home
      </span>
    </button>

    {/* Diary */}
    <button 
      onClick={() => setCurrentPage(Page.DIARY)}
      className={`flex flex-col md:flex-row items-center md:justify-start
        space-y-1 md:space-y-0 md:space-x-4
        px-4 py-3 rounded-xl transition-all
        ${currentPage === Page.DIARY
          ? 'text-emerald-600 md:bg-emerald-50'
          : 'text-gray-300 hover:text-emerald-600 hover:bg-gray-50'
        }`}
    >
      <Utensils className="w-6 h-6 md:w-7 md:h-7" />
      <span className="text-[10px] md:text-base font-black md:font-bold uppercase md:normal-case tracking-widest md:tracking-normal">
        Diary
      </span>
    </button>

    {/* <button onClick={() => setCurrentPage(Page.PAL)} className={`flex flex-col md:flex-row items-center md:justify-start space-y-1 md:space-y-0 md:space-x-4 px-4 py-3 rounded-xl transition-all ${currentPage === Page.PAL ? 'text-emerald-600 md:bg-emerald-50' : 'text-gray-300'}`}>
        <Heart className={`w-6 h-6 md:w-7 md:h-7 ${currentPage === Page.PAL ? 'fill-emerald-600' : ''}`} /><span className="text-[10px] md:text-base font-black uppercase md:normal-case tracking-widest">Pal</span>
      </button> */}

    {/* Me */}
    <button 
      onClick={() => setCurrentPage(Page.PROFILE)}
      className={`flex flex-col md:flex-row items-center md:justify-start
        space-y-1 md:space-y-0 md:space-x-4
        px-4 py-3 rounded-xl transition-all
        ${[Page.PROFILE, Page.PERSONAL_INFO, Page.CHANGE_PASSWORD, Page.GOAL, Page.PRIVACY_POLICY].includes(currentPage)
          ? 'text-emerald-600 md:bg-emerald-50'
          : 'text-gray-300 hover:text-emerald-600 hover:bg-gray-50'
        }`}
    >
      <UserIcon className="w-6 h-6 md:w-7 md:h-7" />
      <span className="text-[10px] md:text-base font-black md:font-bold uppercase md:normal-case tracking-widest md:tracking-normal">
        Me
      </span>
    </button>
  </div>
);


  return (
    <div className="min-h-screen md:flex-row mx-auto bg-gray-50 relative overflow-x-hidden shadow-2xl">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 bg-white border-r border-gray-100 p-6 z-50">
        <div className="mb-10 px-4">
          <h1 className="text-2xl font-black text-emerald-600 tracking-tight">MAKANFIT</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItems />
        </nav>
      </aside>
      
      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col md:ml-72 min-h-screen">
        {/* Mobile Header Only */}
        <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-gray-100">
          <h1 className="text-xl font-black text-emerald-600 tracking-tight">MAKANFIT</h1>
        </header>

        {/* Content Area */}
        <main className="flex-1 pb-24 md:pb-8 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {renderPage()}
          </div>
        </main>

        {/* Bottom Nav - Mobile Only */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-4 safe-area-bottom flex justify-between items-center z-50">
          <NavItems />
        </nav>
      </div>
    </div>
  );
};

export default App;
