// utils/axios.js
import axios from "axios";
axios.defaults.withCredentials = true;

const instance = axios.create({
  baseURL: "http://localhost:8081/api", // Update with your API base URL
  withCredentials: true, // If you need to send credentials like cookies or tokens
});

export default instance;
