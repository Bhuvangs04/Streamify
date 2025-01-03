import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/hooks/use-toast";
import {
  Users,
  User,
  CheckCircle,
  Clock,
  XCircle,
  MessageCircle,
} from "lucide-react";
import UserDetailsModal from "./UserModal";

// API calls
const fetchReports = async () => {
  const response = await axios.get(
    "http://localhost:8081/api/admin/reports/reports"
  );
  return response.data.reports;
};

const fetchReport = async (reportId) => {
  const response = await axios.get(
    `http://localhost:8081/api/admin/reports/report/${reportId}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

const submitResponse = async ({ reportId, response }) => {
  const result = await axios.post(
    `http://localhost:8081/api/admin/reports/report/${reportId}/comment`,
    { comment: response },
    { withCredentials: true }
  );
  return result.data;
};

// Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    resolved: { color: "bg-green-500", icon: CheckCircle },
    closed: { color: "bg-red-500", icon: XCircle },
    pending: { color: "bg-gray-500", icon: Clock },
  };

  const { color, icon: Icon } = statusConfig[status] || statusConfig.pending;
  return (
    <Badge className={`${color} text-white flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const AdminReportsPage = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState(null);
  const [response, setResponse] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Fetch all reports
  const { data: reports, isLoading: loadingReports } = useQuery(
    ["reports"],
    fetchReports
  );

  useEffect(() => {
    if (reportId) {
      setSelectedReport({ _id: reportId });
    }
  }, [reportId]);

  // Fetch specific report
  const { data: reportData } = useQuery({
    queryKey: ["report", selectedReport?._id],
    queryFn: () => fetchReport(selectedReport._id),
    enabled: !!selectedReport?._id,
  });

  const reportDetails = reportData?.report;
  const userDetails = reportData?.userDetails?.[0];

  // Response submission mutation
  const responseMutation = useMutation(submitResponse, {
    onSuccess: () => {
      toast({
        title: "Response Sent",
        description: "Admin response has been submitted.",
      });
      setResponse("");
      queryClient.invalidateQueries(["report", selectedReport._id]);
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to send response.",
        variant: "destructive",
      }),
  });

  // Status update mutation

  const handleResponseSubmit = () => {
    if (!response || !selectedReport?._id) {
      toast({ title: "Error", description: "Please provide a response." });
      return;
    }
    responseMutation.mutate({ reportId: selectedReport._id, response });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 space-y-6">
      <Button
        variant="outline"
        onClick={() => navigate("/users/statics")}
        className="text-white mb-4"
      >
        Back to Reports
      </Button>

      <Button
        variant="outline"
        onClick={() => navigate("/admin/reports/detailed")}
        className="ml-4 text-white mb-4"
      >
        Detials
      </Button>
      {/* Reports List */}
      <Card className="bg-gray-800/50 border-gray-700 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-6 w-6" />
            Admin Reports Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Reports List</h3>
              {loadingReports ? (
                <div className="text-white">Loading...</div>
              ) : (
                reports.map((report) => (
                  <Card
                    key={report._id}
                    className="bg-gray-700/50 border-gray-600 cursor-pointer hover:bg-gray-700 transition"
                    onClick={() => setSelectedReport(report)}
                  >
                    <CardContent>
                      <div className="mt-3 flex justify-between">
                        <div>
                          <h4 className="text-white font-medium">
                            {report.title}
                          </h4>
                          <p className="text-sm text-gray-300">
                            {report.description}
                          </p>
                        </div>
                        <StatusBadge status={report.status} />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Report Details */}
            {selectedReport && reportDetails && (
              <div className="space-y-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Selected Report
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsUserModalOpen(true)}
                        className="text-white"
                      >
                        <User className="h-4 w-4 mr-2" />
                        User Details
                      </Button>
                    </div>

                    <p className="text-gray-300 mb-4">
                      {reportDetails.description}
                    </p>

                    {/* Comments Section */}
                    <div className="space-y-4 mt-6">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Comments
                      </h4>
                      <div className="space-y-3">
                        {reportDetails.comments?.map((comment, index) => (
                          <div
                            key={index}
                            className="bg-gray-700/50 p-3 rounded-lg text-gray-200"
                          >
                            <p className="text-sm font-medium text-purple-400">
                              {comment.user?.name || "Admin"}
                            </p>
                            <p className="text-sm">{comment.comment}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Type your response here..."
                        className="bg-gray-600 text-white"
                      />
                      <Button
                        onClick={handleResponseSubmit}
                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white w-full"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Submit Response
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {userDetails && (
        <UserDetailsModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          userDetails={userDetails}
        />
      )}
    </div>
  );
};

export default AdminReportsPage;
