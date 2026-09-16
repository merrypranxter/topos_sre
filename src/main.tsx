import { createRoot } from "react-dom/client";
import { DashboardShell } from "@/components/dashboard/shell";
import "@/styles.css";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Missing #app root element");
}

createRoot(root).render(<DashboardShell />);
