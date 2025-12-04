import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import Home from "./pages/Home";
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/post/:postId" element={<PostDetail />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/community/:id" element={<CommunityDetail />} />
              <Route path="/user/:username" element={<UserProfile />} />
              <Route path="/SettingsProfile" element={<SettingsProfile />} />
              <Route path="/ManageCommunities" element={<ManageCommunites />} />
            </Routes>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
