import { useState } from "react";
import { CreditCard, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import RefundModal from "./RefundChatbot";

export const PaymentCard = ({ payment }) => {
  const [showRefundDetails, setShowRefundDetails] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "captured":
      case "completed":
        return "badge-success";
      case "refunded":
        return "badge-warning";
      case "failed":
        return "badge-destructive";
      default:
        return "bg-gray-800/20 text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "captured":
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case "refunded":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <>
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg hover:shadow-purple-900/20 transition-all duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-900/30 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{payment.method}</h3>
              <p className="text-sm text-gray-400">{payment.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(
                payment.status
              )}`}
            >
              {getStatusIcon(payment.status)}
              <span className="text-blue-500">{payment.status}</span>
            </span>
            {payment.status === "refunded" && (
              <RefundModal
                paymentId={payment.id}
                open={showRefundDetails}
                onOpenChange={setShowRefundDetails} // This will close the modal when needed
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-400">Order ID</p>
            <p className="font-medium text-white">{payment.order_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Amount</p>
            <p className="font-medium text-white text-lg">
              {payment.currency} {(payment.amount / 100).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Created At</p>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <p className="font-medium text-white">
                {new Date(payment.created_at * 1000).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-400">Contact Details</p>
            <p className="font-medium text-white">{payment.email}</p>
            <p className="text-sm text-gray-400">{payment.contact}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Payment Details</p>
            <p className="font-medium text-white">
              Fee: {payment.currency} {(payment.fee / 100).toFixed(2)}
            </p>
            <p className="text-sm text-gray-400">
              Tax: {payment.currency} {(payment.tax / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {payment.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-400">Description</p>
            <p className="font-medium text-white">{payment.description}</p>
          </div>
        )}

        {payment.refund_status && (
          <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              Refund Status:{" "}
              {payment.refund_status === "full"
                ? "Refund completed"
                : "Processing"}
            </p>
            <p className="font-medium text-white">
              Amount Refunded: {payment.currency}{" "}
              {(payment.amount_refunded / 100).toFixed(2)}
            </p>
          </div>
        )}

        {(payment.error_code ||
          payment.error_description ||
          payment.error_reason) && (
          <div className="mt-4 p-3 bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-400">Error Information</p>
            {payment.error_code && (
              <p className="text-white">Code: {payment.error_code}</p>
            )}
            {payment.error_description && (
              <p className="text-white">
                Description: {payment.error_description}
              </p>
            )}
            {payment.error_reason && (
              <p className="text-white">Reason: {payment.error_reason}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};
