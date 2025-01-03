import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  OctagonX,
  IndianRupee,
} from "lucide-react";
import { useState } from "react";
import RefundStatusModal from "./RefundStatusModal";

const PaymentHistoryModal = ({ isOpen, onClose, payments }) => {
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      case "pending":
        return "text-yellow-500";
      case "refunded":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "refunded":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const handleTrackRefund = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setIsRefundModalOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">
              Payment History
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold text-gray-700">
                        {payment.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <span
                        className={`font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-800">Transaction ID</p>
                      <p className="font-medium text-gray-800">
                        {payment.transactionId || (
                          <span className="text-red-500">
                            <OctagonX className="ml-4 mt-2 h-5 w-6 text-red-500" />
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">Order ID</p>
                      <p className="font-medium text-gray-800">
                        {payment.orderId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">Amount</p>
                      <p className="font-medium text-lg text-gray-800">
                        {payment.currency} {payment.amount}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-800" />
                      <p className="font-medium text-gray-800">
                        {new Date(payment.createdAt).toLocaleDateString(
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

                  {payment.status.toLowerCase() === "refunded" && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleTrackRefund(payment.transactionId)}
                        className="w-full"
                      >
                        Track Refund Status
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {payments.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No payment history found
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <RefundStatusModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        paymentId={selectedPaymentId}
      />
    </>
  );
};

export default PaymentHistoryModal;
