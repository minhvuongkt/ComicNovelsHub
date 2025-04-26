import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="goctruyennho-theme">
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);
