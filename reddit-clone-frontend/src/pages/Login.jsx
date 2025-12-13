import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { SiReddit } from "react-icons/si";
export default function Login() {
  const [identifier, setidentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(identifier, password);
      navigate("/"); // Redirect to home on success
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");
      await googleLogin(credentialResponse.credential);
      navigate("/");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Skeleton Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="grid grid-cols-3 gap-6 p-8">
          {[...Array(30)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-4 space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-5/6"></div>
              </div>
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="flex gap-3">
                <div className="h-6 bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Reddit Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <SiReddit className="w-7 h-7 text-orange-500" />
            <span className="text-white text-2xl font-bold">reddit</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900 bg-opacity-95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-zinc-800">
          <h1 className="text-white text-3xl font-medium text-center mb-6">
            Log In
          </h1>

          <p className="text-gray-400 text-sm text-center mb-8">
            By continuing, you agree to our User Agreement and acknowledge that
            you understand the Privacy Policy .
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            {/* Replace the Google button with this: */}
            <div className="w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="continue_with"
                width="100%"
                logo_alignment="left"
              />
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-zinc-900 text-gray-500">OR</span>
            </div>
          </div>

          {/* Login Inputs */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Email or username *"
                value={identifier}
                onChange={(e) => setidentifier(e.target.value)}
                disabled={loading}
                className="w-full bg-zinc-800 text-white placeholder-gray-500 py-3 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full bg-zinc-800 text-white placeholder-gray-500 py-3 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="text-left text-sm">
              <span className="text-gray-400">New to Reddit? </span>
              <Link to="/register" className="text-blue-500 hover:underline">
                Sign Up
              </Link>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-full transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
