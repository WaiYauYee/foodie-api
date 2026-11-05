import React from "react";

interface Props {
  message: string | null;
  onClose: () => void;
}

const ErrorToast: React.FC<Props> = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed top-4 right-4 max-w-sm z-50 p-4 bg-red-50 border-l-4 border-red-500 rounded shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-red-800 flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ErrorToast;
