import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "").replace(
  /\/$/,
  "",
);

const api = axios.create({
  baseURL: configuredApiUrl ? `${configuredApiUrl}/api` : "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
