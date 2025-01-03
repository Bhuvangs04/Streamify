import { useQuery } from "react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SettlementCard } from "./SettlementCard";
import { SettlementsHeader } from "./SettlementsHeader";
import { Loader2, X } from "lucide-react";
import { Toaster, toast } from "sonner";

const SettlementsPage = () => {
  const navigate = useNavigate();

  const { data: settlements, isLoading } = useQuery({
    queryKey: ["settlements"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/api/payment/payment/settlement`,
          { withCredentials: true }
        );
        return response.data.items || [];
      } catch (error) {
        console.error("Error fetching settlements:", error);
        toast.error("Failed to fetch settlements");
        return [];
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Toaster position="top-right" theme="dark" />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <SettlementsHeader count={settlements?.length || 0} />
          <button
            onClick={() => navigate("/user/statics")}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <ScrollArea className="h-[80vh]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {settlements?.map((settlement) => (
                <SettlementCard key={settlement.id} settlement={settlement} />
              ))}
              {settlements?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg font-medium">
                    No settlements found
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

export default SettlementsPage;
