const db = require('../../models')
const {accessLevelSchema} = require('../../../lib/validation_schema')

module.exports = async (req, res) => {
    try {
        const validated = await accessLevelSchema.validateAsync(req.body)
        const accessLevel = await db.access_level.create({
            role: validated.role,
            description: validated.description,
            accessLevelId: validated.accessLevelId
        })
        res.send({ success: true, data: accessLevel})
    } catch (error) {
        require('../../../lib/error_handling')(res, error)
    }
}