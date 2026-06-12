const express = require("express");
const router  = express.Router();
const leadController  = require("../controllers/lead.controller");
const adminController = require("../controllers/admin.controller");
const { requireAdmin } = require("../middleware/auth");

router.get("/leads",   requireAdmin, leadController.getAdminLeads);
router.get("/profile", requireAdmin, adminController.getAdminProfile);
router.patch("/profile", requireAdmin, adminController.updateAdminProfile);

// Projects
router.get("/projects",              requireAdmin, adminController.listAdminProjects);
router.get("/projects/:id",          requireAdmin, adminController.getAdminProject);
router.patch("/projects/:id/status", requireAdmin, adminController.updateAdminProjectStatus);
router.delete("/projects/:id",       requireAdmin, adminController.deleteAdminProject);

// HRM
router.get("/hrm/employees", requireAdmin, adminController.getHrmEmployees);

// Reports
router.get("/reports", requireAdmin, adminController.getReports);

// Dashboard
router.get("/dashboard", requireAdmin, adminController.getDashboardStats);

// Finance
router.get("/finance",               requireAdmin, adminController.getFinanceStats);
router.get("/invoices",              requireAdmin, adminController.listAdminInvoices);
router.get("/expenses",              requireAdmin, adminController.listAdminExpenses);
router.post("/expenses",             requireAdmin, adminController.createAdminExpense);
router.patch("/expenses/:id/status", requireAdmin, adminController.updateAdminExpenseStatus);

module.exports = router;
