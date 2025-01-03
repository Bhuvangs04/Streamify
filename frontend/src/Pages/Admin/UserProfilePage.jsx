import React, { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import VerificationBadge from "@/components/ui/Verify";

function maskEmail(email) {
  if (!email) return "";
  const [localPart, domain] = email.split("@");
  const visiblePart = localPart.slice(0, 3); // Show the first 2 or 3 letters
  const maskedPart = "*".repeat(localPart.length - visiblePart.length);
  return `${visiblePart}${maskedPart}@${domain}`;
}

const UserProfile = () => {
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  };
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: detailedData, isLoading } = useQuery({
    queryKey: ["detailedData", getCurrentDate()],
    queryFn: async () => {
      const currentDate = getCurrentDate();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const response = await axios.get(
        `http://localhost:8081/api/admin/send/all/detailed/${currentDate}/fetchAll`
      );
      return response.data;
    },
    onError: () => {
      toast.error("Failed to load data for the current date");
    },
  });

  const normalizedData =
    detailedData?.userDetials.map((user) => ({
      ...user,
      payments: detailedData.PaymentDetails.filter(
        (payment) => payment.userId.includes(user._id) // Match user._id with payment.userId array
      ),
      paymentsHistory: detailedData.paymentHitory.filter((paymenthy) =>
        paymenthy.userId.includes(user._id)
      ),
    })) || [];
  const UserProfileSkeleton = () => (
    <>
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );

  const PaymentHistorySkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const handleViewPaymentHistory = (user) => {
    setSelectedUser(user);
    setShowPaymentHistory(true);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button
        onClick={() => (window.location.href = "/users/statics")}
        className="ml-4 bg-purple-600 hover:bg-purple-700"
      >
        View Statics
      </Button>
      <Button
        onClick={() => (window.location.href = "/admin/reports")}
        className="ml-4 bg-purple-600 hover:bg-purple-700"
      >
        Reports
      </Button>
      <h1 className=" mt-4 text-3xl font-bold mb-6">All Users</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <UserProfileSkeleton />
        ) : (
          normalizedData?.map((user) => (
            <Card key={user._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-black-200 border-2 border-white flex items-center justify-center">
                    <span className="text-xl">
                      {user.username?.charAt(0) || "U"}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl">{user.username}</h2>
                    <p className="text-sm text-gray-500 flex items-center">
                      {maskEmail(user.email)}{" "}
                      {user?.isEmailVerified && (
                        <span className="ml-1 text-xs">
                          <VerificationBadge />
                        </span>
                      )}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium">{user.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          user.userBlocked === "Blocked"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.userBlocked === "Blocked" ? "Blocked" : "Active"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {user.role === "user" && (
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleViewPaymentHistory(user)}
                    >
                      View Payment History
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payment History Modal */}
      <Dialog open={showPaymentHistory} onOpenChange={setShowPaymentHistory}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment History - {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <PaymentHistorySkeleton />
          ) : (
            <div className="space-y-4">
              <div className="overflow-y-auto max-h-[400px] space-y-4">
                {" "}
                {/* Scrollable container */}
                {selectedUser?.paymentsHistory?.map((payment) => (
                  <Card key={payment.transactionId}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold mt-2">
                            Payment ID:{" "}
                            {payment.transactionId ||
                              "Transaction Not Completed"}
                          </p>
                          <p className="font-semibold mt-2">
                            Amount Paid: ₹{payment.amount}
                          </p>
                          <p className="font-semibold mt-2">
                            Currency: {payment.currency}
                          </p>
                          <p className="font-semibold mt-2">
                            Payment Method: {payment.paymentMethod}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Last Payment:{" "}
                            {new Date(payment.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold mt-2">{payment.orderId}</p>
                          <span
                            className={`mt-3 inline-block px-2 py-1 text-xs rounded-full ${
                              payment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payment.status === "completed"
                              ? "Paid"
                              : payment.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {(!selectedUser?.paymentsHistory ||
                selectedUser.paymentsHistory.length === 0) && (
                <p className="text-center text-gray-500 py-4">
                  No payment history found for this user
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
