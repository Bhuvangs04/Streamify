import React from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "react-query";
import useAuth from "../hooks/useAuth";
import Loader from "@/components/ui/Loader";

axios.defaults.withCredentials = true;

// Function to verify authentication for regular users
const verifyAuth = async () => {
  const response = await axios.get(
    "http://localhost:8081/api/netflix/verify-auth",
    {
      withCredentials: true,
    }
  );
  return response.data; // Expecting { message: "Authenticated" }
};

export const ProtectedRoute = ({
  element,
  isProtected = false,
  isAdmin = false,
}) => {
  // User authentication query
  const {
    data: userAuthData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery("verifyAuth", verifyAuth, {
    retry: false,
    enabled: isProtected,
  });

  // Admin authentication hook
  const {
    data: adminAuthData,
    isLoading: isAdminLoading,
    isError: isAdminError,
  } = useAuth({ enabled: isAdmin });

  // Show loading spinner during authentication
  if (isUserLoading || isAdminLoading) {
    return (
      <div className="loading-spinner">
        <Loader />
      </div>
    );
  }

  // Unauthorized access handling
  if (
    isProtected &&
    (isUserError || userAuthData?.message !== "Authenticated")
  ) {
    return <Navigate to="/login" />;
  }

  if (isAdmin && (isAdminError || adminAuthData?.message !== "Authenticated")) {
    return <Navigate to="/login" />;
  }

  // Render the protected element
  return element;
};
