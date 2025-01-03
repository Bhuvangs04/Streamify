import React from "react";
import { motion } from "framer-motion";
import { Film } from "lucide-react";

const LoginHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center p-8 border-b border-gray-800"
    >
      <div className="flex items-center justify-center mb-4">
        <Film className="w-10 h-10 text-purple-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Welcome Back To MiniNetflix
      </h2>
      <p className="text-gray-400">
        Sign in to continue watching your favorite movies
      </p>
    </motion.div>
  );
};

export default LoginHeader;
