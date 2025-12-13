import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import JourneysListPage from "@/pages/journeys/JourneysListPage";
import JourneyBuilderPage from "@/pages/journeys/JourneyBuilderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/journeys" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/journeys" element={<JourneysListPage />} />
            <Route path="/journeys/:id" element={<JourneyBuilderPage />} />
            <Route path="/broadcasts" element={<div className="p-6"><h1 className="text-2xl font-bold">Broadcasts</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/segments" element={<div className="p-6"><h1 className="text-2xl font-bold">Segments</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/templates" element={<div className="p-6"><h1 className="text-2xl font-bold">Templates</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
