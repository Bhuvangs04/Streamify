import React, { useEffect, useState, lazy, Suspense } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { useQuery } from "react-query";
import { X } from "lucide-react";

axios.defaults.withCredentials = true;

const PaymentPlan = lazy(() => import("./PaymentPlan"));

// Fetch user role
const fetchUserRole = async () => {
  const response = await axios.get("http://localhost:8081/api/user/getRole", {
    withCredentials: true,
  });
  return response.data;
};

// Fetch available plans
const fetchPlans = async () => {
  const response = await axios.get("http://localhost:8081/api/payment/plans", {
    withCredentials: true,
  });
  return response.data.plans; // Return only the plans array
};

const PaymentPage = () => {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const {
    data: userRoleData,
    isLoading: isUserRoleLoading,
    isError: isUserRoleError,
  } = useQuery("userRole", fetchUserRole, {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
  });

  const {
    data: plans,
    isLoading: isPlansLoading,
    isError: isPlansError,
  } = useQuery("plans", fetchPlans, {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log("Razorpay script loaded.");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async (plan) => {
    try {
      if (userRoleData.user === "unBlocked") {
        toast.info(
          "You are already a subscription member. No payment is needed!",
          { duration: 5000 }
        );
        return;
      }

      const response = await axios.post(
        "http://localhost:8081/api/payment/order",
        {
          options: {
            amount: plan.price * 100,
            currency: "INR",
            receipt: `${plan.id}`,
          },
        },
        { withCredentials: true }
      );

      const order = response.data.order;
      if (!order || !order.id) {
        throw new Error("Invalid order details.");
      }

      const keyID = import.meta.env.VITE_APP_RAZORPAY_KEY_ID;
      const options = {
        key: keyID,
        amount: plan.price * 100,
        currency: "INR",
        name: "Mini Netflix",
        description: `Subscription Plan for ${plan.devices} device(s)`,
        image: "https://example.com/your_logo",
        order_id: order.id,
        handler: async function (response) {
          try {
            const validationResponse = await axios.post(
              "http://localhost:8081/api/payment/order/validate",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                Paid: plan.price,
                WatchBy: plan.devices,
                PlanName: plan.name,
                Month: plan.month,
              },
              { withCredentials: true }
            );

            if (validationResponse.data.msg === "Success") {
              setSuccessMessage("Payment Successful!");
              setTimeout(() => {
                setSuccessMessage(null);
                navigate("/");
              }, 5000);
            } else {
              setError("Payment verification failed.");
              setTimeout(() => {
                setError(null);
              }, 5000);
            }
          } catch (error) {
            setError("Payment verification failed.");
            setTimeout(() => {
              setError(null);
            }, 5000);
          }
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        //console.error("Payment failed:", response.error);
        setError("Payment failed. Please try again.");
        setTimeout(() => {
          setError(null);
        }, 5000);
      });
      rzp.open();
    } catch (error) {
      //console.error("Payment initiation error:", error);
      setError("Payment initiation failed.");
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  if (isUserRoleLoading || isPlansLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  if (isUserRoleError || isPlansError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Failed to load data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white py-16 px-4">
      <Toaster position="top-center" richColors />
      <button
        onClick={() => navigate("/profile")}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="h-6 w-6 text-gray-500" />
      </button>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] text-transparent bg-clip-text">
            Choose Your Plan
          </h1>
          <p className="text-[#8E9196] text-lg max-w-2xl mx-auto">
            Select the perfect subscription plan that suits your needs and enjoy
            unlimited streaming
          </p>
        </div>
        {successMessage && toast.success(successMessage, { duration: 5000 })}
        {error && toast.error(error, { duration: 5000 })}
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5]"></div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <PaymentPlan
                key={plan.id}
                plan={plan}
                handlePayment={handlePayment}
              />
            ))}
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default PaymentPage;
