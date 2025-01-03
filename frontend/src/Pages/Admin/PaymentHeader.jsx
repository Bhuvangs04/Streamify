import { X } from "lucide-react";

export const PaymentHeader = ({ count, onNavigate }) => {
  return (
    <div className="mb-8 flex justify-between items-start">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Payment History</h1>
        <p className="text-gray-400">
          {count} {count === 1 ? "payment" : "payments"} found
        </p>
        <p className="text-blue-400 text-sm mt-2">
          Please Not only 10 recent payments are been shown so please check
          Razorpay for more payments detials
        </p>
      </div>
      <button
        onClick={onNavigate}
        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
      >
        <X className="h-6 w-6 text-gray-400" />
      </button>
    </div>
  );
};
