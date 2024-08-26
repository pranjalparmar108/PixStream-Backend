module.exports = (obj) => {
    try {
        if (!obj) return null;
        let {
            name,
            mobileNumber,
            email,
            dateOfBirth,
            gender,
            address,
            disease,
            password
        } = obj;
        let requestBody = {
            name: name,
            mobile_number: mobileNumber,
            email: email,
            date_of_birth: dateOfBirth,
            gender: gender,
            address: address,
            disease: disease,
            password: password,
        }
        return requestBody;
    } catch (error) {
        throw error;
    }
};