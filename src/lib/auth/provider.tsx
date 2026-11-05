import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { startAuthCookieSync } from "./client";

/**
 * App-wide client provider mounted once near the top of `<body>` in `__root.tsx`.
 * Query + toasts live here so route files stay free of provider boilerplate.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      }),
  );
  useEffect(() => startAuthCookieSync(), []);

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          className: "font-sans",
        }}
      />
    </QueryClientProvider>
  );
}
