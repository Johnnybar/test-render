import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EventFinderProvider } from "./context/provider";
import { CircularProgress, Box } from "@mui/material";

import "./index.css";

// Lazy load components for code splitting
const App = lazy(() => import("./App"));
const CombinedView = lazy(() => import("./Combined"));
const Dashboard = lazy(() => import("./Dashboard"));

// Loading component
const LoadingSpinner = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <CircularProgress />
  </Box>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <EventFinderProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/map" element={<CombinedView />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </EventFinderProvider>
    </BrowserRouter>
  </StrictMode>
);
