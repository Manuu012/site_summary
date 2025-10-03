import axios from "axios";
import { api } from "./api";
import type { ApiError, CreateUserResponse } from "../types/IApp";

export const creataUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<CreateUserResponse> => {
  try {
    const response = await api.post<CreateUserResponse>(
      "/users/register",
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle specific error cases
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data as ApiError;
        throw new Error(
          serverError.message || `Error: ${error.response.status}`
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new Error("Network error. Please check your connection.");
      }
    }
    // Generic error
    throw new Error("Failed to create user account. Please try again.");
  }
};
