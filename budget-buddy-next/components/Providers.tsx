"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
    // We use useState to ensure the QueryClient is only created once per user session,
    // preventing data loss if React decides to suspend or re-render the component.

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
