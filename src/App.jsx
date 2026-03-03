import QueryForm from "./components/QueryForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
window.__TANSTACK_QUERY_CLIENT__ = queryClient;
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
