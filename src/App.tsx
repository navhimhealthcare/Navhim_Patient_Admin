import { createContext, useContext, useState } from "react";

import AppRoutes from "./routes/AppRoutes";
import { PageLoader } from "./components/Loader/Loader";
import { ToastContainer } from "react-toastify";
import usePageLoader from "./hooks/usePageLoader";

/* ── Global loader context ─────────────────────────────────────────── */
const LoaderContext = createContext(null);

export function useLoader() {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used inside <App>");
  return ctx;
}

/* ── Root App ───────────────────────────────────────────────────────── */
export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const loader = usePageLoader(400);

  return (
    <LoaderContext.Provider value={loader}>
      {/* ── Global fullscreen loader ── */}
      {loader.isLoading && <PageLoader text={loader.loadingText} />}

      {/* ── Routes ── */}
      <AppRoutes
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* ── Toast container ── */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={5}
      />
    </LoaderContext.Provider>
  );
}
