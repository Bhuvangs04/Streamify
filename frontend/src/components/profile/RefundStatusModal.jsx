import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "react-query";
import { Loader2, CheckCircle2, Receipt } from "lucide-react";
import axios from "axios";

const RefundStatusModal = ({ isOpen, onClose, paymentId }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["refundStatus", paymentId],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:8081/api/payment/refund-status/${paymentId}`
      );
      return response.data;
    },
    enabled: isOpen && !!paymentId,
  });

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Refund Status
            <p className="mt-2 text-sm text-white-500">Refund status for </p>
            <p className="mt-2 text-sm text-white-500">
              <strong className="text-blue-500">
                {" "}
                Payment ID: {paymentId}
              </strong>
            </p>
            <p className="mt-2 text-sm text-white-500">
              Please Raise a ticket if you have any queries. If you dont see a
              refund status, please wait for 3 to 5 max waiting. Other wise
              please contact us.
            </p>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : isError || !data?.refundStatus ? (
          <div className="text-center py-4 text-gray-500">
            Unable to fetch refund status. Please try again later.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="px-4">
              <div className="flex items-center space-x-3 mb-6">
                <Receipt className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-white-600">Amount</p>
                  <p className="font-medium">
                    {data.refundStatus.currency}{" "}
                    {(data.refundStatus.amount / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />

                {/* Refund Issued */}
                <div className="relative mb-8">
                  <div className="flex items-center">
                    <div className="absolute left-4 -translate-x-1/2">
                      <div className="h-8 w-8 rounded-full border-2 border-green-500 bg-white flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="ml-12">
                      <h3 className="font-semibold text-white-900">
                        Refund Issued
                      </h3>
                      <p className="text-sm text-blue-600">
                        {formatDate(data.refundStatus.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Refund Processing */}
                <div className="relative mb-8">
                  <div className="flex items-center">
                    <div className="absolute left-4 -translate-x-1/2">
                      <div
                        className={`h-8 w-8 rounded-full border-2 ${
                          data.refundStatus.status === "processed"
                            ? "border-green-500 bg-white"
                            : "border-blue-500 bg-blue-500 animate-pulse"
                        } flex items-center justify-center`}
                      >
                        {data.refundStatus.status === "processed" && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <div className="ml-12">
                      <h3 className="font-semibold text-white-900">
                        Refund Processing
                      </h3>
                      <p className="text-sm text-blue-600">
                        Takes 3-5 working days
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount Credited */}
                <div className="relative">
                  <div className="flex items-center">
                    <div className="absolute left-4 -translate-x-1/2">
                      <div
                        className={`h-8 w-8 rounded-full border-2 ${
                          data.refundStatus.status === "processed"
                            ? "border-green-500 bg-white"
                            : "border-gray-300 bg-gray-500"
                        } flex items-center justify-center`}
                      >
                        {data.refundStatus.status === "processed" && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <div className="ml-12">
                      <h3 className="font-semibold text-white-900">
                        Amount Credited
                      </h3>
                      <p className="text-sm text-blue-600">
                        Amount will be credited to customer's bank account
                        within 5-7 working days after the refund has processed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RefundStatusModal;
