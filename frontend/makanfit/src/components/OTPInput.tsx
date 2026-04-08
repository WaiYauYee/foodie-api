
import React, { useRef, useState, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, value, onChange }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Update internal state if external value changes (e.g., reset)
  useEffect(() => {
    if (value === "") {
      setOtp(new Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isNaN(Number(val))) return;

    const newOtp = [...otp];
    // Take only the last character entered
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    
    const combinedOtp = newOtp.join("");
    onChange(combinedOtp);

    // Move to next input if value is entered
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous field
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    pasteData.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Focus last filled or first empty
    const nextIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          // Fix: Ensure ref callback returns void to satisfy TypeScript's Ref type definition.
          // Also check for element existence before assigning to ref array.
          ref={(el) => {
            if (el) {
              inputRefs.current[index] = el;
            }
          }}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`
            w-12 h-14 md:w-14 md:h-16 
            text-2xl md:text-3xl font-black text-center 
            bg-white border-2 border-gray-100 rounded-xl
            shadow-[0_4px_0_0_#e2e8f0]
            focus:outline-none focus:border-emerald-500 focus:shadow-[0_4px_0_0_#10b981]
            transition-all duration-200
            text-gray-800
          `}
        />
      ))}
    </div>
  );
};

export default OTPInput;