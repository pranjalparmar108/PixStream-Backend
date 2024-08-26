const routes = require('express').Router();
const patientsController = require('../controllers/patients.controller');
const { verifyToken } = require('../middlewares/jwt');

routes.post("/register", verifyToken, patientsController.registerPatient);

module.exports = routes;