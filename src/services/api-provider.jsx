import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function ApiProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

