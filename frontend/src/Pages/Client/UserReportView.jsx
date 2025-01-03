import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/hooks/use-toast";
import {
  MessageCircle,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Button } from "@/components/ui/button";

// Function to fetch all reports
const fetchReports = async () => {
  const response = await axios.get(
    `http://localhost:8081/api/admin/reports/user/reports`,
    {
      withCredentials: true,
    }
  );
  return response.data.reports;
};

// Function to update report status
const updateReportStatus = async ({ reportId, status }) => {
  const response = await axios.post(
    `http://localhost:8081/api/admin/reports/update/report/${reportId}/status`,
    { status },
    { withCredentials: true }
  );
  return response.data;
};

const UserReportView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all reports using React Query
  const {
    data: reports,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
  });

  // Mutation for updating status
  const statusMutation = useMutation({
    mutationFn: updateReportStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["reports"]);
      toast({
        title: "Status Updated",
        description: "Report status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (reportId, newStatus) => {
    statusMutation.mutate({ reportId, status: newStatus });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      resolved: { color: "bg-green-500", icon: CheckCircle },
      closed: { color: "bg-red-500", icon: XCircle },
      pending: { color: "bg-gray-500", icon: Clock },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-500",
      icon: Clock,
    };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-5 w-5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Loading and Error States
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Loading reports...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Error loading reports: {error.message}
      </div>
    );
  }

  // Render Multiple Reports
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <Button
        variant="outline"
        onClick={() => navigate("/reports/list")}
        className="text-white mb-4"
      >
        Back to Reports
      </Button>

      {reports.map((report) => (
        <Card
          key={report._id}
          className="max-w-3xl mx-auto mb-4 bg-gray-800/50 border-gray-700 animate-fade-in"
        >
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-6 w-6" />
              {report.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {report.title}
                </h2>
                <p className="text-sm text-gray-300">
                  Category: {report.category}
                </p>
                <p className="text-sm text-gray-300">
                  Submitted on:{" "}
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                {getStatusBadge(report.status)}
                <Select
                  defaultValue={report.status}
                  onValueChange={(newStatus) =>
                    handleStatusChange(report._id, newStatus)
                  }
                >
                  <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-gray-200">{report.description}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Admin Responses
              </h3>
              {report.comments?.length === 0 ? (
                <p className="text-gray-400">No responses yet.</p>
              ) : (
                report.comments.map((comment) => (
                  <Card
                    key={comment._id}
                    className="bg-gray-700/50 border-gray-600"
                  >
                    <CardContent className="p-4">
                      <div className="text-gray-200">{comment.comment}</div>
                      <div className="text-sm text-gray-400">
                        MiniNetflix Team
                      </div>
                      <div className="text-sm text-gray-400">
                        Replied Date:{" "}
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserReportView;
