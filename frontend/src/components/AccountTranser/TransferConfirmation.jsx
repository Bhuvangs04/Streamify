import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";

export default function TransferConfirmation({
  currentEmail,
  newEmail,
  onTransferComplete,
}) {
  const Navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8081/api/user/update/transfer/currentuser", // Removed extra space
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentEmail, newEmail }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Account transferred successfully.", { duration: 3000 });
        onTransferComplete();
        setTimeout(() => {
          Navigate("/profile");
        }, 3000);
      } else {
        toast.error(`Transfer failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error("Failed to transfer account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <Toaster position="top-right" />
      {/* Ensure Toaster is correctly placed */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Confirm Transfer
        </CardTitle>
        <CardDescription>
          Verify the details below and confirm the account transfer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Current Email:</p>
            <p className="text-sm text-muted-foreground">{currentEmail}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">New Email:</p>
            <p className="text-sm text-muted-foreground">{newEmail}</p>
          </div>
        </div>
        <Button
          onClick={handleTransfer}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Transferring..." : "Confirm Transfer"}
        </Button>
      </CardContent>
    </Card>
  );
}
