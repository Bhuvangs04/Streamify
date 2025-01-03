import { useQuery } from "react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PaymentCard } from "./PaymentCard";
import { PaymentHeader } from "./PaymentHeader";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const PaymentDetailsPage = () => {
  const navigate = useNavigate();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/api/payment/payment/full`,
          { withCredentials: true }
        );
        //console.log("Payments fetched:", response.data);
        return response.data.items || [];
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast.error("Failed to fetch payments");
        return [];
      }
    },
  });

  return (
    <div className="relative min-h-screen bg-gray-950">
      {/* Adjusted button position */}

      <div className="container mx-auto px-4 py-8">
        <PaymentHeader
          count={payments?.length || 0}
          onNavigate={() => navigate("/user/statics")}
        />

        <ScrollArea className="h-[80vh]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {payments?.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
              {payments?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg font-medium">
                    No payments found
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;
