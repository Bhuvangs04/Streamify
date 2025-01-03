import { useQuery } from "react-query";
import { LogsSkeleton } from "@/components/EmailLogs/LogsLoading";
import { LogsTable } from "@/components/EmailLogs/LogsTable";
import { LogsHeader } from "@/components/EmailLogs/LogsHeader";
import { X } from "heroicons-react";
import { useNavigate } from "react-router-dom";

export default function EmailChangeLogsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["emailChangeLogs"],
    queryFn: async () => {
      const response = await fetch(
        "http://localhost:8081/api/admin/user/email/change-logs",
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }
      return response.json();
    },
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-destructive">Error loading logs: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <button
        onClick={() => navigate("/users/statics")}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="h-6 w-6 text-gray-500" />
      </button>
      <LogsHeader isLoading={isLoading} count={data?.emailChangeLogs?.length} />
      {isLoading ? (
        <LogsSkeleton />
      ) : (
        <LogsTable logs={data?.emailChangeLogs} />
      )}
    </div>
  );
}
