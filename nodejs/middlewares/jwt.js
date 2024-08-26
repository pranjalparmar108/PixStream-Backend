const jwt = require('jsonwebtoken');
const db = require("../db/index");
const secretKey = '12345Secret';

const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ "message": "Authorization token is missing" });
        }

        const decoded = jwt.verify(token, secretKey);
        if (decoded) {
            const useremail = decoded.email;
            const user = await db.users.findOne({ where: { email: useremail } });

            if (!user) return res.status(203).json({ "message": "Unauthorized" });
            req.userData = decoded;
            next();

        } else {
            return res.status(203).json({ "message": "Unauthorized" });
        }
    } catch (error) {
        return res.status(403).json({ "message": "Invalid token" });
    }
};

module.exports = { verifyToken };
