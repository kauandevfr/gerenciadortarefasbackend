const knex = require("../connections/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateError = require("../utils/validateError");

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userEmail = await knex('users').where({ email }).first();
        if (userEmail) {
            return res.status(400).json({
                message: 'Email já cadastrado.'
            })
        };
        const encryptedPassword = await bcrypt.hash(password, 10);
        await knex('users').insert({ name, email, password: encryptedPassword });
        return res.status(202).json({})
    } catch (error) {
        return validateError(error, res)
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await knex('users').where({ email }).first();
        if (!user) {
            return res.status(400).json({
                message: 'Credenciais inválidas.'
            })
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                message: 'Credenciais inválidas.'
            })
        };
        const token = jwt.sign({ id: user.id }, process.env.JWT_KEY, { expiresIn: "1d" });

        console.log(token)

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({})

    } catch (error) {
        return validateError(error, res)
    }
}

const logoutUser = (req, res) => {

    res.clearCookie("access_token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    });

    return res.status(200).json({});
};


const updateUser = async (req, res) => {
    const { name, email, currentPassword, newPassword, theme } = req.body;
    const { user } = req;
    const updateData = {};
    try {
        if (newPassword) {
            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return res.status(400).json({
                    message: 'A senha atual está incorreta ou não foi fornecida.'
                });
            }
            const encryptedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = encryptedPassword;
        }
        if (email) {
            const existingEmail = await knex('users').where({ email }).first();

            if (existingEmail && existingEmail.email !== user.email) {
                return res.status(400).json({
                    message: 'Email já cadastrado.'
                });
            }
            updateData.email = email;
        }
        if (name) {
            updateData.name = name;
        }
        if (theme) {
            updateData.theme = theme;
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json('Nenhuma informação para atualizar.');
        }
        await knex('users')
            .update(updateData)
            .where({ id: user.id });
        return res.status(200).json('Usuário atualizado com sucesso.');
    } catch (error) {
        return validateError(error, res)
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.user;
    try {
        await knex.transaction(async trx => {
            await trx('tasks').where({ user_id: id }).del();
            await trx('users').where({ id }).del();
        });
        return res.status(200).json({});
    } catch (error) {
        return validateError(error, res);
    }
};

const listUser = async (req, res) => {
    return res.status(200).json(req.user)
};

module.exports = { registerUser, loginUser, updateUser, deleteUser, listUser, logoutUser }