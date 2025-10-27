import { QueryClient } from "@tanstack/react-query";
import { auth } from "@/config/firebase";

// Helper to get auth headers with Firebase ID token
async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  // Add Firebase ID token if user is authenticated
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Failed to get ID token:", error);
    }
  }
  
  return headers;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const headers = await getAuthHeaders();
        
        const res = await fetch(queryKey[0] as string, {
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }

          throw new Error(`${res.status}: ${await res.text()}`);
        }

        return res.json();
      },
    },
  },
});

type ApiRequestOptions = {
  method?: string;
  headers?: HeadersInit;
  body?: any;
};

export async function apiRequest(
  url: string,
  { method = "POST", headers: customHeaders, body }: ApiRequestOptions = {}
) {
  const authHeaders = await getAuthHeaders();
  
  const res = await fetch(url, {
    method,
    headers: {
      ...authHeaders,
      ...customHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status >= 500) {
      throw new Error(`${res.status}: ${res.statusText}`);
    }

    throw new Error(`${res.status}: ${await res.text()}`);
  }

  return res.json();
}
