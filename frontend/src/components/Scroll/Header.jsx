import React from "react";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-purple-400">
        Premium Content Awaits
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
        Unlock our entire library of premium content with a subscription.
        Experience entertainment without limits.
      </p>
    </motion.div>
  );
};

export default Header;
