const routes = require('express').Router();
const admin = require('./admin.route');
const api = require('./api.routes');
const auth = require('./auth.route');
const doctors = require('./doctors.routes');
const patients = require('./patients.routes');

routes.use('/admin', admin);
routes.use('/api', api);
routes.use('/auth', auth);
routes.use('/doctors', doctors);
routes.use('/patients', patients);

module.exports = routes;