const knex = require("../connections/database");
const convertToBrazilTimezone = require("../utils/toBrazilTimezone");
const validateError = require("../utils/validateError");

const listTasks = async (req, res) => {
    const { id } = req.user;
    const { date } = req.query;

    try {
        const query = knex("tasks")
            .where({ user_id: id });

        if (
            date &&
            date !== "null" &&
            date !== "undefined" &&
            /^\d{4}-\d{2}-\d{2}$/.test(date)
        ) {
            query.andWhere("createdat", date);
        }

        const tasks = await query.orderBy("createdat", "desc");

        return res.status(200).json(tasks);
    } catch (error) {
        return validateError(error, res);
    }
};


const registerTask = async (req, res) => {
    const { id } = req.user;

    try {
        const task = await knex('tasks').insert({
            ...req.body, user_id: id
        }).returning('*');

        return res.status(202).json(task);
    } catch (error) {
        return validateError(error, res)
    };
};

const updateTask = async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    try {
        const updateData = { ...req.body };

        if (req.body.createdat) {
            updateData.createdat = new Date(req.body.createdat).toISOString().slice(0, 10);
        }

        await knex('tasks')
            .update(updateData)
            .where({ id, user_id: user.id });

        return res.status(204).json({});
    } catch (error) {
        return validateError(error, res);
    }
};


const deleteTask = async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    try {
        const task = await knex('tasks').where({ id, user_id: user.id }).first();
        if (!task) {
            return res.status(404).json({
                message: 'Tarefa não encontrada.'
            })
        };
        await knex('tasks').where({ id }).del();
        return res.status(200).json({});
    } catch (error) {
        return validateError(error, res)
    };
};

module.exports = { registerTask, updateTask, listTasks, deleteTask };