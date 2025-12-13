import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import All from "./pages/All";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import UserProfile from "./pages/UserProfile";
import SettingsProfile from "./pages/SettingsProfile";
import ManageCommunites from "./pages/ManageCommunites";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ChatProvider } from "./context/ChatContext";
import ChatModal from "./components/Chat/ChatModal";
import Notification from "./pages/Notification";
import SearchPage from "./pages/SearchPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ChatProvider>
            <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/all" element={<All />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/post/:postId" element={<PostDetail />} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/community/:id" element={<CommunityDetail />} />
                <Route path="/user/:username" element={<UserProfile />} />
                <Route path="/SettingsProfile" element={<SettingsProfile />} />
                <Route
                  path="/ManageCommunities"
                  element={<ManageCommunites />}
                />
                <Route path="/Notification" element={<Notification />} />
                <Route path="/search" element={<SearchPage />} />
              </Routes>
              <ChatModal />
              <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#333",
                    color: "#fff",
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fff",
                    },
                  },
                }}
              />
            </div>
          </ChatProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
