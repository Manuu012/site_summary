import { useState } from "react";
import { askQuestion } from "../apis/api";

interface UseAIChatProps {
  onError: (error: string) => void;
}

export const useAIChat = ({ onError }: UseAIChatProps) => {
  const [sending, setSending] = useState(false);

  const sendQuestion = async (
    question: string,
    websiteId: string
  ): Promise<string> => {
    setSending(true);

    try {
      const response = await askQuestion(question, websiteId);

      if (response.data.success) {
        return response.data.data.answer;
      } else {
        throw new Error(response.data.message || "Failed to get AI response");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred";
      onError(errorMessage);
      throw error;
    } finally {
      setSending(false);
    }
  };

  return {
    sending,
    sendQuestion,
  };
};
