const db = require("../db/index");

const viewSlots = async (req, res) => {
    try {
        const { scheduleId } = req.query;
        const slotsByScheduleId = await db.doctorSlots.findAll({
            where: {
                schedule_id: scheduleId
            }
        });

        const result = slotsByScheduleId.map(slot => ({
            slotId: slot.slots_id,
            date: slot.date,
            timeSlot: slot.time_slot,
            availability: slot.availability,
        }));

        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong!" });
    }

};

module.exports = { viewSlots }