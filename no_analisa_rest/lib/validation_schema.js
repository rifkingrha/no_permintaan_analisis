const Joi = require('joi')

const idSchema = Joi.object({
    id: Joi.number().integer().messages({ 'number.base': 'id passed to the params must be a number' })
})

const filterSchema = Joi.object({
    code: Joi.string().allow(null, ''),
    name: Joi.string().allow(null, ''),
    description: Joi.string().allow(null, ''),
    category_id: Joi.number().integer().allow(0),
    satuan_id: Joi.number().integer().allow(0),
    qty: Joi.number().integer().allow(0)
})

const accessLevelSchema = Joi.object({
    role: Joi.string().allow(null, ''),
    description: Joi.string().allow(null, ''),
    accessLevelId: Joi.number().integer().allow(0),
})

module.exports = {
    filterSchema,
    accessLevelSchema,
    idSchema
}