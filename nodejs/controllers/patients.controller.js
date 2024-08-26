const db = require("../db/index");
const patientModel = require("../modelHelpers/patient")

const registerPatient = async (req, res) => {
    try {
        let patientbody = patientModel(req.body);

        const existingPatientCount = await db.patients.count({ where: { email: patientbody.email } });
        if (existingPatientCount > 0) {
            return res.status(400).json({ error: 'Patient already exists.' });
        }
        let patient = await db.patients.create(patientbody);
        return res.status(200).json({ "message": "Patient registered Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong!" });
    }
};

module.exports = { registerPatient }