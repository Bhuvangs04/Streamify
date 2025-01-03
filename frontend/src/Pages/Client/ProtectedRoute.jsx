import React from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "react-query";

axios.defaults.withCredentials = true;

// Function to verify authentication
const verifyAuth = async () => {
  const response = await axios.get(
    "http://localhost:8081/api/netflix/verify-auth",
    {
      withCredentials: true,
    }
  );
  return response.data; // Expecting { message: "Authenticated" } or similar
};

const Protected = ({ children }) => {
  const { data, isLoading, isError } = useQuery("verifyAuth", verifyAuth, {
    retry: false, // Do not retry failed requests
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.message !== "Authenticated") {
    return <Navigate to="/Unauthorized/page" />;
  }
  // If authenticated, render children
  return <Route>{children}</Route>;
};

export default Protected;
