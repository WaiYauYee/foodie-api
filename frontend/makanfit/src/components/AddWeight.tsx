
import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface AddWeightProps {
  currentWeight: number;
  onBack: () => void;
  onAdd: (weight: number) => void;
}

const AddWeight: React.FC<AddWeightProps> = ({ currentWeight, onBack, onAdd }) => {
  const [weight, setWeight] = useState(currentWeight.toString());

  const handleAdd = () => {
    const numericWeight = parseFloat(weight);
    if (!isNaN(numericWeight) && numericWeight > 0) {
      onAdd(numericWeight);
      onBack();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="px-4 py-5 flex items-center bg-[#E6F4F1] border-b border-gray-100">
        <button onClick={onBack} className="p-1 text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <h2 className="flex-1 text-center text-xl font-black text-gray-900 tracking-tight pl-4 tracking-widest text-sm">
          Add a weight entry
        </h2>
        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      {/* Date Selector Row */}
      <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-gray-50">
        <span className="text-lg font-bold text-[#2D3E50]">Today</span>
        <ChevronDown className="w-6 h-6 text-[#2D3E50]" />
      </div>

      {/* Main Entry Area */}
      <div className="flex-1 flex flex-col items-center justify-start pt-16 bg-white">
        <div className="flex items-center space-x-6">
          {/* Scale Icon Placeholder (Simplified SVG) */}
          <div className="w-24 h-24 bg-[#BEE3F8] rounded-2xl flex items-center justify-center relative shadow-inner overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/80 rounded-sm" />
            <div className="w-16 h-12 bg-white/40 rounded-full mt-4" />
          </div>

          <div className="flex items-end space-x-3">
            <div className="relative">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                autoFocus
                className="w-24 text-4xl font-bold text-[#2D3E50] bg-transparent text-center focus:outline-none border-b-2 border-[#2D3E50] pb-1"
              />
            </div>
            <span className="text-xl font-bold text-gray-400 mb-2">kg</span>
          </div>
        </div>

        {/* Add Button */}
        <div className="mt-16 w-full px-12">
          <button
            onClick={handleAdd}
            className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWeight;
