import axios from "axios";

export const checkPaymentStatus = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8081/api/payment/check-payment",
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return { showPaymentReminder: false };
  }
};
