import QueryForm from "./components/QueryForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// window.__TANSTACK_QUERY_CLIENT__ = queryClient;

const queryClient = new QueryClient();

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
