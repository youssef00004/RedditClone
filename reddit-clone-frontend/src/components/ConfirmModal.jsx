import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  loadingText,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-black rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 bg-white dark:bg-black">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (loadingText || `${confirmText}ing...`) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
