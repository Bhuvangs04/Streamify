import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = location.state || {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-md w-full p-6 text-center animate-fade-in shadow-lg rounded-lg bg-white">
        <div className="mb-8 animate-bounce-slow">
          <LockKeyhole className="h-24 w-24 mx-auto text-purple-500" />
        </div>
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Access Denied
        </h1>

        <p className="text-gray-600 mb-4">
          Sorry, you don't have permission to access this page. Please check
          your credentials and try again.
        </p>

        {message && (
          <p className="text-xl font-medium text-purple-600 mb-8">{message}</p>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => navigate("/pay")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300 transform hover:scale-105"
          >
            Upgrade Plan
          </Button>
          <Button
            onClick={() => navigate("/login")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300 transform hover:scale-105"
          >
            Login Page
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full border-purple-200 hover:bg-purple-50 transition-all duration-300"
          >
            Go Back to Home Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
