// ModalContainer.jsx
import React from "react";

export default function ModalContainer({ children, onClose, className = "" }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className={`bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg sm:rounded-xl md:rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[98vh] sm:max-h-[95vh] md:max-h-[90vh] flex flex-col relative ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
