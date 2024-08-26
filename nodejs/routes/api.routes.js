const routes = require('express').Router();
const apiController = require('../controllers/api.controller');
const { verifyToken } = require('../middlewares/jwt');
const { checkUserRole } = require('../middlewares/userRoleAccess');

routes.post("/create-hospital", verifyToken, checkUserRole(['admin']), apiController.createHospital);
routes.post("/add-schedule", verifyToken, apiController.addSchedule);
routes.get("/search-doctors", verifyToken, apiController.searchDoctors);
routes.post("/book-appointment-with-payment", verifyToken, apiController.bookAppointmentWithPayment);
routes.post("/cancel-appointment", verifyToken, apiController.cancelAppointment);

module.exports = routes;