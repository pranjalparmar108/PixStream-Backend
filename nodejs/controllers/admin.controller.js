const db = require("../db/index");
const doctorModel = require("../modelHelpers/doctor")
const { Op, Sequelize } = require('sequelize');

const registerDoctor = async (req, res) => {
    try {
        let doctorbody = doctorModel(req.body);

        const existingDoctorCount = await db.doctors.count({
            where: {
                [Op.or]: [
                    { email: doctorbody.email },
                    { registration_number: doctorbody.registration_number }
                ]
            }
        });
        if (existingDoctorCount > 0) {
            return res.status(400).json({ error: 'Doctor already exists.' });
        }
        let doctor = await db.doctors.create(doctorbody);
        return res.status(200).json({ "message": "Doctor registered Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong!" });
    }
};

const doctorAvailabilityUtilization = async (req, res) => {
    try {
        const { startDate, endDate, specialization, hospitalId } = req.query;
        let whereCondition = {
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        };

        if (specialization) {
            whereCondition.specialization = specialization;
        }

        if (hospitalId) {
            whereCondition.hospital_id = hospitalId;
        }

        const result = await db.doctors.findAll({
            include: [
                {
                    model: db.doctorSchedules,
                    as: 'doctorSchedules',
                    attributes: ['id'],
                    include: [
                        {
                            model: db.hospitals,
                            as: 'hospitals'
                        },
                        {
                            model: db.appointments,
                            as: 'appointments',
                            attributes: ['id']
                        }
                    ]
                }
            ],
            where: whereCondition
        });

        const totalAppointments = await db.appointments.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        const formattedResult = {
            doctors: result, // Assuming the result is an array of doctors
            appointmentUtilization: {
                totalAppointments: totalAppointments.length,
                cancelledAppointments: totalAppointments.filter(data => data.status === 'cancelled').length,
                completedAppointments: totalAppointments.filter(data => data.status === 'completed').length,
            }
        };
        return res.status(200).json(formattedResult);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong!" });
    }
};

const financialTransactionBilling = async (req, res) => {
    try {
        const { startDate, endDate, paymentMode } = req.query;
        let whereCondition = {};
        let dateCondition = '';
        if (startDate && endDate) {
            whereCondition.createdAt = {
                [Op.between]: [startDate, endDate]
            };
            dateCondition = `WHERE createdAt BETWEEN '${startDate}' AND '${endDate}'`;
        }
        if (paymentMode) {
            whereCondition.payment_mode = {
                [Op.eq]: [paymentMode]
            };
        }
        let result = await db.payments.findAll({
            attributes: {
                exclude: [
                    "credit_card_number",
                    "credit_card_expiry_date",
                    "credit_card_cvv",
                    "upi_id",
                    "updatedAt",
                ],
                raw: true,
                include: [
                    [
                        Sequelize.literal(`(
                        SELECT SUM(amount) FROM payments 
                         ${dateCondition ?? dateCondition}
                    )`),
                        "totalRevenue",
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(id) FROM payments 
                        ${dateCondition ?? dateCondition}
                    )`),
                        "totalTransactions",
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT SUM(amount) FROM payments 
                        ${dateCondition ?? dateCondition}
                        AND payment_mode = "cash"
                    )`),
                        "Cash"
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT SUM(amount) FROM payments 
                        ${dateCondition ?? dateCondition}
                        AND payment_mode = "UPI"
                    )`),
                        "UPI"
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT SUM(amount) FROM payments 
                        ${dateCondition ?? dateCondition}
                        AND payment_mode = "Credit Card"
                    )`),
                        "Credit Card"
                    ]
                ],
            },
            where: whereCondition,
            include: [
                {
                    model: db.appointments,
                    as: 'appointments',
                    attributes: ['patient_id'],
                    include: [
                        {
                            model: db.patients,
                            as: 'patients',
                            attributes: ['name', 'id']
                        }
                    ]
                }
            ],
        });



        result = result.map(row => row.get({ plain: true }));
        const billingDetails = result.map(row => {
            return {
                "transactionId": row.id,
                "date": row.createdAt,
                "amount": row.amount,
                "paymentMode": row.payment_mode,
                "patientId": row.appointments.patients.id,
                "patientName": row.appointments.patients.name,
                "appointmentId": row.appointment_id
            };
        });
        if (result.length > 0) {
            const formattedResult = {
                "financialSummary": {
                    totalRevenue: result[0].totalRevenue || 0,
                    totalTransactions: result[0].totalTransactions || 0,
                    paymentModeDistribution: {
                        cash: result[0].Cash || 0,
                        'UPI': result[0].UPI || 0,
                        'creditcard': result[0]['Credit Card'] || 0
                    }
                },
                "billingDetails": billingDetails
            };
            return res.status(200).json(formattedResult);
        }
        return res.status(200).json('No Payment history');
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong!" });
    }
};

module.exports = { registerDoctor, doctorAvailabilityUtilization, financialTransactionBilling }