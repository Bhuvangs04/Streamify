import { useState } from "react";
import { useQuery } from "react-query"; // Fixed import
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";

import {
  Search as SearchIcon,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCw,
  X,
} from "lucide-react";
import { Toaster, toast } from "sonner";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments-search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      try {
        const response = await axios.get(
          `http://localhost:8081/api/admin/payment-details/search`,
          {
            params: { term: searchTerm },
            withCredentials: true,
          }
        );
        return response.data.payments || [];
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch payment details"
        );
        return [];
      }
    },
    enabled: !!searchTerm.trim(),
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "captured":
      case "completed":
        return "badge-success";
      case "failed":
        return "badge-destructive";
      case "pending":
        return "badge-warning";
      case "refunded":
        return "badge-warning";
      default:
        return "bg-gray-800/20 text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "captured":
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "refunded":
        return <RotateCw className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleRefund = async (paymentId) => {
    try {
      const amount = selectedPayment.amount; // Full refund (amount in paise)
      const response = await axios.post(
        `http://localhost:8081/api/payment/refund/${paymentId}`,
        { amount }
      );
      toast.success(`Refund successfully initiated for ${paymentId}`);
      setSelectedPayment(null); // Reset selected payment
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund.");
    }
  };
  const fetchPaymentDetails = async (paymentId) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/api/payment/payment-details/${paymentId}`,
        { withCredentials: true }
      );
      setSelectedPayment(response.data.paymentDetails);
    } catch (error) {
      toast.error("Failed to fetch payment details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Toaster position="top-right" theme="dark" />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/reports")}
            className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            Payment Dashboard
          </h1>
          <p className="text-gray-400">
            Search and manage payment transactions
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by transaction ID, order ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>

        <ScrollArea className="h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {payments?.map((payment, index) => (
                <div
                  key={index}
                  className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg hover:shadow-purple-900/20 transition-all duration-200 group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-900/30 rounded-lg group-hover:bg-purple-900/50 transition-colors">
                        <CreditCard className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {payment.paymentMethod}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {payment.transactionId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusIcon(payment.status)}
                        <span>{payment.status}</span>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hidden group-hover:flex items-center space-x-2 border-gray-700 hover:bg-gray-800 text-gray-300"
                        onClick={() => {
                          fetchPaymentDetails(payment.transactionId);
                          toast.success(
                            `Viewing full details for transaction ${payment.transactionId}`
                          );
                        }}
                      >
                        Get Full Details
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Order ID</p>
                      <p className="font-medium text-white">
                        {payment.orderId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Amount</p>
                      <p className="font-medium text-white text-lg">
                        {payment.currency} {payment.amount}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p className="font-medium text-white">
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
                </div>
              ))}

              {payments?.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-gray-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-lg font-medium">
                    {searchTerm
                      ? "No payments found matching your search"
                      : "No payment history found"}
                  </p>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
              <div className="bg-gray-900 p-6 rounded-xl shadow-lg max-w-lg w-full">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Payment Details
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Payment Id</span>
                    <span className="text-white">{selectedPayment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Currency</span>
                    <span className="text-white">
                      {selectedPayment.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Order ID</span>
                    <span className={`text-white}`}>
                      {selectedPayment.order_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Amount</span>
                    <span className="text-white">
                      {selectedPayment.currency} {selectedPayment.amount / 100}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Description</span>
                    <span className={`text-white}`}>
                      {selectedPayment.description}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">
                      Transaction Method
                    </span>
                    <span className={`text-white}`}>
                      {selectedPayment.method}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Status</span>
                    <span
                      className={`rounded-full text-white flex items-center space-x-2 ${getStatusColor(
                        selectedPayment.status
                      )}`}
                    >
                      {getStatusIcon(selectedPayment.status)}
                      {selectedPayment.status}
                    </span>
                  </div>
                  {selectedPayment.refund_status && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        Refund Status
                      </span>
                      <span className={`text-white`}>
                        {selectedPayment.refund_status === "full"
                          ? "Successfuly Refunded"
                          : "Refund Initiated"}
                      </span>
                    </div>
                  )}
                  {selectedPayment.amount_refunded !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        Amount Refunded
                      </span>
                      <span className={`text-white`}>
                        {selectedPayment.currency}{" "}
                        {selectedPayment.amount_refunded / 100 ||
                          "Not Initiated"}
                      </span>
                    </div>
                  )}
                  {selectedPayment.error_code && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Error Code</span>
                      <span className={`text-white`}>
                        {selectedPayment.error_code}
                      </span>
                    </div>
                  )}
                  {selectedPayment.error_description && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        Error Description
                      </span>
                      <span className={`text-white`}>
                        {selectedPayment.error_description}
                      </span>
                    </div>
                  )}
                  {selectedPayment.error_reason && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        Error Reason
                      </span>
                      <span className={`text-white`}>
                        {selectedPayment.error_reason}
                      </span>
                    </div>
                  )}
                  {selectedPayment.error_step && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Error Step</span>
                      <span className={`text-white`}>
                        {selectedPayment.error_step}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Created At</span>
                    <span className="text-white">
                      {new Date(
                        selectedPayment.created_at * 1000
                      ).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                {selectedPayment.status !== "refunded" ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-6 w-full"
                    onClick={() => handleRefund(selectedPayment.id)}
                  >
                    Issue Refund
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled
                    className="mt-6 w-full"
                    onClick={() => handleRefund(selectedPayment.id)}
                  >
                    Refund Initiated
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => setSelectedPayment(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default SearchPage;
