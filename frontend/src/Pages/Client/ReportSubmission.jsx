import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/hooks/use-toast";
import { FileText, Send } from "lucide-react";
import { useMutation } from "react-query";
import axios from "@/utils/axios";

// Function to handle report submission API call
const submitReport = async (reportData) => {
  const response = await axios.post("/admin/reports/report", reportData);
  return response.data;
};

const ReportSubmissionPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const { toast } = useToast();

  // Mutation for submitting the report
  const mutation = useMutation({
    mutationFn: submitReport,
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Your report has been successfully submitted.",
      });
      navigate("/reports/list");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit the report.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare report data
    const reportData = {
      title,
      description,
      category,
    };

    // Trigger mutation
    mutation.mutate(reportData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-gray-800/50 border-gray-700 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-6 w-6" />
            Submit a Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-200">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter report title"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-200">Category</label>
              <Select onValueChange={setCategory} required>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="other">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-200">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white min-h-[150px]"
                placeholder="Describe your report in detail"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={mutation.isLoading} // Disable button when submitting
            >
              <Send className="mr-2 h-4 w-4" /> Submit Report
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSubmissionPage;
