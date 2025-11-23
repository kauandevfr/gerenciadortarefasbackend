const knex = require("../connections/database");
const validateError = require("../utils/validateError");

const listTasks = async (req, res) => {
    const { id } = req.user;
    try {
        const tasks = await knex('tasks')
            .where({ user_id: id })
            .orderBy('createdat', 'desc');

        return res.status(200).json(tasks)
    } catch (error) {
        return validateError(error, res)
    };
};

const registerTask = async (req, res) => {
    const { description, completed } = req.body;
    const { id } = req.user;
    try {
        const task = await knex('tasks').insert({ description, completed, user_id: id }).returning('*');
        return res.status(202).json(task);
    } catch (error) {
        return validateError(error, res)
    };
};

const updateTask = async (req, res) => {
    const { description, completed } = req.body;
    const { id } = req.params;
    const { user } = req
    try {
        await knex('tasks').update({ description, completed }).where({ id, user_id: user.id });
        return res.status(204).json({});
    } catch (error) {
        return validateError(error, res)
    };
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