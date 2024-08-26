const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize("HMS-PORTAL-NODE", "root", "", {
  host: "127.0.0.1",
  port: '3306',
  dialect: 'mysql',
});


sequelize.authenticate().then(() => {
  console.log('Connected to database');
}).catch((e) => {
  console.log(e);
})




const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.users = require('../models/users')(sequelize, DataTypes);
db.doctors = require("../models/doctors")(sequelize, DataTypes);
db.patients = require("../models/patients")(sequelize, DataTypes);
db.hospitals = require("../models/hospitals")(sequelize, DataTypes);
db.doctorSchedules = require("../models/doctorSchedules")(sequelize, DataTypes);
db.doctorSlots = require("../models/doctorSlots")(sequelize, DataTypes);
db.appointments = require("../models/appointments")(sequelize, DataTypes);
db.payments = require("../models/payments")(sequelize, DataTypes);
db.refunds = require("../models/refunds")(sequelize, DataTypes);

// creating one to one relationship between patients and users table
db.patients.belongsTo(db.users, { foreignKey: "email" });

// creating one to one relationship between doctors and users table
db.doctors.belongsTo(db.users, { foreignKey: "email" });

// creating one to many relationship between doctors and doctorSchedules
db.doctors.hasMany(db.doctorSchedules, { foreignKey: "doctor_id", as: 'doctorSchedules' })
db.doctorSchedules.belongsTo(db.doctors, { foreignKey: "doctor_id", as: 'doctors' });

// creating one to many relationship between hospitals and doctorSchedules
db.hospitals.hasMany(db.doctorSchedules, { foreignKey: "hospital_id", as: 'schedules' })
db.doctorSchedules.belongsTo(db.hospitals, { foreignKey: "hospital_id", as: 'hospitals' });

// creating one to many relationship between doctorSchedules and doctorSlots
db.doctorSchedules.hasMany(db.doctorSlots, { foreignKey: "schedule_id", as: 'slots' })
db.doctorSlots.belongsTo(db.doctorSchedules, { foreignKey: "schedule_id", as: 'doctorSchedules' });

// creating one to many relationship between doctors and appointments
db.doctors.hasMany(db.appointments, { foreignKey: "doctor_id", as: 'appointments' })
db.appointments.belongsTo(db.doctors, { foreignKey: "doctor_id", as: 'doctors' });

// creating one to many relationship between patients and appointments
db.patients.hasMany(db.appointments, { foreignKey: "patient_id", as: 'appointments' });
db.appointments.belongsTo(db.patients, { foreignKey: "patient_id", as: 'patients' });

// creating one to one  relationship between doctorSlots and appointments
db.appointments.belongsTo(db.doctorSlots, { foreignKey: "slot_id" });

// creating one to one  relationship between appointments and payments
db.appointments.hasOne(db.payments, { foreignKey: "appointment_id", as: 'payments' })
db.payments.belongsTo(db.appointments, { foreignKey: "appointment_id", as: 'appointments' });

// creating one to one  relationship between payments and refunds
db.refunds.belongsTo(db.payments, { foreignKey: "payment_id" });




db.users.sync().then(() => { console.log("resyncing users model") }).catch((err) => { console.log("err while users", err) });
db.doctors.sync().then(() => { console.log("resyncing doctors model") }).catch((err) => { console.log("err while doctors", err) });
db.patients.sync().then(() => { console.log("resyncing patients model") }).catch((err) => { console.log("err while patients", err) });
db.hospitals.sync().then(() => { console.log("resyncing hospitals model") }).catch((err) => { console.log("err while hospitals", err) });
db.doctorSchedules.sync().then(() => { console.log("resyncing doctorSchedules model") }).catch((err) => { console.log("err while doctorSchedules", err) });
db.doctorSlots.sync().then(() => { console.log("resyncing doctorSlots model") }).catch((err) => { console.log("err while doctorSlots", err) });
db.appointments.sync().then(() => { console.log("resyncing appointments model") }).catch((err) => { console.log("err while appointments", err) });
db.payments.sync().then(() => { console.log("resyncing payments model") }).catch((err) => { console.log("err while payments", err) });
db.refunds.sync().then(() => { console.log("resyncing refunds model") }).catch((err) => { console.log("err while refunds", err) });
// sequelize.sync().then(() => {
// }).catch((e) => {
//     console.log("there is an error while synching", e);
// })



module.exports = db;