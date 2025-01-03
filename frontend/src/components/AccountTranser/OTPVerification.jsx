import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { KeyRound } from "lucide-react";
import { useToast } from "@/components/hooks/use-toast";

export default function OTPVerification({
  currentEmail,
  newEmail,
  onVerificationComplete,
}) {
  const [currentOtp, setCurrentOtp] = useState("");
  const [newOtp, setNewOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (currentOtp.length !== 6 || newOtp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter both 6-digit OTP codes.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await onVerificationComplete(currentOtp, newOtp);
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "OTP verification successful.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: data.message || "Failed to verify OTPs.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify OTPs.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          Enter Verification Codes
        </CardTitle>
        <CardDescription>
          Enter the 6-digit codes sent to both email addresses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Code sent to {currentEmail}
          </label>
          <InputOTP
            value={currentOtp}
            onChange={setCurrentOtp}
            maxLength={6}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, idx) => (
                  <React.Fragment key={idx}>
                    <InputOTPSlot slots={slots} index={idx} />
                  </React.Fragment>
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Code sent to {newEmail}</label>
          <InputOTP
            value={newOtp}
            onChange={setNewOtp}
            maxLength={6}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, idx) => (
                  <React.Fragment key={idx}>
                    <InputOTPSlot slots={slots} index={idx} />
                  </React.Fragment>
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
        <Button
          onClick={handleVerify}
          className="w-full"
          disabled={isLoading || currentOtp.length !== 6 || newOtp.length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify Codes"}
        </Button>
      </CardContent>
    </Card>
  );
}
