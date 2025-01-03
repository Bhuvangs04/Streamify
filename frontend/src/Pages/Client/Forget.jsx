import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { KeyRound, ArrowLeft, Loader2, Mail } from "lucide-react";

export default function ForgetPage() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");

    try {
      await axios.post("http://localhost:8081/api/user/forgot-password", {
        email,
      });
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-4 animate-fade-up">
      <Card className="w-full max-w-md backdrop-blur-sm bg-card/30 border-muted/20">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-center tracking-tight">
            Forgot Password
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Enter your email address to reset your password
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 transition-all duration-200 hover:border-primary focus:border-primary"
                  disabled={isProcessing || isSuccess}
                />
              </div>
            </div>

            {errorMessage && (
              <Alert variant="destructive" className="animate-shake">
                {errorMessage}
              </Alert>
            )}

            {isSuccess && (
              <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
                Reset link sent! Redirecting to login...
              </Alert>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
            onClick={handleSubmit}
            disabled={isProcessing || isSuccess}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/login")}
            disabled={isProcessing}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
