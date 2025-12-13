// CommunityPopup3.jsx
import React, { useState, useEffect } from "react";
import { X, Info, CheckCircle, Loader2 } from "lucide-react";

const CommunityCardPreview = ({ name, description }) => {
  const displayCommunityName = name.length > 0 ? name : "communityname";
  const displayDescription =
    description.length > 0 ? description : "Your community description";

  return (
    <div className="p-3 sm:p-4 bg-gray-100 dark:bg-zinc-900 rounded-xl shadow-lg space-y-3 border border-gray-300 dark:border-zinc-800">
      <div className="flex items-center">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            r/{displayCommunityName}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            1 weekly visitor · 1 weekly contributor
          </p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words line-clamp-3">
        {displayDescription}
      </p>
    </div>
  );
};

export default function CommunityPopup3({
  data = {},
  updateData,
  onNext,
  onClose,
  loading = false,
}) {
  const [name, setName] = useState(data.name || "");
  const [description, setDescription] = useState(data.description || "");

  const [nameError, setNameError] = useState("");
  const [isNameAvailable, setIsNameAvailable] = useState(false);

  const NAME_MAX_LENGTH = 21;
  const DESC_MAX_LENGTH = 500;

  useEffect(() => {
    setName(data.name || "");
    setDescription(data.description || "");
  }, [data.name, data.description]);

  useEffect(() => {
    let error = "";
    let available = false;

    if (name.length === 0) {
      // no message
    } else if (name.length < 3 || name.length > NAME_MAX_LENGTH) {
      error = `Community names must be between 3–${NAME_MAX_LENGTH} characters.`;
    } else if (!/^[a-zA-Z0-9_]*$/.test(name)) {
      error =
        "Community names can only contain letters, numbers, and underscores.";
    } else if (["test", "admin", "mod"].includes(name.toLowerCase())) {
      error = "This community name is already taken.";
    } else {
      available = true;
    }

    setNameError(error);
    setIsNameAvailable(available);
  }, [name]);

  const isNameValid =
    name.length >= 3 &&
    name.length <= NAME_MAX_LENGTH &&
    /^[a-zA-Z0-9_]*$/.test(name);
  const isDescriptionValid = description.length > 0;
  const isReady = isNameValid && isNameAvailable && isDescriptionValid;

  const handleNextClick = () => {
    if (!isReady || loading) return;
    updateData?.({ name, description });
    onNext?.({ name, description });
  };

  return (
    <>
      {/* Header */}
      <div className="p-3 sm:p-4 flex justify-between items-start sticky top-0 bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 z-10">
        <div className="flex-1 pr-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Create a community
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            A name and description help people understand what your community is
            all about.
          </p>
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="p-3 sm:p-4 md:p-6 overflow-y-auto flex-grow flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="flex flex-col w-full lg:w-3/5 space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="community-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Community Name
            </label>
            <div className="relative">
              <input
                id="community-name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                      .trim()
                      .replace(/\s/g, "")
                      .slice(0, NAME_MAX_LENGTH)
                  )
                }
                placeholder="community name *"
                disabled={loading}
                className={`w-full py-2.5 sm:py-3 pl-3 sm:pl-4 pr-12 bg-white dark:bg-zinc-900 border rounded-lg sm:rounded-xl focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 text-sm sm:text-base ${
                  nameError
                    ? "border-red-500 focus:ring-2 focus:ring-red-500"
                    : "border-gray-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }`}
                maxLength={NAME_MAX_LENGTH}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                {NAME_MAX_LENGTH - name.length}
              </span>
            </div>

            {nameError && (
              <p className="flex items-center text-sm text-red-500 pt-1">
                <Info className="w-4 h-4 mr-1 flex-shrink-0" />
                {nameError}
              </p>
            )}
            {isNameAvailable && name.length >= 3 && !nameError && (
              <p className="flex items-center text-sm text-green-500 pt-1">
                <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                r/{name} is available!
              </p>
            )}
          </div>

          <div className="space-y-2 flex-grow flex flex-col">
            <label
              htmlFor="community-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <div className="relative flex-grow">
              <textarea
                id="community-description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value.slice(0, DESC_MAX_LENGTH))
                }
                placeholder="Tell people what your community is about *"
                rows={6}
                disabled={loading}
                className={`w-full p-3 sm:p-4 bg-white dark:bg-zinc-900 border rounded-lg focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none flex-grow disabled:opacity-50 text-sm sm:text-base ${
                  !isDescriptionValid && description.length > 0
                    ? "border-red-500 focus:ring-2 focus:ring-red-500"
                    : "border-gray-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }`}
                maxLength={DESC_MAX_LENGTH}
              ></textarea>
              <span className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">
                {description.length}/{DESC_MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/5 lg:sticky lg:top-6 h-fit">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Preview
          </h3>
          <CommunityCardPreview name={name} description={description} />
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-black">
        <div className="flex gap-2 sm:gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleNextClick}
            disabled={!isReady || loading}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Community"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
