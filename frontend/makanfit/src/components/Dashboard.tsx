import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { MealEntry, User, WeightEntry } from "../types/types";
import {
  Flame,
  ChevronRight,
  TrendingDown,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Activity,
} from "lucide-react";

interface DashboardProps {
  meals: MealEntry[];
  user: User;
  weightHistory: WeightEntry[];
  onNavigateToAddWeight: () => void;
}

type TimeRange = 7 | 30 | 90;
type TabType = "weight" | "nutrition";
type DashboardView = "main" | "bmi-detail";

const COLORS = {
  fat: "#FFE066",
  protein: "#FF9999",
  carbs: "#99E0FF",
  fiber: "#D5B4B4",
  background: "#F8FAFC",
};

// Shared card style so every panel looks consistent
const CARD = "bg-white rounded-3xl p-6 lg:p-7 shadow-sm border border-gray-100";
const CARD_TITLE = "text-slate-900 text-lg font-extrabold";

const Dashboard: React.FC<DashboardProps> = ({
  meals,
  user,
  weightHistory,
  onNavigateToAddWeight,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("weight");
  const [range, setRange] = useState<TimeRange>(7);
  const [view, setView] = useState<DashboardView>("main");

  const todaysMeals = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return meals.filter(
      (m) => new Date(m.createdAt).setHours(0, 0, 0, 0) === today,
    );
  }, [meals]);

  const totals = useMemo(() => {
    return todaysMeals.reduce(
      (acc, meal) => {
        meal.ingredients.forEach((ing) => {
          const n = ing.nutrients;
          acc.calories += n.calories;
          acc.protein += n.protein;
          acc.carbs += n.carbs;
          acc.fat += n.fat;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [todaysMeals]);

  const historicalData = useMemo(() => {
    const data = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getDate()}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
      const isToday = i === 0;
      data.push({
        date: dateStr,
        calories: isToday
          ? totals.calories
          : Math.floor(user.targetCalories * (0.8 + Math.random() * 0.4)),
        protein: isToday
          ? totals.protein
          : Math.floor(user.targetProtein * (0.7 + Math.random() * 0.5)),
        carbs: isToday
          ? totals.carbs
          : Math.floor(user.targetCarbs * (0.7 + Math.random() * 0.5)),
        fat: isToday
          ? totals.fat
          : Math.floor(user.targetFat * (0.7 + Math.random() * 0.5)),
      });
    }
    return data;
  }, [range, totals, user]);

  const weightChartData = useMemo(() => {
    const sorted = [...weightHistory].sort(
      (a, b) => a.recordedAt - b.recordedAt,
    );
    if (sorted.length === 0)
      return [{ date: "24/01", weight: user.currentWeight }];

    return sorted.map((entry) => ({
      date: new Date(entry.recordedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      }),
      weight: entry.weight,
    }));
  }, [weightHistory, user.currentWeight]);

  const macroDonutData = [
    { name: "fat", value: totals.fat, color: COLORS.fat },
    { name: "protein", value: totals.protein, color: COLORS.protein },
    { name: "carbs", value: totals.carbs, color: COLORS.carbs },
  ];

  const goalDonutData = [
    { name: "fat", value: user.targetFat, color: COLORS.fat + "40" },
    {
      name: "protein",
      value: user.targetProtein,
      color: COLORS.protein + "40",
    },
    { name: "carbs", value: user.targetCarbs, color: COLORS.carbs + "40" },
  ];

  const bmiData = useMemo(() => {
    // const heightInMeters = user.heightCm / 100;
    const heightInMeters = user.heightCm / 100;
    const bmi = user.currentWeight / (heightInMeters * heightInMeters);

    let category = "Healthy";
    let color = "#10B981"; // emerald-500
    if (bmi < 18.5) {
      category = "Underweight";
      color = "#0EA5E9"; // carbs color
    } else if (bmi < 25) {
      category = "Healthy";
      color = "#10B981";
    } else if (bmi < 30) {
      category = "Overweight";
      color = "#F59E0B"; // protein color
    } else {
      category = "Obese";
      color = "#EF4444"; // red
    }

    // Normalized position for slider (from 15 to 40)
    const min = 15;
    const max = 40;
    const position = Math.min(
      Math.max(((bmi - min) / (max - min)) * 100, 0),
      100,
    );

    return { bmi: bmi.toFixed(2), category, color, position };
  }, [user.currentWeight, user.heightCm]);

  const renderTimeToggle = () => (
    <div className="flex bg-slate-50 border border-gray-200 rounded-full p-1">
      {([7, 30, 90] as TimeRange[]).map((t) => (
        <button
          key={t}
          onClick={() => setRange(t)}
          className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
            range === t
              ? "bg-[#2D3E50] text-white shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {t} days
        </button>
      ))}
    </div>
  );

  /** Card header: title on the left, time toggle on the right (stacks on mobile) */
  const renderChartHeader = (title: string) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h3 className={CARD_TITLE}>{title}</h3>
      {renderTimeToggle()}
    </div>
  );

  const renderBmiDetail = () => (
    <div className="min-h-full bg-white flex flex-col animate-in slide-in-from-right duration-300">
      <header className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="mx-auto w-full max-w-4xl px-6 py-5 lg:py-6 flex items-center space-x-4">
          <button
            onClick={() => setView("main")}
            aria-label="Back to dashboard"
            className="p-2 bg-slate-50 rounded-full text-slate-900 hover:bg-slate-100 active:scale-90 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Understanding BMI
          </h2>
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-4xl p-6 lg:py-10 space-y-8 pb-24">
        <div className="flex flex-col items-center text-center space-y-4 py-4 lg:py-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
            <Activity size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Medical Disclaimer
            </p>
            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight px-4">
              Why we measure your BMI
            </h3>
          </div>
        </div>

        {/* Two columns on laptop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-emerald-600 mb-2">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Screening Tool
              </span>
            </div>
            <p className="text-slate-600 font-bold leading-relaxed">
              Body Mass Index (BMI) is a simple screening tool to categorize
              weight relative to height. While it is not a perfect diagnostic of
              individual health or body composition (like muscle vs fat), it
              remains a vital starting point.
            </p>
          </div>

          <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 space-y-4 shadow-sm">
            <h4 className="text-emerald-900 font-black text-lg">
              The Health Connection
            </h4>
            <p className="text-emerald-800/80 font-bold leading-relaxed">
              Extensive medical research indicates that individuals with a{" "}
              <span className="text-emerald-900 underline decoration-2 underline-offset-4">
                higher BMI range
              </span>{" "}
              have a statistically significant increased risk of developing
              chronic conditions, including:
            </p>
            <ul className="space-y-3 pt-2">
              {[
                "Type 2 Diabetes",
                "Hypertension (High Blood Pressure)",
                "Cardiovascular Diseases",
                "Certain types of Cancers",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center space-x-3 text-emerald-900 font-black text-sm"
                >
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4 px-2">
            Authority & Guidelines
          </p>
          <a
            href="https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-200 transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors">
                <ExternalLink
                  size={20}
                  className="text-slate-400 group-hover:text-emerald-500"
                />
              </div>
              <div className="text-left">
                <p className="font-black text-slate-800 text-sm">
                  WHO Guidelines
                </p>
                <p className="text-[10px] text-slate-400 font-bold">
                  World Health Organization
                </p>
              </div>
            </div>
            <ChevronRight
              size={20}
              className="text-slate-200 group-hover:text-emerald-500"
            />
          </a>
        </div>

        <div className="pt-4 lg:max-w-sm lg:mx-auto">
          <button
            onClick={() => setView("main")}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase text-xs tracking-widest"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );

  if (view === "bmi-detail") {
    return renderBmiDetail();
  }

  const macroProgress = [
    { label: 'Protein', value: totals.protein, target: user.targetProtein, color: COLORS.protein },
    { label: 'Carbs', value: totals.carbs, target: user.targetCarbs, color: COLORS.carbs },
    { label: 'Fat', value: totals.fat, target: user.targetFat, color: COLORS.fat },
  ];
 
  const calPct = Math.min((totals.calories / user.targetCalories) * 100, 100);

  const renderNutritionTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300 pb-20">
      {/* Daily Summary */}
      <div
        className={`${CARD} lg:col-span-5 flex flex-col justify-between gap-6`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-slate-400 uppercase text-[10px] tracking-widest font-black">
              Today's Progress
            </h2>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                {totals.calories}
              </span>
              <span className="text-gray-400 font-bold">
                / {user.targetCalories} kcal
              </span>
            </div>
            <p className="text-green-500 text-sm font-bold">
              {Math.max(user.targetCalories - totals.calories, 0)} kcal left
            </p>
          </div>
          <div className="relative h-20 w-20 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#F3F4F6"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#10B981"
                strokeWidth="6"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 - (213.6 * calPct) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center transform rotate-90">
              <Flame className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Macro progress bars */}
        <div className="space-y-4 border-t border-gray-100 pt-5">
          {macroProgress.map(m => {
            const pct = m.target > 0 ? Math.min((m.value / m.target) * 100, 100) : 0;
            return (
              <div key={m.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">{m.label}</span>
                  <span className="text-slate-400">
                    {Math.round(m.value)} / {m.target} g
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: m.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily consumption */}
      {/* <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900 font-extrabold text-lg">Daily Consumption</h3>
            <div className="flex space-x-1 bg-slate-50 p-1 rounded-full border border-slate-100">
                {[7, 30].map(r => (
                    <button key={r} onClick={() => setRange(r as any)} 
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${range === r ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>
                        {r}D
                    </button>
                ))}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                  { name: 'P', val: totals.protein, target: user.targetProtein, fill: COLORS.protein },
                  { name: 'F', val: totals.fat, target: user.targetFat, fill: COLORS.fat },
                  { name: 'C', val: totals.carbs, target: user.targetCarbs, fill: COLORS.carbs },
              ]}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis hide domain={[0, 'dataMax + 20']} />
                <Tooltip cursor={{fill: 'transparent'}} content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        return (
                            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs font-black">
                                {payload[0].value}g
                            </div>
                        );
                    }
                    return null;
                }} />
                <Bar dataKey="val" radius={[8, 8, 0, 0]} barSize={40} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div> */}

      {/* Goal Line Chart */}
      <div className={`${CARD} lg:col-span-7 space-y-4`}>
        {renderChartHeader("Goal (Cal)")}
        <div className="h-64 lg:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalData}
              margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                dy={10}
                minTickGap={16}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
              />
              <ReferenceLine
                y={user.targetCalories}
                stroke="#9CA3AF"
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#10B981"
                strokeWidth={3}
                dot={
                  range > 30
                    ? false
                    : {
                        r: 4,
                        fill: "#10B981",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Macronutrient Breakdown (%) */}
      <div className={`${CARD} lg:col-span-6 space-y-4`}>
        {renderChartHeader("Macronutrient Distribution (%)")}
        <div className="h-64 lg:h-72 w-full flex justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={goalDonutData}
                innerRadius="45%"
                outerRadius="62%"
                dataKey="value"
                stroke="none"
              >
                {goalDonutData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Pie
                data={macroDonutData}
                innerRadius="70%"
                outerRadius="90%"
                dataKey="value"
                stroke="none"
              >
                {macroDonutData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              My goal
            </p>
            <div className="h-12" />
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-4">
              My consumption
            </p>
          </div>
        </div>
      </div>

      {/* Macronutrient Average (g) */}
      <div className={`${CARD} lg:col-span-6 space-y-4`}>
        {renderChartHeader("Macronutrient average (g)")}
        <div className="h-64 lg:h-72 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                {
                  name: "fat",
                  value: totals.fat,
                  target: user.targetFat,
                  fill: COLORS.fat,
                },
                {
                  name: "protein",
                  value: totals.protein,
                  target: user.targetProtein,
                  fill: COLORS.protein,
                },
                {
                  name: "carbs",
                  value: totals.carbs,
                  target: user.targetCarbs,
                  fill: COLORS.carbs,
                },
                { name: "fiber", value: 5, target: 18, fill: COLORS.fiber },
              ]}
              margin={{ top: 20, right: 50, left: -20, bottom: 10 }}
            >
              <XAxis dataKey="name" hide />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
              />
              <ReferenceLine
                y={user.targetCarbs}
                stroke={COLORS.carbs}
                strokeDasharray="3 3"
                label={{
                  position: "right",
                  value: `${user.targetCarbs}g`,
                  fill: COLORS.carbs,
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={user.targetProtein}
                stroke={COLORS.protein}
                strokeDasharray="3 3"
                label={{
                  position: "right",
                  value: `${user.targetProtein}g`,
                  fill: COLORS.protein,
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={user.targetFat}
                stroke={COLORS.fat}
                strokeDasharray="3 3"
                label={{
                  position: "right",
                  value: `${user.targetFat}g`,
                  fill: COLORS.fat,
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={18}
                stroke={COLORS.fiber}
                strokeDasharray="3 3"
                label={{
                  position: "right",
                  value: `18g`,
                  fill: COLORS.fiber,
                  fontSize: 10,
                }}
              />

              {/* Layered Bar Effect */}
              <Bar
                dataKey="target"
                fill="#F3F4F6"
                barSize={40}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="value"
                barSize={40}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
              >
                {[
                  { fill: COLORS.fat },
                  { fill: COLORS.protein },
                  { fill: COLORS.carbs },
                  { fill: COLORS.fiber },
                ].map((entry, index) => (
                  <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center flex-wrap gap-4">
          {Object.entries(COLORS)
            .filter(([k]) => k !== "background")
            .map(([key, color]) => (
              <div key={key} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {key}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderWeightTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300 pb-20">
      {/* Weight Stats Header */}
      {/* <div className="bg-[#E6F4F1] p-6 -mx-4 -mt-4 space-y-6 border-b border-[#2D3E50]/5 md:p-10">
        <div className="flex justify-between items-center px-4">
          <div className="text-center">
            <p className="text-2xl font-black text-[#2D3E50]">{user.startWeight}kg</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Start weight</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#2D3E50]">{user.weight}kg</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Current weight</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#2D3E50]">{user.goalWeight}kg</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Goal weight</p>
          </div>
        </div>

        <button 
          onClick={onNavigateToAddWeight}
          className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
        >
          Add a weight entry
        </button>
      </div> */}

      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
        <div className="bg-emerald-500 rounded-[32px] lg:rounded-[40px] p-8 text-white space-y-6 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 font-bold uppercase text-[10px] tracking-widest">
                Goal Weight
              </p>
              <h3 className="text-3xl lg:text-4xl font-black">
                {user.goalWeight} kg
              </h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
          </div>
          <div className="flex justify-between border-t border-white/20 pt-6">
            <div className="text-center">
              <p className="text-2xl font-black">{user.startWeight}</p>
              <p className="text-[10px] font-bold uppercase opacity-60">
                Start Weight
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">{user.currentWeight}</p>
              <p className="text-[10px] font-bold uppercase opacity-60">
                Current Weight
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-100">
                {(user.currentWeight - user.goalWeight).toFixed(1)}
              </p>
              <p className="text-[10px] font-bold uppercase opacity-60">Left</p>
            </div>
          </div>
          <button
            onClick={onNavigateToAddWeight}
            className="w-full py-4 bg-white text-emerald-600 font-black rounded-3xl uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-50 active:scale-[0.98] transition-all"
          >
            Log New Weight
          </button>
        </div>

        {/* BMI Section */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900 font-black text-md tracking-tight">
              Your BMI
            </h3>
            <button
              onClick={() => setView("bmi-detail")}
              aria-label="Learn about BMI"
              className="text-slate-300 hover:text-emerald-500 transition-colors"
            >
              <HelpCircle size={20} />
            </button>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <span className="text-3xl font-black text-slate-900">
              {bmiData.bmi}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-bold text-sm">
                Your weight is
              </span>
              <span
                className="px-4 py-1 rounded-full text-white font-black text-[10px] uppercase tracking-wider"
                style={{ backgroundColor: bmiData.color }}
              >
                {bmiData.category}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="relative h-2 w-full rounded-full bg-slate-100 overflow-visible"
              style={{
                background:
                  "linear-gradient(to right, #0EA5E9 0%, #0EA5E9 14%, #10B981 14%, #10B981 40%, #F59E0B 40%, #F59E0B 60%, #EF4444 60%, #EF4444 100%)",
              }}
            >
              {/* The Indicator Pin */}
              <div
                className="absolute top-0 w-[4px] h-[24px] bg-slate-900 rounded-full shadow-sm transition-all duration-1000 ease-out -translate-x-1/2 -translate-y-[8px]"
                style={{ left: `${bmiData.position}%` }}
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              {[
                { label: "Underweight", color: "#0EA5E9" },
                { label: "Healthy", color: "#10B981" },
                { label: "Overweight", color: "#F59E0B" },
                { label: "Obese", color: "#EF4444" },
              ].map((item) => (
                <div key={item.label} className="flex items-center space-x-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weight Chart Card */}
      <div className="lg:col-span-7 space-y-6">
        <div className={`${CARD} space-y-4`}>
          <h3 className={CARD_TITLE}>Weight</h3>
          <div className="h-64 lg:h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weightChartData}
                margin={{ top: 20, right: 30, left: -20, bottom: 20 }}
              >
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  domain={["auto", "auto"]}
                />
                <ReferenceLine
                  y={user.goalWeight}
                  stroke="#9CA3AF"
                  strokeDasharray="5 5"
                  label={{
                    value: `${user.goalWeight}kg`,
                    position: "right",
                    fill: "#9CA3AF",
                    fontSize: 10,
                    fontWeight: "bold",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#2D3E50"
                  strokeWidth={2}
                  dot={{
                    r: 5,
                    fill: "#2D3E50",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weights Saved List */}
        <div className="space-y-3">
          <h3 className="text-slate-900 text-lg px-2 cursor-pointer flex items-center justify-between group font-extrabold">
            <span>Weight Logs</span>
          </h3>
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm lg:max-h-[26rem] overflow-y-auto">
            {weightHistory.length === 0 && (
              <p className="p-6 text-sm font-bold text-gray-400">
                No weight entries yet. Log your first weight to start tracking.
              </p>
            )}
            {weightHistory.map((entry, idx) => (
              <div
                key={entry.id}
                onClick={onNavigateToAddWeight}
                className={`flex items-center justify-between p-5 active:bg-gray-50 transition-colors cursor-pointer ${idx !== weightHistory.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <p className="text-xl font-bold text-gray-800">
                  {entry.weight}kg
                </p>
                <div className="flex items-center space-x-3">
                  <p className="text-sm font-bold text-gray-400">
                    {new Date(entry.recordedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const tabClass = (tab: TabType) =>
    `flex-1 lg:flex-none lg:px-16 py-4 text-xs font-black uppercase tracking-widest relative transition-all ${
      activeTab === tab ? "text-[#2D3E50]" : "text-gray-400 hover:text-gray-600"
    }`;

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      {/* Top tabs: full-width on mobile, centered on laptop */}
      <div className="bg-[#E6F4F1] sticky top-14 z-30">
        <div className="mx-auto w-full max-w-6xl flex lg:justify-center">
          <button
            onClick={() => setActiveTab("weight")}
            className={tabClass("weight")}
          >
            Weight
            {activeTab === "weight" && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2D3E50]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("nutrition")}
            className={tabClass("nutrition")}
          >
            Nutrition
            {activeTab === "nutrition" && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2D3E50]" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 w-full mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
        {activeTab === "weight" ? renderWeightTab() : renderNutritionTab()}
      </div>
    </div>
  );
};

export default Dashboard;
