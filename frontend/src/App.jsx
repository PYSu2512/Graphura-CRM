import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { AttendanceProvider } from "./context/AttendanceContext";

function App() {
  return (
    <AttendanceProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "#fff",
            color: "#1a2e3f",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            border: "1px solid #e2e8f0",
            padding: "12px 16px",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
            style: { borderLeft: "4px solid #10b981" },
          },
          error: {
            iconTheme: { primary: "#f43f5e", secondary: "#fff" },
            style: { borderLeft: "4px solid #f43f5e" },
          },
        }}
      />
    </AttendanceProvider>
  );
}

export default App;
