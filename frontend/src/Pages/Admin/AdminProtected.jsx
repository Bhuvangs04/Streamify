import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Protected2 = ({ children }) => {
  const { data, isLoading, isError } = useAuth();

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>; // Replace with a proper loader if needed
  }

  if (isError || data?.Authenticated !== "true") {
    console.error("Authentication failed or unauthorized");
    return <Navigate to="/Unauthorized/page" />;
  }

  return <>{children}</>;
};

export default Protected2;
