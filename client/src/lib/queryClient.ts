import { QueryClient } from "@tanstack/react-query";

async function handleRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    const message = await response.text();
    throw new Error(message || `${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function defaultQueryFn({ queryKey }: { queryKey: any[] }) {
  return handleRequest(queryKey[0] as string);
}

export async function apiRequest(url: string, options?: RequestInit) {
  return handleRequest(url, options);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});
