// CommunityCreateFlow.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalContainer from "../components/CreateCommunityComponents/ModalContainer";
import CommunityPopup1 from "../components/CreateCommunityComponents/CommunityPopup1";
import CommunityPopup2 from "../components/CreateCommunityComponents/CommunityPopup2";
import CommunityPopup3 from "../components/CreateCommunityComponents/CommunityPopup3";
import communityService from "../services/communityService";

export default function CommunityCreateFlow({
  open = true,
  onClose: parentOnClose,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(open);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const totalSteps = 3;

  // shared form data
  const [formData, setFormData] = useState({
    topics: [],
    type: "Public",
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

  const goNext = async (partial = {}) => {
    // persist from the step
    if (partial && Object.keys(partial).length) updateData(partial);

    // if on last step and called with goNext from step 3, submit to API
    if (step === totalSteps) {
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
      return;
    }

    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  if (!isOpen) return null;

  return (
    <ModalContainer onClose={closeFlow}>
      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 text-sm">
          {error}
        </div>
      )}

      {step === 1 && (
        <CommunityPopup1
          data={formData}
          updateData={updateData}
          onNext={(partial) => goNext(partial)}
          onBack={() => goBack()}
          onClose={closeFlow}
        />
      )}

      {step === 2 && (
        <CommunityPopup2
          data={formData}
          updateData={updateData}
          onNext={(partial) => goNext(partial)}
          onBack={() => goBack()}
          onClose={closeFlow}
        />
      )}

      {step === 3 && (
        <CommunityPopup3
          data={formData}
          updateData={updateData}
          onNext={(partial) => {
            goNext(partial);
          }}
          onBack={() => goBack()}
          onClose={closeFlow}
          loading={loading}
        />
      )}
    </ModalContainer>
  );
}
