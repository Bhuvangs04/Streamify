import { useQuery } from "react-query";
import axios from "axios";

axios.defaults.withCredentials = true;

const verifyAuth = async () => {
  const response = await axios.get(
    "http://localhost:8081/api/netflix/admin/verify-auth",
    {
      withCredentials: true,
    }
  );
  return response.data; // Expecting { Authenticated: "true" } or similar
};

const useAuth = () => {
  return useQuery("verifyAuth", verifyAuth, {
    retry: false, // Avoid retrying on failure
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep cached data for 10 minutes
  });
};

export default useAuth;
