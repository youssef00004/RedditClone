// CommunityCreateFlow.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalContainer from "../components/CreateCommunityComponents/ModalContainer";
import CommunityPopup from "../components/CreateCommunityComponents/CommunityPopup";
import communityService from "../services/communityService";

export default function CommunityCreateFlow({
  open = true,
  onClose: parentOnClose,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(open);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // shared form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const closeFlow = () => {
    setIsOpen(false);
    parentOnClose?.();
  };

  const updateData = (partial) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  const handleCreate = async (partial = {}) => {
    const finalData = { ...formData, ...partial };

    try {
      setLoading(true);
      setError("");

      // Call the API to create community
      const response = await communityService.createCommunity(
        finalData.name,
        finalData.description
      );

      console.log("Community created successfully:", response);

      // Close the modal
      closeFlow();

      // Navigate to the new community page
      if (response.community?._id) {
        navigate(`/community/${response.community._id}`);
      } else {
        // Fallback to communities list
        navigate("/communities");
      }
    } catch (err) {
      setLoading(false);
      setError(err.toString() || "Failed to create community");
      console.error("Error creating community:", err);
      // Don't close modal on error, let user retry
    }
  };

  if (!isOpen) return null;

  return (
    <ModalContainer onClose={closeFlow}>
      {/* Error display */}
      {error && (
        <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500 text-red-500 text-xs sm:text-sm rounded-lg mx-3 sm:mx-4 mt-3 sm:mt-4">
          {error}
        </div>
      )}

      <CommunityPopup
        data={formData}
        updateData={updateData}
        onNext={handleCreate}
        onClose={closeFlow}
        loading={loading}
      />
    </ModalContainer>
  );
}
