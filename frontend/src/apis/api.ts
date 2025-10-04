import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API endpoints
export const crawlerAPI = {
  crawlWebsite: (url: string) => axiosInstance.post("/crawler/crawl", { url }),
  getWebsites: () => axiosInstance.get("/crawler/websites"),
};

export const analyticsAPI = {
  getUserAnalytics: (userId: number) =>
    axiosInstance.get(`/analytics/user/${userId}`),
};

// apis/Analytics.ts or wherever your aiAPI is defined
export const askQuestion = (question: string, websiteId: string) => {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
  const userId = currentUser.data.id;

  return axiosInstance.post("/chat/ask", {
    question,
    websiteId: Number(websiteId), // Convert to number
    userId: Number(userId), // Convert to number
  });
};
