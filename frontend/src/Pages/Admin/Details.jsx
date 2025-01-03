import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "react-query";
import { User } from "lucide-react";

const fetchUserDetails = async (planId) => {
  if (!planId) return null;
  const response = await fetch(
    `http://localhost:8081/api/payment/plans/${planId}/createdBy`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }
  return response.json();
};

const UserDetailsModal = ({ planId, isOpen, onClose }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["userDetails", planId],
    queryFn: () => fetchUserDetails(planId),
    enabled: !!planId && isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Plan Creator Details
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          {isError && (
            <div className="text-destructive text-center py-4">
              Failed to load user details
            </div>
          )}
          {data && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">CreatedBy:</span>
                <span>{data.createdBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Role:</span>
                <div className="flex items-center gap-1">
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      data.role === "admin"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {data.role === "admin" ? "Admin" : "User"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Description:</span>
                <span className="capitalize">
                  <p className="text-sm">{data.description}</p>
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
