import axios from "axios";

const normalizeAbsoluteUrl = (url) => {
  if (!url) return "";
  const trimmedUrl = url.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmedUrl)) return trimmedUrl;
  return `https://${trimmedUrl}`;
};

const getApiBaseUrl = () => {
  const configuredUrl = normalizeAbsoluteUrl(import.meta.env.VITE_API_URL);
  if (!configuredUrl) return "http://localhost:5001/api";
  return configuredUrl.endsWith("/api")
    ? configuredUrl
    : `${configuredUrl}/api`;
};

export const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});
