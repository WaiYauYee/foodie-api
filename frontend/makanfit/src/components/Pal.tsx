import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, Heart, Coins, ShoppingBag, Trophy, 
  CheckCircle2, Circle, 
  Sparkles, PartyPopper, 
  Eye,
  Shirt,
  X
} from 'lucide-react';
import Mascot from './Mascot';
import { Challenge, OutfitItem } from '../types/types';

const LEMMY_TIPS = [
  "Minum air kosong 2 liter hari ni okay? Keep glowing! ✨",
  "Ayam bakar & ulam-ulam is the Malaysian cheat code for lean protein! 🍗",
  "Consistency beats perfection every single day, champ! 🌟",
  "Log your meals right after eating so you never forget! 📝",
  "Craving teh tarik? Ask for 'kurang manis' or 'kosong' to save 120 kcal! ☕",
  "Hehe, that tickles! Thank you for petting me! ❤️",
  "Wah, your food logging streak is looking super steady! 🔥"
];

const INITIAL_CHALLENGES: Challenge[] = [
  { id: '1', title: 'Lets get started', description: 'Log one meals today', reward: 50, progress: 2, target: 3, completed: false, type: 'consistent' },
  { id: '2', title: 'Dress it', description: 'Change a new outfit', reward: 40, progress: 1, target: 1, completed: false, type: 'mindful' },
];

// const SPECIAL_CHALLENGES: Challenge[] = [
//   { id: '1', title: 'Stay Consistent', description: 'Log at least 10 meals', reward: 50, progress: 2, target: 3, completed: false, type: 'consistent' },
//   { id: '2', title: 'Eat Mindfully', description: 'Log a meal with 3+ balanced ingredients', reward: 40, progress: 1, target: 1, completed: false, type: 'mindful' },
//   { id: '3', title: 'Calorie Balance', description: 'Stay within your calorie goal today', reward: 80, progress: 1350, target: 1600, completed: false, type: 'balance' },
//   { id: '4', title: 'Hydration Hero', description: 'Drink at least 8 cups of water', reward: 30, progress: 6, target: 8, completed: false, type: 'mindful' },
// ];

const SHOP_ITEMS: OutfitItem[] = [
  { 
    id: 'shades', 
    name: 'Cool Shades', 
    price: 150, 
    category: 'eyes', 
    owned: false,
    svgElement: (
      <g transform="translate(107, 94)">
        <rect x="-30" y="-10" width="22" height="18" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
        <path d="M -26 -6 L -12 4" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <rect x="8" y="-10" width="22" height="18" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
        <path d="M 12 -6 L 26 4" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M -8 -4 Q 0 -8 8 -4" stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M -30 -4 L -38 -8" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
        <path d="M 30 -4 L 38 -8" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      </g>
    )
  },
  { 
    id: 'crown', 
    name: 'Royal Crown', 
    price: 350, 
    category: 'hat', 
    owned: false,
    svgElement: (
      <g transform="translate(100, 22)">
        <path d="M -26 6 L -30 -16 L -12 -4 L 0 -22 L 12 -4 L 30 -16 L 26 6 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="0" cy="-14" r="3.5" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />
        <circle cx="-18" cy="-10" r="2.5" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="0.8" />
        <circle cx="18" cy="-10" r="2.5" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="0.8" />
        <rect x="-24" y="6" width="48" height="4" rx="2" fill="#EAB308" />
      </g>
    )
  },
  { 
    id: 'bowtie', 
    name: 'Fancy Bowtie', 
    price: 120, 
    category: 'accessory', 
    owned: true,
    svgElement: (
      <g transform="translate(107, 126)">
        <path d="M 0 0 L -18 -8 Q -16 0 -18 8 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M 0 0 L 18 -8 Q 16 0 18 8 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" strokeLinejoin="round" />
        <ellipse cx="0" cy="0" rx="5" ry="6" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
        <circle cx="-1" cy="-1" r="1.5" fill="#FFFFFF" fillOpacity="0.6" />
      </g>
    )
  },
  { 
    id: 'chef_hat', 
    name: 'Chef Toque', 
    price: 250, 
    category: 'hat', 
    owned: false,
    svgElement: (
      <g transform="translate(100, 18)">
        <path d="M -22 6 L 22 6 L 20 0 L -20 0 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M -20 0 C -28 -12, -18 -26, -10 -22 C -6 -32, 6 -32, 10 -22 C 18 -26, 28 -12, 20 0 Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="-20" y="2" width="40" height="4" fill="#10B981" />
      </g>
    )
  },
  { 
    id: 'bungaraya', 
    name: 'Bunga Raya', 
    price: 200, 
    category: 'hat', 
    owned: false,
    svgElement: (
      <g transform="translate(74, 52)">
        <g transform="rotate(-15)">
          <circle cx="-6" cy="-4" r="7" fill="#E11D48" />
          <circle cx="6" cy="-4" r="7" fill="#E11D48" />
          <circle cx="-7" cy="5" r="7" fill="#E11D48" />
          <circle cx="7" cy="5" r="7" fill="#E11D48" />
          <circle cx="0" cy="-8" r="7" fill="#F43F5E" />
          <circle cx="0" cy="1" r="4" fill="#9F1239" />
          <path d="M 0 1 Q 4 10 12 12" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="12" cy="12" r="2.5" fill="#F59E0B" />
        </g>
      </g>
    )
  },
  { 
    id: 'halo', 
    name: 'Healthy Halo', 
    price: 500, 
    category: 'hat', 
    owned: false,
    svgElement: (
      <g transform="translate(100, 6)">
        <ellipse cx="0" cy="0" rx="36" ry="7" fill="none" stroke="#FDE047" strokeWidth="4" opacity="0.9" />
        <ellipse cx="0" cy="0" rx="36" ry="7" fill="none" stroke="#FACC15" strokeWidth="1.5" />
      </g>
    )
  }
];

export const Pal: React.FC = () => {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('makanfit_coins');
    return saved ? Number(saved) : 340;
  });

  const [streak] = useState(5);
  const [showOutfits, setShowOutfits] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [outfitCategory, setOutfitCategory] = useState<'all' | 'hat' | 'eyes' | 'accessory'>('all');
  const [shopCategory, setShopCategory] = useState<'all' | 'hat' | 'eyes' | 'accessory'>('all');
  
  // Close modal on Escape key and prevent background scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowOutfits(false);
        setShowShop(false);
        setPreviewItem(null);
      }
    };
    if (showOutfits || showShop) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showOutfits, showShop]);
  
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('makanfit_challenges');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CHALLENGES;
  });

  const [mascotState, setMascotState] = useState<'idle' | 'happy' | 'thinking' | 'petting'>('idle');
  const [showReward, setShowReward] = useState<{ amount: number; title: string } | null>(null);
  const [dialogue, setDialogue] = useState(LEMMY_TIPS[0]);
  // const [heartsCount, setHeartsCount] = useState(4);
  const [friendshipLevel, setFriendshipLevel] = useState(3);
  const [friendshipXp, setFriendshipXp] = useState(65);
  const [petNotice, setPetNotice] = useState<string | null>(null);

  const [purchaseItem, setPurchaseItem] = useState<OutfitItem | null>(null);
  // Equipped wardrobe state
  const [shopItems, setShopItems] = useState<OutfitItem[]>(() => {
    const saved = localStorage.getItem('makanfit_shop_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return SHOP_ITEMS.map(item => {
          const found = parsed.find((p: any) => p.id === item.id);
          return found ? { ...item, owned: found.owned } : item;
        });
      } catch (e) {
        console.error(e);
      }
    }
    return SHOP_ITEMS;
  });

  const [equipped, setEquipped] = useState<Record<string, OutfitItem | null>>(() => {
    const saved = localStorage.getItem('makanfit_equipped_ids');
    if (saved) {
      try {
        const ids: Record<string, string | null> = JSON.parse(saved);
        return {
          hat: SHOP_ITEMS.find(i => i.id === ids.hat) || null,
          eyes: SHOP_ITEMS.find(i => i.id === ids.eyes) || null,
          accessory: SHOP_ITEMS.find(i => i.id === ids.accessory) || null,
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      hat: null,
      eyes: null,
      accessory: SHOP_ITEMS.find(i => i.id === 'bowtie') || null
    };
  });

  // Live preview outfit (lets user test clothes on Lemmy)
  const [previewItem, setPreviewItem] = useState<OutfitItem | null>(null);

  // Sync coins
  useEffect(() => {
    localStorage.setItem('makanfit_coins', String(coins));
  }, [coins]);

  // Sync challenges
  useEffect(() => {
    localStorage.setItem('makanfit_challenges', JSON.stringify(challenges));
  }, [challenges]);

  // Sync shop items
  useEffect(() => {
    const serializable = shopItems.map(i => ({ id: i.id, owned: i.owned }));
    localStorage.setItem('makanfit_shop_items', JSON.stringify(serializable));
  }, [shopItems]);

  // Sync equipped
  useEffect(() => {
    const ids = {
      hat: equipped.hat?.id || null,
      eyes: equipped.eyes?.id || null,
      accessory: equipped.accessory?.id || null,
    };
    localStorage.setItem('makanfit_equipped_ids', JSON.stringify(ids));
  }, [equipped]);

  // Petting action
  const handlePetLemmy = () => {
    setMascotState('petting');
    const randomTip = LEMMY_TIPS[Math.floor(Math.random() * LEMMY_TIPS.length)];
    setDialogue(randomTip);
    
    // Add XP
    setFriendshipXp(prev => {
      const next = prev + 10;
      if (next >= 100) {
        setFriendshipLevel(lvl => lvl + 1);
        setCoins(c => c + 25);
        setPetNotice('Level Up! Lemmy loves you more! +25 🪙');
        return next - 100;
      }
      setPetNotice('Petting +10 XP ❤️');
      return next;
    });

    setTimeout(() => {
      setPetNotice(null);
    }, 1800);

    setTimeout(() => {
      setMascotState('idle');
    }, 1200);
  };

  // Treat feeding action
  // const handleFeedTreat = () => {
  //   setMascotState('happy');
  //   setDialogue("Yum! Fresh papaya slices! Low GI and packed with vitamin C! 🍈✨");
  //   setCoins(c => c + 15);
  //   setFriendshipXp(prev => Math.min(100, prev + 15));
  //   setHeartsCount(5);
  //   setPetNotice('Healthy Treat Fed! +15 🪙 +15 XP');

  //   setTimeout(() => {
  //     setPetNotice(null);
  //   }, 2000);

  //   setTimeout(() => {
  //     setMascotState('idle');
  //   }, 1500);
  // };

  const handleEquip = (item: OutfitItem) => {
    setEquipped(prev => ({
      ...prev,
      [item.category]: prev[item.category]?.id === item.id ? null : item
    }));
    setPreviewItem(null);
    setMascotState('happy');
    setDialogue(`Looking smart in ${item.name}! Sedap mata memandang! 😎`);
    setTimeout(() => setMascotState('idle'), 1500);
  };

  const handleUnequipAll = () => {
    setEquipped({ hat: null, eyes: null, accessory: null });
    setPreviewItem(null);
    setDialogue("All accessories taken off! Lemmy feels breezy and light! 🍃");
  };

  const handleBuy = (item: OutfitItem) => {
    if (coins >= item.price) {
      setCoins(prev => prev - item.price);
      setShopItems(prev => prev.map(i => i.id === item.id ? { ...i, owned: true } : i));
      item.owned = true;
      handleEquip(item);
    }
  };

  const handlePreview = (item: OutfitItem) => {
    if (previewItem?.id === item.id) {
      setPreviewItem(null);
    } else {
      setPreviewItem(item);
      setMascotState('happy');
      setDialogue(`Trying on ${item.name}! How do I look? ✨`);
      setTimeout(() => setMascotState('idle'), 1200);
    }
  };

  const handleCompleteQuest = (id: string) => {
    const quest = challenges.find(c => c.id === id);
    if (quest && !quest.completed) {
      setChallenges(prev => prev.map(c => c.id === id ? { ...c, completed: true, progress: c.target } : c));
      setCoins(prev => prev + quest.reward);
      setMascotState('happy');
      setDialogue(`Mantap! Quest completed! +${quest.reward} coins earned! 🎉`);
      setShowReward({ amount: quest.reward, title: quest.title });
      setTimeout(() => {
        setMascotState('idle');
        setShowReward(null);
      }, 2400);
    }
  };

  // Compile active outfit including any temporary live preview
  const currentOutfit = {
    hat: (previewItem?.category === 'hat' ? previewItem : equipped.hat)?.svgElement,
    eyes: (previewItem?.category === 'eyes' ? previewItem : equipped.eyes)?.svgElement,
    accessory: (previewItem?.category === 'accessory' ? previewItem : equipped.accessory)?.svgElement,
  };

  const ownedItems = useMemo(() => shopItems.filter(i => i.owned), [shopItems]);
  // const unownedItems = useMemo(() => shopItems.filter(i => !i.owned), [shopItems]);

  const filteredOwnedItems = useMemo(() => {
    if (outfitCategory === 'all') return ownedItems;
    return ownedItems.filter(i => i.category === outfitCategory);
  }, [ownedItems, outfitCategory]);

  const filteredShopItems = useMemo(() => {
    if (shopCategory === 'all') return shopItems;
    return shopItems.filter(i => i.category === shopCategory);
  }, [shopItems, shopCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0FDF4] via-[#F8FAFC] to-[#F1F5F9] pb-28 relative overflow-hidden select-none">
      {/* Reward Popup Overlay */}
      {showReward && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xs transition-opacity">
          <div className="bg-white px-8 py-7 rounded-[32px] shadow-2xl border border-amber-200 flex flex-col items-center text-center animate-in zoom-in-95 duration-200 max-w-xs w-full">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-3 border border-amber-100 shadow-inner">
              <PartyPopper size={36} />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Quest Complete!</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">{showReward.title}</p>
            <div className="flex items-center space-x-2 text-3xl font-black text-amber-500 my-4 bg-amber-50/80 px-6 py-2.5 rounded-2xl border border-amber-100/60">
              <Coins size={30} className="fill-amber-400" />
              <span>+{showReward.amount}</span>
            </div>
            <button
              onClick={() => setShowReward(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              Collect & Continue
            </button>
          </div>
        </div>
      )}

      {/* Floating Petting / XP Notice */}
      {petNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center space-x-2 animate-bounce">
            <Sparkles size={14} className="text-amber-400" />
            <span>{petNotice}</span>
          </div>
        </div>
      )}

      {/* Header Stats Bar */}
      <div className="px-5 py-4 bg-white/80 backdrop-blur-md rounded-b-[28px] border-b border-emerald-100/60 shadow-xs flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-400 to-amber-300 rounded-2xl flex items-center justify-center relative shadow-xs">
            <Flame className="text-white fill-white" size={20} />
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
              <div className="w-4 h-4 bg-orange-600 rounded-full text-[9px] flex items-center justify-center text-white font-black">{streak}</div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <p className="text-sm font-black text-slate-800">5-Day Streak</p>
              <span className="text-[10px] bg-orange-100 text-orange-700 font-extrabold px-1.5 py-0.5 rounded-md">🔥 On Fire</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Log meals today to keep it</p>
          </div>
        </div>

        {/* Currency Pill */}
        <div className="flex items-center space-x-1.5 bg-amber-50 px-3.5 py-2 rounded-2xl border border-amber-200/80 shadow-xs">
          <Coins className="text-amber-500 fill-amber-400" size={18} />
          <span className="font-black text-amber-800 text-sm tabular-nums">{coins}</span>
        </div>
      </div>

      {/* Hero Section: Interactive Lemmy Stage */}
      <div className="relative pt-4 pb-8 flex flex-col items-center px-4">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-tr from-emerald-200/40 via-teal-100/30 to-amber-100/30 rounded-full blur-3xl -z-10" />

        {/* Lemmy Title & Level */}
        <div className="flex flex-col items-center mb-3 z-10 text-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Lemmy</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
              Lvl {friendshipLevel} Companion
            </span>
          </div>

          {/* Hearts & XP Meter */}
          <div className="flex items-center space-x-3 mt-1.5">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(h => (
                <Heart 
                  key={h} 
                  className={`transition-colors duration-300 ${h <= 4 ? "fill-rose-500 text-rose-500" : "text-slate-200"}`} 
                  size={14} 
                />
              ))}
            </div>
            <div className="w-24 h-2 bg-slate-200/80 rounded-full overflow-hidden" title={`Friendship XP: ${friendshipXp}/100`}>
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${friendshipXp}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">{friendshipXp}xp</span>
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="relative mb-2 max-w-xs px-4 py-2.5 bg-white/95 rounded-2xl shadow-sm border border-emerald-100/80 text-xs font-semibold text-slate-700 text-center z-10 transition-all duration-300">
          <p className="leading-snug">{dialogue}</p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-emerald-100/80 rotate-45" />
        </div>

        {/* Preview Notice Pill */}
        {previewItem && (
          <div className="mt-1 mb-2 z-10 flex items-center space-x-1.5 bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <Eye size={13} />
            <span>Previewing: {previewItem.name}</span>
            <button 
              onClick={() => setPreviewItem(null)} 
              className="text-sky-500 hover:text-sky-800 ml-1 text-xs cursor-pointer font-black"
            >
              ✕
            </button>
          </div>
        )}

        {/* Interactive Mascot */}
        <div className="relative z-10">
          <Mascot 
            animationState={mascotState} 
            outfit={currentOutfit}
            onPet={handlePetLemmy}
          />
        </div>
        
        {/* Quick Action Buttons */}
        <div className="mt-4 flex items-center space-x-3 z-10">
          <button 
            onClick={handlePetLemmy}
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-2xl shadow-md shadow-emerald-600/20 font-bold text-xs text-white hover:scale-102 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Heart size={15} className="fill-white" />
            <span>Pet Lemmy</span>
          </button>

          {/* 'My Outfits' Button - OPENS MODAL POPUP */}
          <button 
            id="my-outfits-btn"
            onClick={() => {
              setShowOutfits(true);
              setPreviewItem(null);
            }}
            className="bg-white hover:bg-emerald-50 px-4 py-3 rounded-2xl shadow-xs border border-emerald-100 text-emerald-800 font-bold text-xs hover:scale-102 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
            title="Open My Outfits closet modal"
          >
            <Shirt size={15} className="text-emerald-600" />
            <span>My Outfits</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {ownedItems.length}
            </span>
          </button>

          {/* Boutique Shop button - OPENS MODAL POPUP */}
          <button 
            id="shop-btn"
            onClick={() => {
              setShowShop(true);
              setPreviewItem(null);
            }}
            className="bg-white hover:bg-amber-50 px-4 py-3 rounded-2xl shadow-xs border border-amber-200/80 text-amber-900 font-bold text-xs hover:scale-102 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
            title="Open Boutique Shop modal"
          >
            <ShoppingBag size={15} className="text-amber-600" />
            {/* <span>Shop</span> */}
          </button>
        </div>
      </div>

      {/* Gamification Navigation Tabs */}
      <div className="px-5 space-y-4 max-w-md mx-auto">
        {/* <div className="flex bg-slate-200/60 p-1 rounded-2xl border border-slate-200/50">
          <button 
            onClick={() => { setActiveTab('quest'); setPreviewItem(null); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'quest' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Trophy size={15} />
            <span>Daily Quests</span>
          </button>
          <button 
            onClick={() => setActiveTab('wardrobe')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'wardrobe' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <ShoppingBag size={15} />
            <span>Wardrobe & Shop</span>
          </button>
        </div> */}

        {/* Quests missions View */}
        <div className="space-y-3 pb-8">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-1.5">
              <Trophy size={14} className="text-amber-500" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Missions</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700">
              {challenges.filter(c => c.completed).length} / {challenges.length} Done
            </span>
          </div>

          {challenges.map(quest => {
            const isReadyToComplete = !quest.completed && quest.progress >= quest.target;
            return (
              <div 
                key={quest.id} 
                onClick={() => !quest.completed && handleCompleteQuest(quest.id)}
                className={`bg-white p-4 rounded-2xl border transition-all duration-200 flex items-center space-x-3.5 shadow-xs ${
                  quest.completed 
                    ? 'border-slate-100 bg-slate-50/60 opacity-80' 
                    : isReadyToComplete
                    ? 'border-emerald-300 ring-2 ring-emerald-400/20 hover:border-emerald-400 cursor-pointer active:scale-98'
                    : 'border-slate-200 hover:border-emerald-200 cursor-pointer active:scale-98'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  quest.completed 
                    ? 'bg-emerald-500 text-white' 
                    : isReadyToComplete
                    ? 'bg-amber-100 text-amber-600 animate-pulse'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {quest.completed ? (
                    <CheckCircle2 size={22} className="stroke-[2.5]" />
                  ) : (
                    <Circle size={22} className="stroke-[2]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{quest.title}</h3>
                    {quest.completed && <Sparkles size={13} className="text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">{quest.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mt-2.5 flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${quest.completed ? 'bg-emerald-500' : 'bg-emerald-400'}`} 
                        style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                      {quest.progress}/{quest.target}
                    </span>
                  </div>
                </div>

                {/* Reward Action */}
                <div className="shrink-0 flex flex-col items-end">
                  {quest.completed ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      Claimed
                    </span>
                  ) : (
                    <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                      <Coins size={14} className="text-amber-500 fill-amber-400" />
                      <span className="text-xs font-black text-amber-700">+{quest.reward}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quests special missions View */}
        <div className="space-y-3 pb-8">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-1.5">
              <Trophy size={14} className="text-amber-500" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Extra Missions</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700">
              {challenges.filter(c => c.completed).length} / {challenges.length} Done
            </span>
          </div>

          {challenges.map(quest => {
            const isReadyToComplete = !quest.completed && quest.progress >= quest.target;
            return (
              <div 
                key={quest.id} 
                onClick={() => !quest.completed && handleCompleteQuest(quest.id)}
                className={`bg-white p-4 rounded-2xl border transition-all duration-200 flex items-center space-x-3.5 shadow-xs ${
                  quest.completed 
                    ? 'border-slate-100 bg-slate-50/60 opacity-80' 
                    : isReadyToComplete
                    ? 'border-emerald-300 ring-2 ring-emerald-400/20 hover:border-emerald-400 cursor-pointer active:scale-98'
                    : 'border-slate-200 hover:border-emerald-200 cursor-pointer active:scale-98'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  quest.completed 
                    ? 'bg-emerald-500 text-white' 
                    : isReadyToComplete
                    ? 'bg-amber-100 text-amber-600 animate-pulse'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {quest.completed ? (
                    <CheckCircle2 size={22} className="stroke-[2.5]" />
                  ) : (
                    <Circle size={22} className="stroke-[2]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{quest.title}</h3>
                    {quest.completed && <Sparkles size={13} className="text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">{quest.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mt-2.5 flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${quest.completed ? 'bg-emerald-500' : 'bg-emerald-400'}`} 
                        style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                      {quest.progress}/{quest.target}
                    </span>
                  </div>
                </div>

                {/* Reward Action */}
                <div className="shrink-0 flex flex-col items-end">
                  {quest.completed ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      Claimed
                    </span>
                  ) : (
                    <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                      <Coins size={14} className="text-amber-500 fill-amber-400" />
                      <span className="text-xs font-black text-amber-700">+{quest.reward}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
      {/* ========================================================================= */}
      {/* MODAL POPUP: MY OUTFITS                                                   */}
      {/* ========================================================================= */}
      {showOutfits && (
        <div
          id="pal-modal-backdrop"
          onClick={() => {
            setShowOutfits(false);
            setPreviewItem(null);
          }}
          className="fixed inset-0 z-50 bg-white animate-in fade-in duration-200 border border-black"
        >
          <div
            id="pal-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full h-full flex flex-col animate-in fade-in duration-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-5 pt-3 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-100 text-emerald-700"
                >
                  <Shirt size={20} />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-slate-800 tracking-tight">
                      My Outfits
                    </h2>

                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {ownedItems.length} owned
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-medium">
                      Customise mascot's accessories
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="close-pal-modal-btn"
                  onClick={() => {
                    setShowOutfits(false);
                    setPreviewItem(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <Mascot 
                className="w-32 h-36 sm:w-64 sm:h-72" 
                animationState={mascotState} 
                outfit={currentOutfit}
                onPet={handlePetLemmy}
              />
            </div>

            {/* Fitting Room Mini Preview & Current Look Bar */}
            <div className="px-5 pt-2.5 shrink-0">
              <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-amber-50/50 rounded-2xl p-2.5 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                        Wearing:
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {([equipped.hat?.name, equipped.eyes?.name, equipped.accessory?.name].filter(Boolean).join(', ') || 'Natural Look (No accessories)')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                  {(equipped.hat || equipped.eyes || equipped.accessory) && (
                    <button
                      onClick={handleUnequipAll}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 cursor-pointer active:scale-95"
                    >
                      Unequip All
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="px-5 pt-3 pb-2 shrink-0">
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                {(['all', 'hat', 'eyes', 'accessory'] as const).map(cat => {
                  return (
                    <button
                      key={cat}
                      onClick={() => { setOutfitCategory(cat); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                        outfitCategory === cat
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all'
                        ? 'All Owned'
                        : cat === 'hat'
                        ? 'Hats & Headwear'
                        : cat === 'eyes'
                        ? 'Eyewear'
                        : 'Accessories'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body: Scrollable Grid */}
            <div className="px-5 py-2 overflow-y-auto flex-1 min-h-0 space-y-3 pb-6">
              {
                // VIEW: MY OUTFITS CLOSET
                filteredOwnedItems.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {filteredOwnedItems.map(item => {
                      const isEquipped = equipped[item.category]?.id === item.id;
                      const isPreviewing = previewItem?.id === item.id;

                      return (
                        <div 
                          key={item.id}
                          className={`bg-white p-3 rounded-2xl border transition-all flex flex-col items-center text-center shadow-xs relative ${
                            isEquipped 
                              ? 'border-emerald-500 ring-2 ring-emerald-400/25 bg-emerald-50/20' 
                              : isPreviewing
                              ? 'border-sky-400 ring-2 ring-sky-400/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div 
                            onClick={() => handleEquip(item)}
                            className="w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-emerald-50/50 transition-colors"
                            title="Tap to wear or remove"
                          >
                            <svg viewBox="0 0 200 200" className="w-full h-full scale-110 transition-transform group-hover:scale-125">
                              {item.svgElement}
                            </svg>
                            
                            {isEquipped && (
                              <div className="absolute top-1.5 right-1.5 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                                <CheckCircle2 size={12} className="stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="mt-2 w-full">
                            <h3 className="font-bold text-slate-800 text-xs truncate">{item.name}</h3>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{item.category}</p>
                          </div>
                          
                          <div className="mt-2.5 w-full">
                            <button 
                              onClick={() => handleEquip(item)}
                              className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                isEquipped 
                                  ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs' 
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isEquipped ? 'Wearing (Remove)' : 'Wear It'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-2.5 my-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <Shirt size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">No items in this category yet</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Keep logging meals and earn coins to unlock new outfits</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowOutfits(false);
                        setShowShop(true);
                        setPreviewItem(null);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Go to Shop
                    </button>
                  </div>
                )
              }
            </div>
          </div>
        </div>
      )}

      {showShop && (
        <div
          id="pal-shop-backdrop"
          onClick={() => {
            setShowShop(false);
            setPreviewItem(null);
          }}
          className="fixed inset-0 z-50 bg-white animate-in fade-in duration-200"
        >
          <div
            id="pal-shop-dialog"
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full h-full flex flex-col overflow-hidden animate-in fade-in duration-200"
          >
            {/* Drag Handle for mobile */}
            <div className="w-12 h-1.5 bg-slate-200 mx-auto mt-3 mb-1 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="px-5 pt-3 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-100 text-amber-700"
                >
                  <ShoppingBag size={20} />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-slate-800 tracking-tight">
                      Shop
                    </h2>
                      <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {shopItems.length} Items
                      </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-medium">
                    Spend quest coins on Malaysian looks
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                  <Coins size={14} className="text-amber-500 fill-amber-400" />
                  <span className="text-xs font-black text-amber-800 tabular-nums">
                    {coins}
                  </span>
                </div>

                <button
                  id="close-pal-modal-btn"
                  onClick={() => {
                    setShowShop(false);
                    setPreviewItem(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="px-5 pt-3 pb-2 shrink-0">
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                {(['all', 'hat', 'eyes', 'accessory'] as const).map(cat => {
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                          setShopCategory(cat);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                        shopCategory === cat
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all'
                        ? 'All Items'
                        : cat === 'hat'
                        ? 'Hats & Headwear'
                        : cat === 'eyes'
                        ? 'Eyewear'
                        : 'Accessories'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body: Scrollable Grid */}
            <div className="px-5 py-2 overflow-y-auto flex-1 space-y-3 pb-6">
              {showShop ? (
                /* VIEW: BOUTIQUE SHOP */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {filteredShopItems.map(item => {
                    const isEquipped = equipped[item.category]?.id === item.id;
                    const isPreviewing = previewItem?.id === item.id;

                    return (
                      <div 
                        key={item.id} 
                        className={`bg-white p-3 rounded-2xl border transition-all flex flex-col items-center text-center shadow-xs ${
                          isEquipped 
                            ? 'border-emerald-400 ring-2 ring-emerald-400/20' 
                            : isPreviewing
                            ? 'border-sky-400 ring-2 ring-sky-400/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div 
                          onClick={() => handlePreview(item)}
                          className="w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-emerald-50/50 transition-colors"
                          title="Tap to preview on Lemmy"
                        >
                          <svg viewBox="0 0 200 200" className="w-full h-full scale-110 transition-transform group-hover:scale-125">
                            {item.svgElement}
                          </svg>
                          
                          {isEquipped && (
                            <div className="absolute top-1.5 right-1.5 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                              <CheckCircle2 size={12} className="stroke-[3]" />
                            </div>
                          )}

                          {isPreviewing && !isEquipped && (
                            <div className="absolute top-1.5 left-1.5 bg-sky-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                              Preview
                            </div>
                          )}
                        </div>

                        <div className="mt-2 w-full">
                          <h3 className="font-bold text-slate-800 text-xs truncate">{item.name}</h3>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{item.category}</p>
                        </div>
                        
                        <div className="mt-2.5 w-full space-y-1">
                          {!item.owned && (
                            <button 
                              onClick={() => setPurchaseItem(item)}
                              className="w-full py-1.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer bg-amber-500 hover:bg-amber-600 text-white shadow-xs active:scale-95"
                            >
                              <Coins size={12} className="fill-white" />
                              <span>{item.price}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL POPUP: CONFIRM PURCHASE                                             */}
      {/* ========================================================================= */}
      {purchaseItem && (
        <div
          id="pal-purchase-backdrop"
          onClick={() => setPurchaseItem(null)}
          className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            id="pal-purchase-dialog"
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Title */}
            <div className="px-6 pt-6 text-center">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                Purchase this item
              </h2>

              <p className="text-xs text-slate-400 font-medium mt-1">
                See how Lemmy looks with it first!
              </p>
            </div>

            {/* Mascot Try-On Preview */}
            <div className="flex justify-center items-center py-3">
              <Mascot
                className="w-44 h-52"
                animationState="happy"
                outfit={{
                  hat:
                    purchaseItem.category === 'hat'
                      ? purchaseItem.svgElement
                      : equipped.hat?.svgElement,

                  eyes:
                    purchaseItem.category === 'eyes'
                      ? purchaseItem.svgElement
                      : equipped.eyes?.svgElement,

                  accessory:
                    purchaseItem.category === 'accessory'
                      ? purchaseItem.svgElement
                      : equipped.accessory?.svgElement,
                }}
              />
            </div>

            {/* Selected Item */}
            <div className="px-6 pb-4 text-center">
              <h3 className="text-sm font-black text-slate-800">
                {coins >= purchaseItem.price
                ? `Purchase ${purchaseItem.name}?`
                : `You don't have enough coins to buy ${purchaseItem.name}.`}
              </h3>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 space-y-2.5">
              <button
                onClick={() => {
                  handleBuy(purchaseItem);
                  setPurchaseItem(null);
                }}
                disabled={coins < purchaseItem.price}
                className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  coins >= purchaseItem.price
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Coins
                  size={17}
                  className={coins >= purchaseItem.price ? 'fill-white' : ''}
                />

                {coins >= purchaseItem.price
                  ? `Purchase with ${purchaseItem.price} coins`
                  : 'Not enough coins'}
              </button>

              <button
                onClick={() => setPurchaseItem(null)}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                Don't buy
              </button>
            </div>
          </div>
        </div>
      )}
        
      </div>
    </div>
  );
};

export default Pal;

