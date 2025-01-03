import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { User, Mail, Lock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

function CreateAccountPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (showOtpInput && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpInput, countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordCriteria({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const sendVerificationEmail = async () => {
    try {
      setIsProcessing(true);
      await axios.post(
        "http://localhost:8081/api/netflix/new/send-verification",
        {
          email: formData.email,
        }
      );
      setShowOtpInput(true);
      setCountdown(30);
      setCanResend(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send verification email.";
      setErrorMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpChange = (value) => setOtp(value);

  const handleResendOtp = () => {
    if (canResend) sendVerificationEmail();
  };

  const verifyOtp = async () => {
    try {
      setIsProcessing(true);
      await axios.post("http://localhost:8081/api/netflix/new/verify-otp", {
        email: formData.email,
        otp,
      });
      handleFinalSubmit();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Invalid verification code.";
      setErrorMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:8081/api/netflix/new/account",
        formData
      );
      navigate("/login");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      setErrorMessage(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!showOtpInput) {
      await sendVerificationEmail();
    } else {
      await verifyOtp();
    }
  };

  const CriteriaIcon = ({ met }) =>
    met ? (
      <CheckCircle className="h-4 w-4 text-green-500 animate-in fade-in-50 duration-300" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500 animate-in fade-in-50 duration-300" />
    );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-3xl animate-gradient" />

        <div className="relative bg-card p-8 rounded-xl shadow-2xl border border-border/50 backdrop-blur-xl animate-in fade-in-50 duration-500 slide-in-from-bottom-10">
          <div className="flex flex-col space-y-2 text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-muted-foreground">Join our community today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {!showOtpInput ? (
                <>
                  <div className="relative group">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-10 transition-all border-border/50 focus:border-primary"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 transition-all border-border/50 focus:border-primary"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 transition-all border-border/50 focus:border-primary"
                      required
                    />
                  </div>

                  <div className="bg-card/50 p-4 rounded-lg border border-border/50">
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                      Password Requirements:
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {Object.entries({
                        "Minimum 8 characters": passwordCriteria.length,
                        "One uppercase letter": passwordCriteria.uppercase,
                        "One number": passwordCriteria.number,
                        "One special character": passwordCriteria.specialChar,
                      }).map(([text, met]) => (
                        <li key={text} className="flex items-center space-x-2">
                          <CriteriaIcon met={met} />
                          <span
                            className={met ? "text-green-500" : "text-red-500"}
                          >
                            {text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter the verification code sent to {formData.email}
                    </p>
                    <div className="flex justify-center mb-4">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={handleOtpChange}
                        render={({ slots }) => (
                          <InputOTPGroup>
                            {slots.map((slot, idx) => (
                              <React.Fragment key={idx}>
                                <InputOTPSlot slots={slots} index={idx} />
                                {idx !== slots.length - 1 && (
                                  <InputOTPSeparator />
                                )}
                              </React.Fragment>
                            ))}
                          </InputOTPGroup>
                        )}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {canResend ? (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleResendOtp}
                          className="text-primary hover:text-primary/80"
                        >
                          Resend Code
                        </Button>
                      ) : (
                        <p>Resend code in {countdown}s</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <Alert
                variant="destructive"
                className="animate-in fade-in-50 slide-in-from-top-5"
              >
                {errorMessage}
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full relative overflow-hidden group"
              disabled={isProcessing || (!showOtpInput && !isPasswordValid)}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>{showOtpInput ? "Verify Code" : "Create Account"}</>
              )}
            </Button>

            {!showOtpInput && (
              <p className="mt-4 text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAccountPage;
