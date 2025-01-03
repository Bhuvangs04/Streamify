import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { LoadingTable } from "@/components/profile/LoadingTable";
import { UserActions } from "@/components/profile/UserActions";
import { X } from "lucide-react";
import axios from "axios";
import { useQuery } from "react-query";
function maskEmail(email) {
  if (!email) return "";
  const [localPart, domain] = email.split("@");
  const visiblePart = localPart.slice(0, 3); // Show the first 2 or 3 letters
  const maskedPart = "*".repeat(localPart.length - visiblePart.length);
  return `${visiblePart}${maskedPart}@${domain}`;
}

const fetchActiveUsers = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const response = await axios.get(
    "http://localhost:8081/api/admin/activeUsers"
  );
  return response.data; // Expecting { activeUsers: [], paymentDetails: [] }
};

const PaymentManagement = () => {
  const navigate = useNavigate();
  const [userss, setUsers] = useState([]);

  const [alert, setAlert] = useState(null);
  const [processingUserId, setProcessingUserId] = useState(null);

  const { data, isLoading, isError } = useQuery(
    "activeUsers",
    fetchActiveUsers,
    {
      staleTime: 10000, // Data is considered fresh for 3 seconds
    }
  );

  if (isError) {
    return <div>Error loading data.</div>;
  }

  const sendReminder = async (userId) => {
    setProcessingUserId(userId);
    try {
      await axios.post(
        `http://localhost:8081/api/admin/send/inactive/${userId}`
      );
      setAlert({
        type: "success",
        message: "Reminder email sent successfully!",
      });
    } catch (error) {
      //console.error("Error sending reminder:", error);
      setAlert({ type: "error", message: "Failed to send reminder." });
    } finally {
      setProcessingUserId(null);
      setTimeout(() => setAlert(null), 2000);
    }
  };
  const blockUser = async (block, userId) => {
    setProcessingUserId(userId);
    try {
      const response = await axios.post(
        `http://localhost:8081/api/admin/send/${block}/${userId}`
      );

      setAlert({
        type: "success",
        message: response.data.message || "User successfully blocked!",
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, userBlocked: "Blocked" } : user
        )
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to block user.";
      setAlert({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setProcessingUserId(null);
      setTimeout(() => setAlert(null), 2000);
    }
  };

  const users = data?.activeUsers || [];
  const payments = data?.paymentDetails || [];

  const combinedData = users.map((user) => {
    const payment =
      payments.find(
        (pay) => Array.isArray(pay.userId) && pay.userId.includes(user._id)
      ) || {};
    return { ...user, payment };
  });

  return (
    <div className="min-h-screen bg-admin-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 relative">
          <button
            onClick={() => navigate("/users/statics")}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-black text-2xl font-semibold text-admin-text">
              Payment Management
            </h1>
          </div>

          {alert && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                alert.type === "success"
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              <div className="flex items-center gap-2">
                {alert.type === "success" ? (
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                <div>
                  <div className="font-semibold">
                    {alert.type === "success" ? "Success" : "Error"}
                  </div>
                  <div>{alert.message}</div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-admin-border overflow-hidden">
            {isLoading ? (
              <LoadingTable />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-black text-black">
                    <TableHead className="text-white font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Email
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Last Payment
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Plan
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      User Status
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Email Verified
                    </TableHead>
                    <TableHead className="text-white font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedData.length > 0 ? (
                    combinedData.map((user) => (
                      <TableRow key={user._id} className="hover:bg-gray-200">
                        <TableCell className="text-gray-800">
                          {user.username || "Unknown"}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {maskEmail(user.email) || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {user.payment?.lastPaymentDate
                            ? new Date(
                                user.payment.lastPaymentDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {user.payment?.PlanName || "N/A"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-sm font-semibold rounded-full ${
                              user.payment?.Month
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.payment?.Month ? "Paid" : "Unpaid"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-sm font-semibold rounded-full ${
                              user.userBlocked === "unBlocked"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.userBlocked === "unBlocked"
                              ? "Active"
                              : "Blocked"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-sm font-semibold rounded-full ${
                              user.isEmailVerified
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.isEmailVerified ? "Verified" : "Not-Verified"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <UserActions
                            user={user}
                            processingUserId={processingUserId}
                            onSendReminder={sendReminder}
                            onBlockUser={blockUser}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-gray-700"
                      >
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
