import { Check } from "lucide-react";

const VerificationBadge = () => {
  return (
    <div className="relative inline-flex items-center justify-center w-7 h-7">
      <div className="absolute inset-0 bg-emerald-400/50 rounded-full animate-ping"></div>
      <div className="absolute inset-0 bg-emerald-400/30 rounded-full animate-pulse"></div>
      <div className="absolute w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
        <Check className="h-3 w-3 text-white drop-shadow-sm" strokeWidth={3} />
      </div>
    </div>
  );
};

export default VerificationBadge;
