import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";

const RefundModal = ({ paymentId }) => {
  const [refundDetails, setRefundDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isDelayOver, setIsDelayOver] = useState(false);

  const fetchRefundDetails = async () => {
    if (!paymentId) return;

    setIsLoading(true);
    setError("");
    setRefundDetails(null);

    try {
      const response = await fetch(
        `http://localhost:8081/api/admin/refund/payment/${paymentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch refund details");
      }

      const data = await response.json();

      // Simulate a delay of 2 seconds before showing the details
      setTimeout(() => {
        setRefundDetails(data);
        setIsDelayOver(true); // After the delay, set the flag to show the details
      }, 4000);
      setIsDelayOver(false); // 2 seconds delay
    } catch (error) {
      setError(error.message || "Failed to fetch refund details");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchRefundDetails();
    }
  }, [isOpen, paymentId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Check Refund Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Refund Details for{" "}
            {isLoading && !isDelayOver ? (
              <span className="text-sm text-yellow-500 typing-animation">
                {" "}
                {"Loading..."}
              </span>
            ) : (
              <span className="text-sm text-blue-600">
                Payment ID {"->"} {paymentId}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}

          {isLoading && !isDelayOver && (
            <div className="text-center py-4">
              <Loader />
            </div>
          )}

          {isDelayOver && refundDetails && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl text-center font-semibold mb-4 text-gray-800">
                Refund Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Transaction Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      Refund ID:{" "}
                      <span className="text-sm text-blue-600">
                        {refundDetails.refundDetails.refundId}
                      </span>{" "}
                    </p>
                    <p className="text-gray-600">
                      Payment ID:{" "}
                      <span className="text-sm text-blue-600">
                        {" "}
                        {refundDetails.refundDetails.paymentId}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Status:</span>{" "}
                      <span
                        className={`font-medium ${
                          refundDetails.success
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {refundDetails.success ? "Successful" : "Pending"}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Created:{" "}
                      <span className="text-blue-600">
                        {new Date(
                          refundDetails.refundDetails.createdAt
                        ).toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    User Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      Username:{" "}
                      <span className="text-blue-600">
                        {refundDetails.userDetails.username}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Email:{" "}
                      <span className="text-sm text-blue-600">
                        {" "}
                        {refundDetails.userDetails.email}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      Role:{" "}
                      <span className="text-blue-600">
                        {refundDetails.userDetails.role}
                      </span>
                    </p>
                    <p className="text-blue-600">
                      <span className="text-blue-600">Account Status:</span>{" "}
                      <span
                        className={`font-medium ${
                          refundDetails.userDetails.userBlocked
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {refundDetails.userDetails.userBlocked === "unBlocked"
                          ? "Active"
                          : "Blocked"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefundModal;
