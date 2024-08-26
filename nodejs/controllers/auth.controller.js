const db = require("../db/index");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(201).json({ "message": "Please enter all the fields correctly!" });
        }

        const user = await db.users.findOne({ where: { email: email } });

        if (!user) {
            return res.status(201).json({ "message": "User not found!" });
        }

        if (user.password != password) {
            return res.status(201).json({ "message": "Incorrect Password!" });
        }

        const secretKey = '12345Secret';
        const expiresIn = 2000000;
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, secretKey, { expiresIn: expiresIn });

        return res.status(200).json({
            "token": token,
            "role": user.role,
            "expiresIn": `${expiresIn / 1000} Seconds`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong!" });
    }
};
module.exports = { login }