
import React, { useState } from 'react';
import { 
  Flame, Heart, Coins, ShoppingBag, Trophy, 
  CheckCircle2, Circle, 
  Sparkles, Store, PartyPopper, Leaf
} from 'lucide-react';
import Mascot from './Mascot';
import { Challenge, OutfitItem } from '../types/types';
import sceneImg from '../assets/picnic.png';


const INITIAL_CHALLENGES: Challenge[] = [
  { id: '1', title: 'Stay Consistent', description: 'Log at least 3 meals today', reward: 50, progress: 2, target: 3, completed: false, type: 'consistent' },
  { id: '2', title: 'Eat Mindfully', description: 'Log a meal with 3+ ingredients', reward: 30, progress: 1, target: 1, completed: false, type: 'mindful' },
  { id: '3', title: 'Calorie Balance', description: 'Stay within your calorie goal', reward: 100, progress: 1279, target: 1500, completed: false, type: 'balance' },
];

const SHOP_ITEMS: OutfitItem[] = [
  { 
    id: 'shades', 
    name: 'Cool Shades', 
    price: 200, 
    category: 'eyes', 
    owned: false,
    svgElement: (
      <g transform="translate(70, 95)">
        <rect x="10" y="5" width="25" height="15" rx="2" fill="#111" />
        <rect x="45" y="5" width="25" height="15" rx="2" fill="#111" />
        <rect x="35" y="10" width="10" height="4" fill="#111" />
      </g>
    )
  },
  { 
    id: 'crown', 
    name: 'Royal Crown', 
    price: 500, 
    category: 'hat', 
    owned: false,
    svgElement: (
      <g transform="translate(65, 10)">
        <path d="M0 30 L15 5 L35 25 L55 5 L70 30 Z" fill="#FACC15" stroke="#EAB308" strokeWidth="2" />
        <circle cx="35" cy="20" r="4" fill="#EF4444" />
        <circle cx="10" cy="25" r="2" fill="#3B82F6" />
        <circle cx="60" cy="25" r="2" fill="#3B82F6" />
      </g>
    )
  },
  { 
    id: 'bowtie', 
    name: 'Fancy Bowtie', 
    price: 150, 
    category: 'accessory', 
    owned: true,
    svgElement: (
      <g transform="translate(100, 160)">
        <path d="M-15 -8 L15 8 L15 -8 L-15 8 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
        <circle cx="0" cy="0" r="5" fill="#991B1B" />
      </g>
    )
  },
  { 
    id: 'halo', 
    name: 'Healthy Halo', 
    price: 1000, 
    category: 'hat', 
    owned: false,
    svgElement: (
      <g transform="translate(65, 0)">
        <ellipse cx="35" cy="15" rx="40" ry="8" fill="none" stroke="#FDE047" strokeWidth="4" opacity="0.8">
           <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </ellipse>
      </g>
    )
  }
];

const Pal: React.FC = () => {
  const [coins, setCoins] = useState(340);
  const [streak, ] = useState(5);
  const [activeTab, setActiveTab] = useState<'quest' | 'wardrobe'>('quest');
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [mascotState, setMascotState] = useState<'idle' | 'happy' | 'thinking'>('idle');
  const [showReward, setShowReward] = useState<number | null>(null);
  
  const [equipped, setEquipped] = useState<Record<string, OutfitItem | null>>({
    hat: null,
    eyes: null,
    accessory: SHOP_ITEMS.find(i => i.id === 'bowtie') || null
  });

  const handleEquip = (item: OutfitItem) => {
    setEquipped(prev => ({
      ...prev,
      [item.category]: prev[item.category]?.id === item.id ? null : item
    }));
    setMascotState('happy');
    setTimeout(() => setMascotState('idle'), 1500);
  };

  const handleBuy = (item: OutfitItem) => {
    if (coins >= item.price) {
      setCoins(prev => prev - item.price);
      item.owned = true;
      handleEquip(item);
    }
  };

  const handleCompleteQuest = (id: string) => {
    const quest = challenges.find(c => c.id === id);
    if (quest && !quest.completed) {
      setChallenges(prev => prev.map(c => c.id === id ? { ...c, completed: true, progress: c.target } : c));
      setCoins(prev => prev + quest.reward);
      setMascotState('happy');
      setShowReward(quest.reward);
      setTimeout(() => {
        setMascotState('idle');
        setShowReward(null);
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 pb-24 relative overflow-hidden">
      {/* Reward Popup Overlay */}
      {showReward && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="bg-white px-8 py-6 rounded-[40px] shadow-2xl border-4 border-amber-400 flex flex-col items-center animate-bounce">
            <PartyPopper className="text-amber-500 mb-2" size={48} />
            <h2 className="text-2xl font-black text-slate-800">Quest Done!</h2>
            <div className="flex items-center space-x-2 text-3xl font-black text-amber-500 mt-2">
              <Coins size={32} />
              <span>+{showReward}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="p-6 bg-white rounded-b-[40px] shadow-sm flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center relative">
            <Flame className="text-orange-500" size={24} />
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
               <div className="w-4 h-4 bg-orange-500 rounded-full text-[8px] flex items-center justify-center text-white font-black">{streak}</div>
            </div>
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">Streak On Fire</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Keep it up, Champ!</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm transition-all">
          <Coins className="text-amber-500" size={20} />
          <span className="font-black text-amber-700 tabular-nums">{coins}</span>
        </div>
      </div>

      {/* Hero Section - Mascot Display with Background Environment */}
      <div className="relative pt-6 pb-12 flex flex-col items-center">
        {/* Environment Background Elements */}
        {/* <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-100/50 to-transparent -z-20" /> */}
        {/* Background Image */}
        {/* Background Image */}
        <div
        className="absolute inset-0 bg-cover bg-center -z-100 h-[400px]"
        style={{ backgroundImage: `url(${sceneImg})`}}
        />
        
        {/* Soft Glowing Stage Backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/40 rounded-full blur-3xl -z-10 animate-pulse-soft" />
        
        {/* Decorative Floating Leaves */}
        <div className="absolute top-20 left-10 text-emerald-300 -z-10 animate-float" style={{ animationDelay: '0.5s' }}>
          <Leaf size={24} className="rotate-45" />
        </div>
        <div className="absolute bottom-40 right-10 text-emerald-300 -z-10 animate-float" style={{ animationDelay: '1.2s' }}>
          <Leaf size={20} className="-rotate-12" />
        </div>

        <div className="flex flex-col items-center mb-6 z-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lemmy</h1>
          <div className="flex space-x-1 mt-1">
            {[1,2,3,4,5].map(h => (
              <Heart key={h} className={h <= 4 ? "fill-red-500 text-red-500" : "text-slate-200"} size={16} />
            ))}
          </div>
        </div>

        <div onClick={() => setMascotState('happy')} className="cursor-pointer active:scale-95 transition-transform relative z-10">
          <Mascot 
            animationState={mascotState} 
            outfit={{
              hat: equipped.hat?.svgElement,
              eyes: equipped.eyes?.svgElement,
              accessory: equipped.accessory?.svgElement
            }} 
          />
        </div>
        
        <div className="mt-8 flex space-x-3 z-10">
          {/* <button 
            onClick={() => {
              setMascotState('thinking');
              setTimeout(() => setMascotState('idle'), 2000);
            }}
            className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 hover:scale-110 transition-all active:scale-90"
          >
            <Sparkles className="text-blue-400" />
          </button> */}
          <button 
            onClick={() => {
              setMascotState('happy');
              setTimeout(() => setMascotState('idle'), 1500);
            }}
            className="bg-emerald-500 px-10 py-4 rounded-3xl shadow-xl shadow-emerald-200 font-black text-sm text-white hover:scale-105 transition-all active:scale-95 flex items-center space-x-2"
          >
            <Heart size={16} className="fill-white" />
            <span>Pet Lemmy</span>
          </button>
          <button 
            onClick={() => setActiveTab('wardrobe')}
            className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 hover:scale-110 transition-all active:scale-90"
            aria-label="Visit Store"
          >
            <Store className="text-amber-500" />
          </button>
        </div>
      </div>

      {/* Gamification Tabs */}
      <div className="px-6 space-y-6">
        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-[28px] border border-white/50 shadow-inner">
          <button 
            onClick={() => setActiveTab('quest')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'quest' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-50' : 'text-slate-400'}`}
          >
            <Trophy size={16} />
            <span>Quests</span>
          </button>
          <button 
            onClick={() => setActiveTab('wardrobe')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'wardrobe' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-50' : 'text-slate-400'}`}
          >
            <ShoppingBag size={16} />
            <span>Style</span>
          </button>
        </div>

        {activeTab === 'quest' ? (
          <div className="space-y-4 pb-12">
            {challenges.map(quest => (
              <div 
                key={quest.id} 
                onClick={() => !quest.completed && handleCompleteQuest(quest.id)}
                className={`bg-white p-5 rounded-[36px] border border-slate-100 shadow-sm flex items-center space-x-4 transition-all ${quest.completed ? 'opacity-70 grayscale-[0.5]' : 'hover:border-emerald-200 cursor-pointer active:scale-[0.98]'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${quest.completed ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-300'}`}>
                  {quest.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 tracking-tight flex items-center space-x-2">
                    <span>{quest.title}</span>
                    {quest.completed && <Sparkles size={12} className="text-amber-500 fill-amber-500" />}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold leading-tight">{quest.description}</p>
                  <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${quest.completed ? 'bg-emerald-500' : 'bg-emerald-300'}`} 
                      style={{ width: `${(quest.progress/quest.target)*100}%` }} 
                    />
                  </div>
                </div>
                {!quest.completed && (
                  <div className="flex flex-col items-center justify-center bg-amber-50 px-3 py-2 rounded-2xl border border-amber-100">
                    <div className="flex items-center space-x-1 text-amber-600">
                      <Coins size={12} />
                      <span className="text-xs font-black">{quest.reward}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-12">
            {SHOP_ITEMS.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-[44px] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4 group">
                <div className="w-full aspect-square bg-slate-50 rounded-[32px] flex items-center justify-center relative overflow-hidden group-hover:bg-emerald-50 transition-colors">
                  <svg viewBox="0 0 200 200" className="w-full h-full scale-125 transition-transform group-hover:scale-150">
                    {item.svgElement}
                  </svg>
                  {equipped[item.category]?.id === item.id && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
                <div className="px-2">
                  <h3 className="font-black text-slate-800 text-sm truncate w-32">{item.name}</h3>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{item.category}</p>
                </div>
                
                {item.owned ? (
                  <button 
                    onClick={() => handleEquip(item)}
                    className={`w-full py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all ${equipped[item.category]?.id === item.id ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {equipped[item.category]?.id === item.id ? 'In Use' : 'Wear it'}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleBuy(item)}
                    disabled={coins < item.price}
                    className={`w-full py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 transition-all ${coins >= item.price ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 hover:scale-105' : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50'}`}
                  >
                    <Coins size={14} />
                    <span>{item.price}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pal;
