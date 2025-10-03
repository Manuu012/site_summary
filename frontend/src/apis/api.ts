import axios from "axios";

const API_BASE_URL = import.meta.env.DEV ? "http://localhost:3001/api" : "/api"; // For production, use relative path

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API endpoints
export const crawlerAPI = {
  crawlWebsite: (url: string) => api.post("/crawler/crawl", { url }),
  getWebsites: () => api.get("/crawler/websites"),
};

export const analyticsAPI = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getUserAnalytics: (userId: number) => api.get(`/analytics/user/${userId}`),
};

// apis/Analytics.ts or wherever your aiAPI is defined
export const aiAPI = {
  askQuestion: (question: string, websiteId: string) => {
    const currentUser = JSON.parse(
      sessionStorage.getItem("currentUser") || "{}"
    );
    const userId = currentUser.data.id;

    return api.post("/chat/ask", {
      question,
      websiteId: Number(websiteId), // Convert to number
      userId: Number(userId), // Convert to number
    });
  },
};
