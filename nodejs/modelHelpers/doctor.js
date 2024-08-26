module.exports = (obj) => {
    try {
        if (!obj) return null;
        let { name, registrationNumber, specialization, address, mobileNumber, email, yearsOfExperience, freeFollowUpDays, consultationFees, Password } = obj;
        let requestBody = {
            name: name,
            registration_number: registrationNumber,
            specialization: specialization,
            address: address,
            mobile_number: mobileNumber,
            email: email,
            years_of_experience: yearsOfExperience,
            free_follow_up_days: freeFollowUpDays,
            consultation_fees: consultationFees,
            password: Password,
        }
        return requestBody;
    } catch (error) {
        throw error;
    }
};