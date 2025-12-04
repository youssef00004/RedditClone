// CommunityStep3.jsx
import React, { useState, useEffect } from "react";
import { X, Info, CheckCircle, Loader2 } from "lucide-react";
import FooterNavigation from "./FooterNavigation";

const CommunityCardPreview = ({ name, description }) => {
  const displayCommunityName = name.length > 0 ? name : "communityname";
  const displayDescription =
    description.length > 0 ? description : "Your community description";

  return (
    <div className="p-4 bg-[#272729] rounded-xl shadow-lg space-y-3">
      <div className="flex items-center">
        <div>
          <h3 className="text-xl font-semibold text-white">
            r/{displayCommunityName}
          </h3>
          <p className="text-xs text-gray-400">
            1 weekly visitor · 1 weekly contributor
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-300 whitespace-pre-wrap break-words line-clamp-3">
        {displayDescription}
      </p>
    </div>
  );
};

export default function CommunityPopup3({
  data = {},
  updateData,
  onNext,
  onBack,
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
      <div className="p-4 px-3 flex justify-between items-start sticky top-0 bg-[#1a1a1b]">
        <div>
          <h1 className="text-2xl font-bold text-gray-300 mb-2">
            Tell us about your community
          </h1>
          <p className="text-sm text-gray-400">
            A name and description help people understand what your community is
            all about.
          </p>
        </div>

        <X
          size={35}
          strokeWidth={1.75}
          onClick={onClose}
          className="bg-white dark:bg-zinc-800 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer text-gray-400 hover:text-white"
          aria-label="Close"
        />
      </div>

      <div className="p-4 overflow-y-auto flex-grow flex flex-col md:flex-row gap-6">
        <div className="flex flex-col w-full md:w-3/5 space-y-6">
          <div className="space-y-2">
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
                className={`w-full py-3 pl-4 pr-12 bg-[#272729] border rounded-xl focus:outline-none text-gray-300 placeholder-gray-500 disabled:opacity-50 ${
                  nameError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-[#343536] focus:ring-blue-600 focus:border-blue-600"
                }`}
                maxLength={NAME_MAX_LENGTH}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">
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
            <div className="relative flex-grow">
              <textarea
                id="community-description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value.slice(0, DESC_MAX_LENGTH))
                }
                placeholder="Description *"
                rows={8}
                disabled={loading}
                className={`w-full p-4 bg-[#272729] border rounded-lg focus:outline-none text-white placeholder-gray-500 resize-none flex-grow disabled:opacity-50 ${
                  !isDescriptionValid && description.length > 0
                    ? "border-red-500"
                    : "border-[#343536] focus:ring-blue-600 focus:border-blue-600"
                }`}
                maxLength={DESC_MAX_LENGTH}
              ></textarea>
              <span className="absolute bottom-3 right-3 text-xs text-gray-500">
                {description.length}/{DESC_MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/5 md:sticky md:top-6 h-fit">
          <CommunityCardPreview name={name} description={description} />
        </div>
      </div>

      <FooterNavigation
        step={3}
        totalSteps={3}
        onBack={() => {
          updateData?.({ name, description });
          onBack?.();
        }}
        onNext={handleNextClick}
        onClose={onClose}
        isNextDisabled={!isReady || loading}
        nextButtonText={
          loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </span>
          ) : (
            "Create"
          )
        }
        showLegal={false}
      />
    </>
  );
}
