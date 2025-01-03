import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Crown } from "lucide-react";

const DeviceLimitModal = ({ message, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-purple-500/20"
        >
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute right-0 top-0 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-500/20 p-3 rounded-full mb-4">
                <Smartphone className="w-8 h-8 text-purple-400" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Device Limit Reached
              </h3>

              <p className="text-gray-300 mb-6">
                <span className="text-blue-600 text-lg text-2xl">{`${message}`}</span>{" "}
                Upgrade to Premium to stream on more devices simultaneously.
              </p>

              <div className="bg-purple-900/30 rounded-xl p-4 mb-6 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-lg font-semibold text-white">
                    Premium Benefits
                  </h4>
                </div>
                <ul className="text-left text-gray-300 space-y-2">
                  <li>• Watch on up to 4 devices at once</li>
                  <li>• Ultra HD quality available</li>
                  <li>• Ad-free viewing experience</li>
                  <li>• Download content for offline viewing</li>
                </ul>
              </div>

              <button
                onClick={() => (window.location.href = "/pay")}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg px-6 py-3 font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Upgrade to Premium</span>
                <Crown className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>

              <button
                onClick={onClose}
                className="mt-4 text-gray-400 hover:text-white transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeviceLimitModal;
