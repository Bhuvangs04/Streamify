import { useState } from "react";
import { Toaster, toast } from "sonner";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TransferStepsPage from "@/components/AccountTranser/TransferSteps";
import { useLocation } from "react-router-dom";

function TransferPages() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userEmail = queryParams.get("email");
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [emails, setEmails] = useState({ current: "", new: "" });

  const handleEmailsSubmit = async (currentEmail, newEmail) => {
    try {
      const response = await fetch(
        "http://localhost:8081/api/user/send-verification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: [currentEmail, newEmail] }),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Verification emails sent successfully!");
        setEmails({ current: currentEmail, new: newEmail });
        setStep(2);
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to send verification emails.");
      }
    } catch (error) {
      toast.error("An error occurred while sending verification emails.");
    }
  };

  const handleVerificationComplete = async (currentOtp, newOtp) => {
    try {
      const response = await fetch(
        "http://localhost:8081/api/user/verify-transfer-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentEmail: emails.current,
            currentOtp,
            newEmail: emails.new,
            newOtp,
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Verification successful!");
        setStep(3);
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to verify OTP.");
      }
    } catch (error) {
      toast.error("An error occurred while verifying OTP.");
    }
  };

  const handleTransferComplete = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/api/user/update/transfer/user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentEmail: emails.current,
            newEmail: emails.new,
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Account transfer completed successfully!");
        setStep(1);
        setEmails({ current: "", new: "" });
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to complete account transfer.");
      }
    } catch (error) {
      toast.error("An error occurred while completing account transfer.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <button
        onClick={() => navigate("/profile")}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="h-6 w-6 text-gray-500" />
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Account Transfer</h1>
          <p className="text-muted-foreground mt-2">
            Transfer your account to a new email address
          </p>
          <p className="text-muted-foreground mt-2">
            Current email: <span className="text-blue-600">{userEmail}</span>
          </p>
        </div>

        <TransferStepsPage
          step={step}
          emails={emails}
          onEmailsSubmit={handleEmailsSubmit}
          onVerificationComplete={handleVerificationComplete}
          onTransferComplete={handleTransferComplete}
        />
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

export default TransferPages;
