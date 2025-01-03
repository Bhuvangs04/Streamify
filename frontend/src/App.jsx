import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ClientRoutes from "./routes/ClientRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { ProtectedRoute } from "./routes/MainProtected";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Client Routes */}
          {ClientRoutes.map(({ path, element, isProtected }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute element={element} isProtected={isProtected} />
              }
            />
          ))}

          {/* Admin Routes */}
          {AdminRoutes.map(({ path, element, isProtected }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute
                  element={element}
                  isProtected={isProtected}
                  isAdmin
                />
              }
            />
          ))}
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
