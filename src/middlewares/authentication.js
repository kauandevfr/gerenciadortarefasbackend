const knex = require("../connections/database");
const jwt = require("jsonwebtoken");
const validateError = require('../utils/validateError');

const authentication = async (req, res, next) => {
    const bearer = req.headers.authorization;
    const cookieToken = req.cookies?.access_token;
    const token = cookieToken || (bearer && bearer.split(" ")[1]);

    if (!token) {
        return res.status(401).json({ message: "Acesso negado" });
    }

    try {
        const { id } = jwt.verify(token, process.env.JWT_KEY);

        const user = await knex("users").where({ id }).first();
        if (!user) {
            return res.status(401).json({ message: "Acesso negado" });
        }


        delete user.password
        req.user = user;
        next();
    } catch (error) {
        return validateError(error, res);
    }
};

module.exports = authentication;
