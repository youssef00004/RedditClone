// CommunityStep2.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import FooterNavigation from "./FooterNavigation";
import { Globe, Eye, Lock } from "lucide-react";

const communityTypes = [
  {
    type: "Public",
    iconName: "Globe",
    // We'll import the actual icon component below where needed
    description: "Anyone can view, post, and comment to this community",
  },
  {
    type: "Restricted",
    iconName: "Eye",
    description: "Anyone can view, but only approved users can contribute",
  },
  {
    type: "Private",
    iconName: "Lock",
    description: "Only approved users can view and contribute",
  },
];

const iconMap = { Globe, Eye, Lock };

const TypeSelectionRow = ({
  type,
  icon: Icon,
  description,
  isSelected,
  onSelect,
}) => {
  const isPublic = type === "Public";

  return (
    <div
      className={`p-4 border border-transparent rounded-lg cursor-pointer transition-colors duration-150 flex items-center justify-between ${
        isSelected ? "bg-[#272729] border-blue-600" : "hover:bg-[#272729]/50"
      }`}
      onClick={() => onSelect(type)}
    >
      <div className="flex items-start">
        <Icon className="w-4 h-4 mr-4 mt-[3.5%]" strokeWidth={1.5} />
        <div>
          <p className="font-semibold text-white text-md ">
            {type}
            {isPublic && (
              <span className="text-blue-500 font-medium text-sm ml-2">
                <span className="hidden sm:inline"> | </span>
                Only public communities show up in search
              </span>
            )}
          </p>
          <p className="text-gray-400 text-xs">{description}</p>
        </div>
      </div>

      <div
        className="w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all duration-150"
        style={{ borderColor: isSelected ? "#3b82f6" : "#52525B" }}
      >
        {isSelected && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
      </div>
    </div>
  );
};

/**
 * Step 2 content-only component.
 *
 * Props:
 * - data: { type: "Public" }
 * - updateData(partial)
 * - onNext(partial)
 * - onBack()
 * - onClose()
 */
export default function CommunityPopup2({
  data = {},
  updateData,
  onNext,
  onBack,
  onClose,
}) {
  const [selectedType, setSelectedType] = useState(data.type || "Public");

  useEffect(() => {
    setSelectedType(data.type || "Public");
  }, [data.type]);

  const handleNext = () => {
    updateData?.({ type: selectedType });
    onNext?.({ type: selectedType });
  };

  const handleBack = () => {
    // if you want to persist current choice when going back, do so:
    updateData?.({ type: selectedType });
    onBack?.();
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 px-3 flex justify-between items-start sticky bg-[#1a1a1b]">
        <div>
          <h1 className="text-2xl font-bold text-gray-300 mb-2">
            What kind of community is this?
          </h1>
          <p className="text-sm text-gray-300">
            Decide who can view and contribute in your community.
            <span className="font-bold text-gray-300 ml-1 mr-1">
              Important:
            </span>
            Once set, you will need to submit a request to change your community
            type.
          </p>
        </div>

        <X
          size={35}
          strokeWidth={1.75}
          onClick={onClose}
          className="bg-white dark:bg-zinc-800 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer text-gray-400 hover:text-white"
        />
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto space-y-4 flex-grow">
        {communityTypes.map((item) => {
          const Icon =
            iconMap[
              item.type === "Public"
                ? "Globe"
                : item.type === "Restricted"
                ? "Eye"
                : "Lock"
            ];
          return (
            <TypeSelectionRow
              key={item.type}
              type={item.type}
              icon={
                iconMap[
                  item.type === "Public"
                    ? "Globe"
                    : item.type === "Restricted"
                    ? "Eye"
                    : "Lock"
                ]
              }
              description={item.description}
              isSelected={selectedType === item.type}
              onSelect={setSelectedType}
            />
          );
        })}
      </div>

      {/* Footer */}
      <FooterNavigation
        step={2}
        totalSteps={3}
        onBack={handleBack}
        onNext={handleNext}
        onClose={onClose}
        isNextDisabled={false}
        nextButtonText="Next"
      />
    </>
  );
}
