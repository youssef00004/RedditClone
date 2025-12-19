import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import authService from "../services/authService";
import userService from "../services/userService";
import CreateCommunityFlow from "./CreateCommunityFlow";

const SettingsProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Form states
  const [usernameData, setUsernameData] = useState({
    newUsername: "",
  });
  const [emailData, setEmailData] = useState({
    newEmail: "",
    password: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!usernameData.newUsername.trim()) {
      showMessage("error", "Please enter a new username");
      return;
    }

    setLoading(true);
    try {
      const response = await userService.updateUserProfile(currentUser.id, {
        username: usernameData.newUsername,
      });

      // Update localStorage with new username
      const updatedUser = {
        ...currentUser,
        username: usernameData.newUsername,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      setUsernameData({ newUsername: "" });
      showMessage("success", "Username updated successfully");

      // Refresh page after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      showMessage("error", error || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!emailData.newEmail.trim() || !emailData.password.trim()) {
      showMessage("error", "Please fill in all fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(emailData.newEmail)) {
      showMessage("error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await userService.updateUserProfile(currentUser.id, {
        email: emailData.newEmail,
        currentPassword: emailData.password,
      });

      // Update localStorage with new email
      const updatedUser = { ...currentUser, email: emailData.newEmail };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      setEmailData({ newEmail: "", password: "" });
      showMessage("success", "Email updated successfully");

      // Refresh page after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      showMessage("error", error || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      showMessage("error", "Please fill in all fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage("error", "New password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await userService.updateUserProfile(currentUser.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showMessage("success", "Password updated successfully");

      // Refresh page after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      showMessage("error", error || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Layout - starts below navbar */}
      <div className="pt-14 flex">
        {/* Sidebar */}
        <Sidebar setIsPopupOpen={setIsPopupOpen} />

        {/* Main Content Area - takes remaining width */}
        <div className="flex-1 lg:ml-20">
          {" "}
          {/* ml-64 accounts for sidebar width */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
            </div>

            {/* Message Display */}
            {message.text && (
              <div
                className={`mb-4 p-4 rounded-md ${
                  message.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Content - Full width */}
            <div>
              {/* Update Username Section */}
              <div className="p-1 border-b border-gray-200 dark:border-gray-800 pb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Update Username
                </h2>

                <form onSubmit={handleUpdateUsername} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Username
                    </label>
                    <div className="text-sm text-gray-600 dark:text-gray-400 py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                      {currentUser?.username || "Loading..."}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="newUsername"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      New Username
                    </label>
                    <input
                      type="text"
                      id="newUsername"
                      value={usernameData.newUsername}
                      onChange={(e) =>
                        setUsernameData({ newUsername: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter new username"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Updating..." : "Update Username"}
                  </button>
                </form>
              </div>

              {/* Update Email Section */}
              <div className="p-1 border-b border-gray-200 dark:border-gray-800 pb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Update Email
                </h2>

                {currentUser?.googleId ? (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      You signed in with Google. Email cannot be changed for
                      Google-authenticated accounts.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateEmail} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Email
                      </label>
                      <div className="text-sm text-gray-600 dark:text-gray-400 py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                        {currentUser?.email || "Loading..."}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="newEmail"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        New Email
                      </label>
                      <input
                        type="email"
                        id="newEmail"
                        value={emailData.newEmail}
                        onChange={(e) =>
                          setEmailData({
                            ...emailData,
                            newEmail: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="Enter new email"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="emailPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Current Password (for verification)
                      </label>
                      <input
                        type="password"
                        id="emailPassword"
                        value={emailData.password}
                        onChange={(e) =>
                          setEmailData({
                            ...emailData,
                            password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="Enter current password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Updating..." : "Update Email"}
                    </button>
                  </form>
                )}
              </div>

              {/* Update Password Section */}
              <div className="p-1 pb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Update Password
                </h2>

                {currentUser?.googleId ? (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      You signed in with Google. Password cannot be changed for
                      Google-authenticated accounts.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Create Community Popup */}
      {isPopupOpen && (
        <CreateCommunityFlow onClose={() => setIsPopupOpen(false)} />
      )}
    </div>
  );
};

export default SettingsProfile;
