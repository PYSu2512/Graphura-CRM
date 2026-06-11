const express = require("express");
const router = express.Router();
const leadController = require("../controllers/lead.controller");
const adminController = require("../controllers/admin.controller");
const { requireAdmin } = require("../middleware/auth");

router.get("/leads", requireAdmin, leadController.getAdminLeads);
router.get("/profile", requireAdmin, adminController.getAdminProfile);
router.patch("/profile", requireAdmin, adminController.updateAdminProfile);

// Project routes (Admin — view/status-update/delete only)
router.get("/projects",              requireAdmin, adminController.listAdminProjects);
router.get("/projects/:id",          requireAdmin, adminController.getAdminProject);
router.patch("/projects/:id/status", requireAdmin, adminController.updateAdminProjectStatus);
router.delete("/projects/:id",       requireAdmin, adminController.deleteAdminProject);

// HRM routes (Admin)
router.get("/hrm/employees", requireAdmin, adminController.getHrmEmployees);

// Reports (Admin)
router.get("/reports", requireAdmin, adminController.getReports);

module.exports = router;
