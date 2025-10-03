import { api } from "./api";

// 1. Get how many websites user has visited
export const getVisitedWebsitesCount = async (userId: number) => {
  const response = await api.get(
    `/analytics/user/${userId}/visited-websites-count`
  );
  return response.data;
};

// 2. Get how many times user visited each website
export const getWebsiteVisits = async (userId: number) => {
  const response = await api.get(`/analytics/user/${userId}/website-visits`);
  return response.data;
};
