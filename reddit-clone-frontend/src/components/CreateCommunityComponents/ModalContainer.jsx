// ModalContainer.jsx
import React from "react";

export default function ModalContainer({ children, onClose, className = "" }) {
  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
      <div
        className={`bg-[#1a1a1b] text-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
