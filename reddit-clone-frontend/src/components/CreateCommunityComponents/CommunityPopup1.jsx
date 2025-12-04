// CommunityStep1.jsx
import React, { useState, useMemo, useEffect } from "react";
import { X, Search } from "lucide-react";
import FooterNavigation from "./FooterNavigation";

/**
 * TopicChip (same behavior you had)
 */
const TopicChip = ({ topic, isSelected, onClick, removable, onRemove }) => {
  const baseClasses =
    "px-3 py-1 text-sm rounded-full transition-colors duration-150 font-medium whitespace-nowrap flex items-center";

  const selectedClasses =
    "bg-blue-600 text-white hover:bg-blue-500 cursor-pointer";
  const unselectedClasses =
    "bg-gray-700 text-gray-200 hover:bg-gray-600 cursor-pointer";
  const selectedDisplayClasses =
    "bg-[#272729] border border-gray-600 text-white cursor-default";

  const chipStyle = removable
    ? selectedDisplayClasses
    : isSelected
    ? selectedClasses
    : unselectedClasses;
  const clickHandler = removable ? null : () => onClick(topic);

  return (
    <button
      className={`${baseClasses} ${chipStyle}`}
      onClick={clickHandler}
      aria-pressed={isSelected}
    >
      <span>{topic}</span>
      {removable && (
        <X
          size={16}
          strokeWidth={2}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(topic);
          }}
          className="ml-2 w-4 h-4 cursor-pointer text-gray-400 hover:text-white transition-colors"
        />
      )}
    </button>
  );
};

export const initialTopics = [
  {
    category: "Anime & Cosplay",
    icon: "🍣",
    subtopics: ["Anime & Manga", "Cosplay"],
  },
  {
    category: "Art",
    icon: "🧑‍🎨",
    subtopics: [
      "Performing Arts",
      "Architecture",
      "Design",
      "Art",
      "Filmmaking",
      "Digital Art",
      "Photography",
    ],
  },
  {
    category: "Business & Finance",
    icon: "💵",
    subtopics: [
      "Personal Finance",
      "Crypto",
      "Economics",
      "Business News & Discussion",
      "Deals & Marketplace",
      "Startups & Entrepreneurship",
      "Real Estate",
      "Stocks & Investing",
    ],
  },
  {
    category: "Collectibles & Other Hobbies",
    icon: "🧩",
    subtopics: ["Model Building", "Collectibles", "Other Hobbies", "Toys"],
  },
  {
    category: "Education & Career",
    icon: "🧑‍🏫",
    subtopics: ["Education and Studying", "Career"],
  },
  {
    category: "Movies & TV",
    icon: "🎞️",
    subtopics: [
      "Horror Movies And Series",
      "Comendy Movies And Series",
      "Action Movies And Series",
      "Drama Movies And Series",
      "Romance Movies And Series",
    ],
  },
  {
    category: "Health",
    icon: "❤️‍🩹",
    subtopics: [
      "Addiction Support",
      "Pregnancy",
      "Medical Health",
      "Trauma Support",
      "Mental Health",
    ],
  },
  {
    category: "Food & Drinks",
    icon: "🍔",
    subtopics: ["Food", "Recipes", "Drinks", "Baking", "Vegan Food"],
  },
];

/**
 * Step 1: Topic selection content-only component.
 *
 * Props:
 * - data: { topics: [] }  (initial values)
 * - updateData: function(partialData) to persist into parent
 * - onNext(partialData) => called when Next is pressed
 * - onBack()
 * - onClose()
 */
export default function CommunityPopup1({
  data = {},
  updateData,
  onNext,
  onBack,
  onClose,
}) {
  const MAX_TOPICS = 3;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopics, setSelectedTopics] = useState(data.topics || []);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  useEffect(() => {
    // keep local state in sync if parent data changes externally
    setSelectedTopics(data.topics || []);
  }, [data.topics]);

  const filteredTopics = useMemo(() => {
    if (!searchTerm) return initialTopics;
    const lowerSearchTerm = searchTerm.toLowerCase();

    return initialTopics
      .map((categoryGroup) => {
        const filteredSubtopics = categoryGroup.subtopics.filter((subtopic) =>
          subtopic.toLowerCase().includes(lowerSearchTerm)
        );

        if (
          filteredSubtopics.length > 0 ||
          categoryGroup.category.toLowerCase().includes(lowerSearchTerm)
        ) {
          return {
            ...categoryGroup,
            subtopics:
              filteredSubtopics.length > 0
                ? filteredSubtopics
                : categoryGroup.subtopics,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [searchTerm]);

  const handleTopicClick = (topic) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        return prev.filter((t) => t !== topic);
      } else if (prev.length < MAX_TOPICS) {
        return [...prev, topic];
      }

      if (prev.length === MAX_TOPICS && !prev.includes(topic)) {
        if (!showLimitWarning) {
          setShowLimitWarning(true);
          setTimeout(() => setShowLimitWarning(false), 5000);
        }
      }

      return prev;
    });
  };

  const handleTopicRemove = (topicToRemove) => {
    setSelectedTopics((prev) =>
      prev.filter((topic) => topic !== topicToRemove)
    );
  };

  // When pressing Next: persist and call parent's onNext
  const handleNext = () => {
    updateData?.({ topics: selectedTopics });
    onNext?.({ topics: selectedTopics });
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 px-6 flex justify-between items-center sticky top-0 bg-[#1a1a1b]">
        <div>
          <h1 className="text-2xl font-bold text-gray-300">Add topics</h1>
          <p className="pt-2 text-sm text-gray-300">
            Add up to {MAX_TOPICS} topics to help interested redditors find your
            community.
          </p>
        </div>

        <X
          size={35}
          strokeWidth={1.75}
          onClick={onClose}
          className="bg-white dark:bg-zinc-800 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer text-gray-400 hover:text-white"
        />
      </div>

      {/* Search */}
      <div className="p-6 pb-0">
        <div className="relative">
          <Search
            size={20}
            strokeWidth={1.75}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Filter topics"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#272729] border border-[#343536] text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-white focus:border-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Selected Topics */}
      <div className="px-6 pt-4 pb-2">
        <div className="text-m text-gray-300 font-bold mb-3">
          Topics {selectedTopics.length}/{MAX_TOPICS}
        </div>

        {selectedTopics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTopics.map((topic) => (
              <TopicChip
                key={`selected-${topic}`}
                topic={topic}
                removable={true}
                onRemove={handleTopicRemove}
              />
            ))}
          </div>
        )}

        {showLimitWarning && (
          <p className="text-red-500 text-sm font-medium pt-2">
            Only {MAX_TOPICS} topics can be added
          </p>
        )}
      </div>

      {/* Topics list */}
      <div className="px-6 pb-4 overflow-y-auto flex-grow space-y-5">
        {filteredTopics.length === 0 && (
          <p className="text-gray-400 italic mt-4">
            No topics found matching "{searchTerm}"
          </p>
        )}

        {filteredTopics.map((categoryGroup) => (
          <div key={categoryGroup.category}>
            <h3 className="text-base font-semibold text-gray-100 mb-2 flex items-center">
              <span className="mr-1 text-lg">{categoryGroup.icon}</span>
              {categoryGroup.category}
            </h3>

            <div className="flex flex-wrap gap-2">
              {categoryGroup.subtopics.map((topic) => (
                <TopicChip
                  key={topic}
                  topic={topic}
                  isSelected={selectedTopics.includes(topic)}
                  onClick={handleTopicClick}
                  removable={false}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="h-10"></div>
      </div>

      {/* Footer (shared) */}
      <FooterNavigation
        step={1}
        totalSteps={3}
        onBack={onBack}
        onNext={handleNext}
        onClose={onClose}
        isNextDisabled={selectedTopics.length === 0}
        nextButtonText="Next"
      />
    </>
  );
}
