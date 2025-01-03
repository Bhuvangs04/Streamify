import { Card } from "@/components/ui/card";
import { IndianRupee, CheckCircle2, AlertCircle } from "lucide-react";

export const SettlementCard = ({ settlement }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "processed":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "failed":
        return "badge-destructive";
      default:
        return "bg-gray-800/20 text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "processed":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="bg-gray-900 border-gray-800 p-6 hover:shadow-purple-900/20 transition-all duration-200">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-900/30 rounded-lg">
              <IndianRupee className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Settlement ID</p>
              <p className="font-medium text-white">{settlement.id}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400">UTR</p>
            <p className="font-medium text-white">{settlement.utr}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Amount</p>
            <p className="text-xl font-semibold text-white">
              ₹{(settlement.amount / 100).toFixed(2)}
            </p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-sm text-gray-400">Fees</p>
              <p className="font-medium text-white">
                ₹{(settlement.fees / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Tax</p>
              <p className="font-medium text-white">
                ₹{(settlement.tax / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(
                settlement.status
              )}`}
            >
              {getStatusIcon(settlement.status)}
              <span>{settlement.status}</span>
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-400">Created At</p>
            <p className="font-medium text-white">
              {formatDate(settlement.created_at)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
