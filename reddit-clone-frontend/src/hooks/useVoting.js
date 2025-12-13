import { useState } from "react";

/**
 * Custom hook for handling voting logic (upvote/downvote)
 * @param {number} initialUpvotes - Initial upvote count
 * @param {number} initialDownvotes - Initial downvote count
 * @param {string} userId - Current user ID
 * @param {Array} upvotesList - List of user IDs who upvoted
 * @param {Array} downvotesList - List of user IDs who downvoted
 * @param {Function} upvoteFunction - Function to call when upvoting
 * @param {Function} downvoteFunction - Function to call when downvoting
 * @returns {Object} Voting state and handlers
 */
export const useVoting = (
  initialUpvotes = 0,
  initialDownvotes = 0,
  userId,
  upvotesList = [],
  downvotesList = [],
  upvoteFunction,
  downvoteFunction
) => {
  const initialVotes = initialUpvotes - initialDownvotes;
  const initialStatus = upvotesList.includes(userId)
    ? "up"
    : downvotesList.includes(userId)
    ? "down"
    : null;

  const [votes, setVotes] = useState(initialVotes);
  const [voteStatus, setVoteStatus] = useState(initialStatus);
  const [isVoting, setIsVoting] = useState(false);

  const handleUpvote = async () => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await upvoteFunction();
      if (voteStatus === "up") {
        setVotes(votes - 1);
        setVoteStatus(null);
      } else if (voteStatus === "down") {
        setVotes(votes + 2);
        setVoteStatus("up");
      } else {
        setVotes(votes + 1);
        setVoteStatus("up");
      }
    } catch (error) {
      console.error("Upvote error:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async () => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await downvoteFunction();
      if (voteStatus === "down") {
        setVotes(votes + 1);
        setVoteStatus(null);
      } else if (voteStatus === "up") {
        setVotes(votes - 2);
        setVoteStatus("down");
      } else {
        setVotes(votes - 1);
        setVoteStatus("down");
      }
    } catch (error) {
      console.error("Downvote error:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return {
    votes,
    voteStatus,
    isVoting,
    handleUpvote,
    handleDownvote,
  };
};
