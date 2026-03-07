// Connection status utility to monitor Appwrite connectivity
export const checkConnectivity = async () => {
  try {
    // Test internet connectivity
    const response = await fetch("https://www.google.com/generate_204", {
      method: "HEAD",
      mode: "no-cors",
    });

    return { online: true, appwrite: true };
  } catch (error) {
    return { online: false, appwrite: false };
  }
};

export const getNetworkErrorMessage = (errorCode: string) => {
  const messages: Record<string, string> = {
    network_request_failed:
      "Network connection failed. Please check your internet and try again.",
    timeout: "Request timed out. Please check your connection and retry.",
    "401": "Invalid credentials. Please check your email and password.",
    "409": "An account with this email already exists.",
    "429": "Too many requests. Please wait a moment and try again.",
    user_not_found: "Account not found. Please sign up first.",
    unauthorized: "Session expired. Please sign in again.",
    general_rate_limit_exceeded: "Rate limit exceeded. Please wait a moment.",
  };

  return messages[errorCode] || "An error occurred. Please try again.";
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      if (attempt === maxRetries || !isRetriableError(error)) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error("Max retries exceeded");
};

const isRetriableError = (error: any): boolean => {
  const retriableCodes = ["network_request_failed", "timeout", "503", "500"];

  return retriableCodes.some(
    (code) =>
      error?.code?.toString().includes(code) || error?.message?.includes(code),
  );
};
