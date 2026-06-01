import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import FinanceDashboard    from "../pages/finance/FinanceDashboard";
import Payments            from "../pages/finance/Payments";
import PaymentSuccess      from "../pages/finance/PaymentSuccess";
import WorkOrders          from "../pages/finance/WorkOrders";
import Invoices            from "../pages/finance/Invoices";
import Expenses            from "../pages/finance/Expenses";
import GlobalPayment       from "../pages/finance/GlobalPayment";
import FinanceNotifications from "../pages/finance/FinanceNotifications";
import FinanceLoginLogs    from "../pages/finance/FinanceLoginLogs";
import FinanceHRM          from "../pages/finance/FinanceHRM";
import FinanceProfile from "../pages/finance/FinanceProfile";
import Clients from "../pages/finance/Clients";

function FinanceRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index                  element={<FinanceDashboard />}     />
        <Route path="dashboard"         element={<Navigate to="/finance" replace />} />
        <Route path="clients"           element={<Clients />}                />
        <Route path="payments"        element={<Payments />}             />
        <Route path="payments/success" element={<PaymentSuccess />}       />
        <Route path="work-orders"     element={<WorkOrders />}           />
        <Route path="invoices"        element={<Invoices />}             />
        <Route path="expenses"        element={<Expenses />}             />
        <Route path="global-payment"  element={<GlobalPayment />}        />
        <Route path="notifications"   element={<FinanceNotifications />} />
        <Route path="logs"            element={<FinanceLoginLogs />}     />
        <Route path="hrm"             element={<FinanceHRM />}           />
        <Route path="profile"         element={<FinanceProfile />}              />
        <Route path="*"                 element={<Navigate to="/finance" replace />} />
      </Route>
    </Routes>
  );
}

export default FinanceRoutes;
