const express = require('express');
const routes = express();
const authentication = require('../middlewares/authentication')
const validateRequest = require('../middlewares/validateRequest');

const {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    listUser,
    logoutUser
} = require('../controllers/users');

const {
    listTasks,
    registerTask,
    updateTask,
    deleteTask
} = require('../controllers/tasks');

const loginSchema = require('../schemas/user/login');
const updateUserSchema = require('../schemas/user/update');
const registerUserSchema = require('../schemas/user/register');

const taskSchema = require('../schemas/task/add')

routes.post('/user/login', validateRequest(loginSchema), loginUser);
routes.post('/user/register', validateRequest(registerUserSchema), registerUser);

routes.use(authentication)

routes.get('/user', listUser);
routes.post('/user/logout', logoutUser);
routes.delete('/user', deleteUser);
routes.put('/user', validateRequest(updateUserSchema), updateUser);

routes.get('/tasks', listTasks);
routes.post('/task', validateRequest(taskSchema), registerTask);
routes.put('/task/:id', validateRequest(taskSchema), updateTask);
routes.delete('/task/:id', deleteTask)

module.exports = routes;