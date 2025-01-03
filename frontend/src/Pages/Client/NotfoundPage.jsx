import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-md w-full p-6 text-center animate-fade-in">
        <div className="mb-8 transform rotate-12 animate-pulse">
          <Search className="h-24 w-24 mx-auto text-purple-500" />
        </div>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-2xl font-semibold text-black mb-2">Page Not Found</p>
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300 transform hover:scale-105"
          >
            Return Home
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full border-purple-200 hover:bg-purple-50 transition-all duration-300"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
