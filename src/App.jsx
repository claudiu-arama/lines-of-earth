import QueryForm from "./components/QueryForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    },
  },
})
function App() {
    return (
        <div>
            <QueryClientProvider client={queryClient}>
                <QueryForm />
            </QueryClientProvider>
        </div>
    );
}

export default App;
