import React, { useState, useEffect, Suspense } from "react";
import { useToast } from "@/components/hooks/use-toast";
import { checkPaymentStatus } from "../../utils/profileUtils";
import Header from "@/components/Scroll/Header";
import PaymentBanner from "@/components/Scroll/PaymentBanner";

// Lazy load the InfiniteMovieGrid component
const InfiniteMovieGrid = React.lazy(() =>
  import("@/components/Scroll/InfiniteMovieGrid")
);

function App() {
  const [showPaymentReminder, setShowPaymentReminder] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      const data = await checkPaymentStatus();
      if (data.showPaymentReminder) {
        setShowPaymentReminder(true);
        toast({
          title: "Subscription Status",
          description: "Your subscription needs attention.",
          variant: "destructive",
        });
      }
    };
    fetchPaymentStatus();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2C1F3D] to-[#1E293B] text-white">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative px-6 pt-16 mx-auto max-w-[2000px]">
        <Header />
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-pulse flex space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              </div>
            </div>
          }
        >
          <InfiniteMovieGrid />
        </Suspense>
        {showPaymentReminder && <PaymentBanner />}
      </div>
    </div>
  );
}

export default App;
