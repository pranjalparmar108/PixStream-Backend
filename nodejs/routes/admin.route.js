const routes = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middlewares/jwt');
const { checkUserRole } = require('../middlewares/userRoleAccess');

routes.post("/doctors/register", verifyToken, checkUserRole(['admin']), adminController.registerDoctor);
routes.post("/reports/doctor-availability-utilization", verifyToken, checkUserRole(['admin']), adminController.doctorAvailabilityUtilization);
routes.get("/reports/financial-transaction-billing", verifyToken, checkUserRole(['admin']), adminController.financialTransactionBilling);

module.exports = routes;