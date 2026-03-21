const knex = require("../connections/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateError = require("../utils/validateError");
const path = require("path");
const fs = require("fs/promises");
const sharp = require("sharp");

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
        const normalizedEmail = email.trim().toLowerCase();
        const user = await knex('users')
            .whereRaw('LOWER(email) = ?', [normalizedEmail])
            .first();

        if (!user) {
            return res.status(400).json({
                message: 'Credenciais inválidas.'
            });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                message: 'Credenciais inválidas.'
            })
        };
        const token = jwt.sign({ id: user.id }, process.env.JWT_KEY, { expiresIn: "1d" });

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({});

    } catch (error) {
        return validateError(error, res)
    }
}

const logoutUser = (req, res) => {
    res.clearCookie("access_token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
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

const uploadAvatar = async (req, res) => {
    const avatar = req.file
    const { user } = req

    try {
        if (!avatar) {
            return res.status(400).json({
                status: "error",
                message: "O arquivo de avatar é obrigatório.",
                code: "AVATAR_REQUIRED",
            });
        }
        if (user.avatar) {
            const oldPath = path.join(process.cwd(), "src", user.avatar);
            try {
                await fs.unlink(oldPath);
            } catch (err) {
                if (err.code !== "ENOENT") {
                    console.error("Erro ao excluir avatar antigo:", err);
                }
            }
        }
        const dir = path.join(process.cwd(), "src", "assets", "avatar");
        await fs.mkdir(dir, { recursive: true });
        const filename = `${req.user.id}-${Date.now()}.webp`;
        const outPath = path.join(dir, filename);
        const buffer = await sharp(avatar.buffer)
            .rotate()
            .webp({ quality: 82 })
            .toBuffer();
        await fs.writeFile(outPath, buffer);
        const publicUrl = `https://tarefasapi.kauanrodrigues.com.br/assets/avatar/${filename}`;
        await knex("users").where({ id: req.user.id }).update({ avatar: publicUrl });
        return res.status(200).json({ avatar: publicUrl })
    } catch (error) {
        validateError(error, res)
    }
}

const deleteAvatar = async (req, res) => {
    try {
        const { id, avatar } = req.user;

        if (avatar) {
            const filePath = path.join(process.cwd(), "src", "assets", "avatar", path.basename(avatar));
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await knex("users").where({ id }).update({ avatar: null });

        return res.status(200).json({ message: "Foto removida com sucesso." });
    } catch (err) {
        return validateError(err, res);
    }
}
module.exports = { deleteAvatar, registerUser, loginUser, updateUser, deleteUser, listUser, logoutUser, uploadAvatar }