const db = require("../db/index");
const { Op } = require('sequelize');

const convertTimeToDateTime = (inputTime) => {
    const [time, period] = inputTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    const date = new Date();

    date.setHours(hours + (period === 'PM' && hours < 12 ? 12 : 0));
    date.setMinutes(minutes);

    return date;
}

function transformDayOfWeek(dayOfWeekString) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return daysOfWeek.indexOf(dayOfWeekString);
}

const createHospital = async (req, res) => {
    try {
        const existinghospitalCount = await db.hospitals.count({ where: { name: req.body.name, city: req.body.city } });
        if (existinghospitalCount > 0) {
            return res.status(400).json({ error: 'Hospital already exists.' });
        }
        let hospital = await db.hospitals.create(req.body);
        return res.status(200).json({ "message": "Hospital created Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong!" });
    }
};
const addSchedule = async (req, res) => {
    try {
        let requestBody = {
            doctor_id: req.body.doctorId,
            hospital_id: req.body.hospitalId,
            day_of_week: req.body.dayOfWeek,
            start_time: req.body.visitingHours.startTime,
            end_time: req.body.visitingHours.endTime
        }
        const hospitalCount = await db.hospitals.count({ where: { id: requestBody.hospital_id } });
        const doctorCount = await db.doctors.count({ where: { id: requestBody.doctor_id } });
        if (hospitalCount < 1 || doctorCount < 1) {
            return res.status(400).json({ error: 'Doctor or Hospital does not exist' });
        }
        let doctorScheduleExist = await db.doctorSchedules.findOne({
            where: {
                doctor_id: requestBody.doctor_id,
                hospital_id: requestBody.hospital_id,
                day_of_week: requestBody.day_of_week,
                [Op.or]: [
                    {
                        start_time: {
                            [Op.eq]: requestBody.start_time
                        }
                    },
                    {
                        [Op.and]: [
                            {
                                start_time: {
                                    [Op.lte]: requestBody.start_time
                                }
                            },
                            {
                                end_time: {
                                    [Op.gte]: requestBody.end_time
                                }
                            }
                        ]
                    },
                    {
                        [Op.and]: [
                            {
                                start_time: {
                                    [Op.gte]: req.body.start_time
                                }
                            },
                            {
                                start_time: {
                                    [Op.lte]: req.body.end_time
                                }
                            }
                        ]
                    }
                ]
            }
        });

        if (doctorScheduleExist) {
            return res.status(400).json({ error: 'Schedule already exists for this period.' });
        }

        let doctorSchedule = await db.doctorSchedules.create(requestBody);

        const slotDuration = 30 * 60 * 1000; //30 Minutes

        const startTime = convertTimeToDateTime(requestBody.start_time);
        const endTime = convertTimeToDateTime(requestBody.end_time);
        if (endTime < startTime) {
            endTime.setDate(endTime.getDate() + 1);
        }

        const difference = endTime - startTime;
        const numberOfSlots = Math.floor((difference) / slotDuration);

        const currentDate = new Date();
        const currentDayOfWeek = currentDate.getDay();
        const requestDayOfWeekNumber = transformDayOfWeek(requestBody.day_of_week);

        let dayDifference = requestDayOfWeekNumber - currentDayOfWeek;
        if (dayDifference < 0) {
            dayDifference += 7;
        }

        // Calculate the date of the next occurrence
        let nextOccurrence = new Date(currentDate);
        nextOccurrence.setDate(currentDate.getDate() + dayDifference);

        const occurrences = [];
        // Calculate occurrences for the next four weeks
        for (let week = 0; week < 4; week++) {
            for (let day = nextOccurrence.getDate(); day <= nextOccurrence.getDate() + 6; day++) {
                const date = new Date(nextOccurrence);
                date.setDate(day);
                occurrences.push(date);
            }
            // Move to the next week
            nextOccurrence.setDate(nextOccurrence.getDate() + 7);
        };


        for (const date of occurrences) {
            for (let i = 0; i < numberOfSlots; i++) {
                let slotStartTime = new Date(date.getTime() + i * slotDuration);
                let slotEndTime = new Date(slotStartTime.getTime() + slotDuration);

                await db.doctorSlots.create({
                    schedule_id: doctorSchedule.id,
                    date: date,
                    time_slot: slotStartTime,
                    availability: 'Available',
                });
            }
        }

        return res.status(200).json({ "message": "Schedule added Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong!" });
    }
};
const searchDoctors = async (req, res) => {
    try {
        const { specialization } = req.query;
        const result = await db.doctors.findAll({
            where: { specialization: specialization },
            attributes: {
                exclude: ["createdAt", "updatedAt"]
            },
            include: [
                {
                    model: db.doctorSchedules,
                    as: 'doctorSchedules',
                    attributes: ['id'],
                    include: [
                        {
                            model: db.hospitals,
                            as: 'hospitals',
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            },
                            include: [
                                {
                                    model: db.doctorSchedules,
                                    as: 'schedules',
                                    attributes: {
                                        exclude: ["createdAt", "updatedAt", "hospital_id", "doctor_id"]
                                    },
                                    include: [
                                        {
                                            model: db.doctorSlots,
                                            as: 'slots',
                                            attributes: {
                                                exclude: ["createdAt", "updatedAt", "schedule_id"]
                                            },
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        })

        return res.status(200).json({ "doctors": result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong!" });
    }
};

const checkCVVValidity = async (cvv) => {
    const cvvRegex = /^[0-9]{3,4}$/;

    if (!cvv || !cvvRegex.test(cvv)) {
        return false;
    } else {
        return true;
    }
}

const bookAppointmentWithPayment = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        let requestBody = {
            doctor_id: req.body.doctorId,
            patient_id: req.body.patientId,
            slot_id: req.body.slotId,
            payment_mode: req.body.paymentDetails.paymentMode,
            amount: req.body.paymentDetails.amount,
            upi_id: req.body.paymentDetails.upiId,
            credit_card_number: req.body.paymentDetails.creditCardDetails.cardNumber,
            credit_card_expiry_date: req.body.paymentDetails.creditCardDetails.expiryDate,
            credit_card_cvv: req.body.paymentDetails.creditCardDetails.cvv,
        }

        //chking slot availability
        const slotavailability = await db.doctorSlots.findOne({
            where: {
                slots_id: requestBody.slot_id,
                availability: 'Available'
            },
            transaction: t
        })
        if (slotavailability) {
            // If slot is available, book the appointment
            slotavailability.availability = 'Booked';
            await slotavailability.save({ transaction: t });

            const appointmentmade = await db.appointments.create({
                doctor_id: requestBody.doctor_id,
                patient_id: requestBody.patient_id,
                slot_id: requestBody.slot_id,
                appointment_time: slotavailability.time_slot,
                status: 'pending'
            }, { transaction: t });

            //payment
            const cvvCheck = await checkCVVValidity(requestBody.credit_card_cvv);

            if (cvvCheck) {
                appointmentmade.status = 'booked'
                await appointmentmade.save({ transaction: t });
                const paymentSuccess = await db.payments.create({
                    appointment_id: appointmentmade.id,
                    payment_mode: requestBody.payment_mode,
                    amount: requestBody.amount,
                    upi_id: requestBody.upi_id,
                    credit_card_number: requestBody.credit_card_number,
                    credit_card_expiry_date: requestBody.credit_card_expiry_date,
                    credit_card_cvv: requestBody.credit_card_cvv,
                }, { transaction: t });
                await t.commit();

                return res.status(200).json({
                    "status": "success",
                    "message": "Appointment booked & payment processed",
                    "appointmentDetails": {
                        appointmentId: appointmentmade.id,
                        doctorId: requestBody.doctor_id,
                        patientId: requestBody.patient_id,
                        slotId: requestBody.slot_id,
                        appointmentTime: slotavailability.time_slot,
                        status: "booked"
                    },
                    "paymentDetails": {
                        paymentId: paymentSuccess.id,
                        appointmentId: appointmentmade.id,
                        amount: requestBody.amount,
                        paymentMode: requestBody.payment_mode,
                        paymentStatus: "completed",
                    }
                });
            } else {
                appointmentmade.status = 'cancelled'
                slotavailability.availability = 'Available';
                await slotavailability.save({ transaction: t });
                await appointmentmade.save({ transaction: t });
                await t.commit();
                return res.status(201).json({
                    "status": "failure",
                    "message": "Payment failed. Appointment slot released.",
                    "errorDetails": {
                        "errorStage": "Payment Processing",
                        "errorCode": "PaymentGatewayError",
                        "errorMessage": "Payment Rejected",
                    }
                });
            }
        } else {
            await t.rollback();
            return res.status(400).json({ error: "Slot is not available." });
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return res.status(500).json({ error: "Something went wrong!" });
    }
};


const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
 
        const appointment = await db.appointments.findByPk(appointmentId);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
 
        const payment = await db.payments.findOne({ where: { appointment_id: appointmentId } });
        if (!payment) {
            return res.status(400).json({ error: 'No payment found' });
        }
        appointment.status = 'cancelled'
        await appointment.save();
        const slotId = appointment.slot_id;
 
        await db.doctorSlots.update({ availability: 'Available' }, { where: { slots_id: slotId } });
      
        const refund = await db.refunds.create({
            payment_id: payment.id,
            amount_refunded: payment.amount,
            refund_mode: payment.payment_mode,
            refund_transaction_id: 'your_refund_transaction_id',
            refund_date: new Date(),
            status: 'Processed',
        });
 
        res.json({ message: 'Appointment cancelled successfully and refund processed', refund });
    } catch (error) {
        res.status(400).send(error.message);
    }
};
module.exports = { createHospital, addSchedule, searchDoctors, bookAppointmentWithPayment, cancelAppointment }