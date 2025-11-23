const joi = require('joi');

const taskSchema = joi.object({

    description: joi.string().trim().required().messages({
        "any.required": "Descrição obrigatória.",
        "string.empty": "Descrição obrigatória."
    }),

    completed: joi.boolean().required().messages({
        "any.required": "Estado obrigatória.",
        "boolean.base": "O estado só pode ser verdadeiro ou falso."
    })
});

module.exports = taskSchema;