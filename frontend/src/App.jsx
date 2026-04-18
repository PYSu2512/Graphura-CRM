import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminRoutes from "./routes/adminRoutes";

// 👇 tumhara existing UI import (optional)
import Home from "./pages/Home"; // agar hai toh
// ya jo bhi tum use kar rahe the

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ Admin Panel */}
        <Route path="/*" element={<AdminRoutes />} />

        {/* ✅ Old UI (optional) */}
        {/* <Route path="/old" element={<Home />} /> */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;