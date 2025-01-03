import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginForm from "@/components/login/login-form";
import LoginHeader from "@/components/login/login-header";
import LoginBackground from "@/components/login/LoginBackground";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.post(
        "http://localhost:8081/api/netflix/login",
        {
          email,
          password,
        }
      );

      if (response.data.message === "Login successful") {
        // If login is successful
        if (response.data.role === "user") {
          const deviceDetails = {
            userAgent: navigator.userAgent,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            platform: navigator.platform,
            deviceType: determineDeviceType(), // Add the device type here
          };

          function determineDeviceType() {
            const width = window.innerWidth;
            const userAgent = navigator.userAgent.toLowerCase();

            if (/mobile|android|iphone|ipad|ipod/.test(userAgent)) {
              // If it's a mobile or tablet device
              if (width <= 768) {
                return "mobile";
              } else {
                return "tablet";
              }
            } else {
              // Assume it's a laptop/desktop for other cases
              return "laptop";
            }
          }

          // Send device details to backend to start streaming
          const streamingResponse = await axios.post(
            "http://localhost:8081/api/user/start-streaming",
            { deviceDetails },
            { withCredentials: true }
          );

          const { deviceToken, message } = streamingResponse.data;
          localStorage.setItem("authToken", deviceToken);
          if (
            message ===
              "Please update the payment details to continue streaming." ||
            message === "Your payment details are outdated. Please update them."
          ) {
            navigate("/pay");
          } else if (
            message ===
            "Your account is blocked. Please update your payment details."
          ) {
            alert("Your account is blocked. Please contact support.");
          } else {
            console.log("Streaming started successfully.");
          }
        }

        // Handle admin role
        if (response.data.role === "admin") {
          navigate("/users/statics");
        } else {
          const paymentResponse = await axios.get(
            "http://localhost:8081/api/payment/check-payment",
            { withCredentials: true }
          );

          if (paymentResponse.data.showPaymentReminder) {
            navigate("/payment-reminder");
          } else {
            navigate("/");
          }
        }
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <LoginBackground />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="backdrop-blur-lg bg-black/65 border-gray-800 shadow-2xl">
            <LoginHeader />
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
