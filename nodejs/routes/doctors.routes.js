const routes = require('express').Router();
const doctorsController = require('../controllers/doctors.controller');
const { verifyToken } = require('../middlewares/jwt');

routes.get("/slots/view", verifyToken, doctorsController.viewSlots);

module.exports = routes;