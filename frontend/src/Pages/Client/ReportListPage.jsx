import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { useQuery } from "react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";

const fetchReports = async () => {
  const response = await axios.get(
    "http://localhost:8081/api/admin/reports/user/reports",
    {
      withCredentials: true,
    }
  );
  return response.data.reports;
};

const ReportsList = () => {
  const navigate = useNavigate();

  const {
    data: reports,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      resolved: { color: "bg-green-500", icon: CheckCircle },
      closed: { color: "bg-red-500", icon: XCircle },
      pending: { color: "bg-gray-500", icon: Clock },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-4 w-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

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
        Error loading reports
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <Card className="max-w-4xl mx-auto bg-gray-800/50 border-gray-700">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-6 w-6" />
            My Reports
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="text-white mb-4"
          >
            Back to Home
          </Button>
          <button
            onClick={() => navigate("/report/submit")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
          >
            Submit New Report
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports?.map((report) => (
              <div
                key={report._id}
                onClick={() => navigate(`/report/view/${report._id}`)}
                className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-300">
                      Category: {report.category}
                    </p>
                    <p className="text-sm text-gray-300">
                      Submitted on:{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsList;
