import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import QueryForm from "./components/QueryForm";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
});
export default function App() {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <QueryForm />
      </QueryClientProvider>
    </div>
  );
}
