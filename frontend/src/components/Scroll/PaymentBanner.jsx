import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const PaymentBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="fixed bottom-8 left-4 right-4 mx-auto max-w-2xl z-50"
    >
      <div className="bg-white/10 backdrop-blur-lg border border-purple-500/20 rounded-xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-purple-200">
                Unlock Premium Access
              </h3>
            </div>
            <p className="mt-1 text-gray-300">
              Subscribe now to enjoy unlimited streaming of all content
            </p>
          </div>
          <button
            onClick={() => {
              window.location.href = "/pay";
            }}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 ease-in-out group"
          >
            <span>Subscribe Now</span>
            <Sparkles className="w-5 h-5 ml-2 group-hover:animate-pulse" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentBanner;
