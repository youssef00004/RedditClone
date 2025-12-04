// FooterNavigation.jsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FooterNavigation({
  step,
  totalSteps,
  onBack,
  onNext,
  onClose,
  isNextDisabled,
  nextButtonText = "Next",
  showLegal = true,
}) {
  return (
    <div className="p-2  border-[#343536] bg-[#1a1a1b] sticky bottom-0">
      {showLegal && (
        <div className="text-xs text-gray-400 mb-4 text-center">
          By continuing, you agree to our
          <a href="#" className="text-blue-500 hover:text-blue-400 ml-1">
            Mod Code of Conduct
          </a>
          and acknowledge that you understand the
          <a href="#" className="text-blue-500 hover:text-blue-400 ml-1">
            Reddit Rules
          </a>
          .
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {[...Array(totalSteps)].map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index + 1 <= step ? "bg-blue-600" : "bg-gray-500"
              }`}
            ></div>
          ))}
        </div>

        <div className="flex space-x-2">
          {step > 1 && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-bold rounded-full transition-colors bg-gray-700 text-white hover:bg-gray-600 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>
          )}

          {step === 1 && (
            <button
              onClick={onClose}
              className="px-4 py-2 mr-2 text-sm font-medium text-white rounded-full hover:bg-gray-700 transition-colors justify-center"
            >
              Cancel
            </button>
          )}

          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors flex items-center ${
              !isNextDisabled
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
            }`}
          >
            {nextButtonText}
            {step < totalSteps && <ChevronRight className="w-4 h-4 ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}
