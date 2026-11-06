import React from "react";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string | null;
}

const TermsCheckbox: React.FC<Props> = ({ checked, onChange, error }) => (
  <div className="px-1">
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={!!error}
        className="mt-0.5 w-4 h-4 shrink-0 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
      />
      <span className="text-xs text-gray-400 leading-relaxed font-medium">
        I agree to MakanFit's{" "}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 font-bold hover:underline"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 font-bold hover:underline"
        >
          Privacy Policy
        </a>
        .
      </span>
    </label>
    {error && (
      <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">
        {error}
      </p>
    )}
  </div>
);

export default TermsCheckbox;