export interface Website {
  id: number;
  url: string;
  title: string;
  content: string;
  metadata: any;
  crawledAt: string;
}

export interface User {
  id: number;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
  userId: number;
  websiteId: number;
  user: User;
  website: Website;
}

export interface Analytics {
  totalUsers: number;
  totalQueries: number;
  totalWebsites: number;
  popularWebsites: Website[];
  recentQueries: ChatMessage[];
  activeUsers: User[];
  queriesPerUser: string;
}

// Response interfaces
export interface CreateUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface WebsiteVisit {
  websiteId: number;
  websiteUrl: string;
  websiteTitle: string;
  visitCount: number;
  lastVisited: string;
  firstCrawled: string;
}

// Define reducer state
export interface AnalyticsState {
  loading: boolean;
  error: string | null;
  websitesCount: any;
  websiteVisits: any;
}

// Define actions
export type AnalyticsAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: { count: any; visits: any } }
  | { type: "FETCH_ERROR"; payload: string };
