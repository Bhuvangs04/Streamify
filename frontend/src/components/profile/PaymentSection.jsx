import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "react-query";
import PaymentHistoryModal from "./PaymentHistoryModal";
import { useToast } from "@/components/hooks/use-toast";

const PaymentSection = ({ watchBy, lastPayment, userId }) => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const { toast } = useToast();

  const {
    data: paymentHistory = [],
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["paymentHistory", userId],
    queryFn: async () => {
      const currentDate = new Date().toISOString();
      const response = await fetch(
        `http://localhost:8081/api/user/payment-details/${userId}/${currentDate}/final`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch payment history",
        });
        throw new Error(error.message);
      }

      const data = await response.json();
      return data.payment;
    },
    enabled: !!userId,
  });

  if (!watchBy.length) return null;

  const currentDate = new Date();
  const lastPaymentDate = new Date(lastPayment);
  const planDuration = watchBy[0].Month.toLowerCase();
  let eligibleDate = new Date(lastPaymentDate);

  if (planDuration.includes("month")) {
    const months = parseInt(planDuration.split(" ")[0], 10);
    eligibleDate.setMonth(eligibleDate.getMonth() + months);
  } else if (planDuration.includes("year")) {
    const years = parseInt(planDuration.split(" ")[0], 10);
    eligibleDate.setFullYear(eligibleDate.getFullYear() + years);
  }

  const canPay = currentDate >= eligibleDate || watchBy[0].Refunded === true;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">
        <b>Your Plan</b>
      </h3>
      <p className="mt-2">Plan Name: {watchBy[0].PlanName}</p>
      <p className="mt-2">Month: {watchBy[0].Month}</p>
      <p className="mt-2">Amount Paid: ₹{watchBy[0].Paid}</p>
      <p className="mt-2">WatchBy: {watchBy[0].WatchBy}</p>
      {lastPayment && (
        <p className="mt-2">
          Last Payment: {new Date(lastPayment).toLocaleDateString()}{" "}
        </p>
      )}
      <div>
        <p className="mt-2">
          Next Payment Date: {eligibleDate.toLocaleDateString()}
        </p>
        <div className="flex gap-3 mt-3">
          <Button
            variant="outline"
            disabled={!canPay}
            onClick={() => (window.location.href = "/pay")}
          >
            {canPay ? "Upgrade Plan" : "Cannot Upgrade Yet"}
          </Button>
          {/* "See History" Button Always Visible */}
          <Button
            variant="secondary"
            onClick={() => setIsHistoryModalOpen(true)}
          >
            See History
          </Button>
        </div>
        <p className="mt-2 text-blue-500 text-sm">
          Don't do duplicate payment.{" "}
        </p>
        <p className="mt-2 text-blue-500 text-sm">
          If you have any query, please contact us.{" "}
        </p>
      </div>

      <PaymentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        payments={paymentHistory}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default PaymentSection;
