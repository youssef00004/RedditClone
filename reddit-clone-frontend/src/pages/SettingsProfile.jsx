import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const SettingsProfile = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [settings, setSettings] = useState({
    email: "joannapad@gmail.com",
    gender: "Man",
    googleConnected: false,
  });

  const tabs = [
    { id: "account", label: "Account" },
    { id: "profile", label: "Profile" },
  ];

  const handleConnect = (service) => {
    setSettings((prev) => ({
      ...prev,
      [`${service}Connected`]: !prev[`${service}Connected`],
    }));
  };

  const handleTwoFactorToggle = () => {
    setSettings((prev) => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled,
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Layout - starts below navbar */}
      <div className="pt-14 flex">
        {/* Sidebar */}
        <Sidebar />

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

            {/* Tabs - Full width */}
            <div className=" mb-3">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-orange-500 text-orange-600 dark:text-orange-500"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content - Full width */}
            <div>
              {/* General Section */}
              <div className="p-1 border-b">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  General
                </h2>

                <div className="space-y-1">
                  {/* Email Address */}
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <h3 className="text-sm font-normal text-gray-900 dark:text-white">
                        Email address
                      </h3>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {settings.email}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <h3 className="text-sm font-normal text-gray-900 dark:text-white">
                        Gender
                      </h3>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {settings.gender}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Authorization Section */}
              <div className="p-1 border-b">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Account authorization
                </h2>

                <div className="space-y-1">
                  {/* Google */}
                  <div className="flex justify-between items-center py-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Google
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Connect to log in to Reddit with your Google account
                      </p>
                    </div>
                    <button
                      onClick={() => handleConnect("google")}
                      className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                        settings.googleConnected
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                          : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {settings.googleConnected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfile;
