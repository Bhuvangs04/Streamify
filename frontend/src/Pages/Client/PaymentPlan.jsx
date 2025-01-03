import React from "react";
import { Check, Tv, Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
const PaymentPlan = ({ plan, handlePayment }) => {
  const isPopular = plan.id === 3; // Small Family Plan is marked as popular
  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 transition-all duration-300",
        "bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-xl",
        "border border-gray-700/50",
        "hover:border-[#9b87f5]/50 hover:shadow-lg hover:shadow-[#9b87f5]/20",
        "group"
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#9b87f5] text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2 text-white group-hover:text-[#9b87f5] transition-colors">
          {plan.name}
        </h2>
        <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
          <Tv className="w-4 h-4" />
          <span>
            {plan.devices} Device{plan.devices > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-3xl font-bold text-white">₹{plan.price}</span>
          <span className="text-gray-400 ml-2">/{plan.month}</span>
        </div>
      </div>
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 text-gray-300">
          <Check className="w-5 h-5 text-[#9b87f5]" />
          <span>Unlimited streaming</span>
        </div>
        <div className="flex items-center gap-3 text-gray-300">
          <Crown className="w-5 h-5 text-[#9b87f5]" />
          <span>HD + Ultra HD available</span>
        </div>
        <div className="flex items-center gap-3 text-gray-300">
          <Shield className="w-5 h-5 text-[#9b87f5]" />
          <span>Ad-free experience</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-6 text-center">
        {plan.description}
      </p>
      <button
        onClick={() => handlePayment(plan)}
        className={cn(
          "w-full py-3 px-6 rounded-xl font-medium transition-all duration-300",
          "bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA]",
          "hover:shadow-lg hover:shadow-[#9b87f5]/20",
          "active:scale-95"
        )}
      >
        Get Started
      </button>
    </div>
  );
};
export default PaymentPlan;
