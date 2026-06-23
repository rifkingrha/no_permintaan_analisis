const db = require('../../models')
const {accessLevelSchema, idSchema} = require('../../../lib/validation_schema')

module.exports = async (req, res) => {
    try {
        const validated = await accessLevelSchema.validateAsync(req.body)
        const validatedId = await idSchema.validateAsync(req.params)

        const oldAccessLevel = await db.access_level.findOne({
            where: { id: validatedId.id }
        })

        if (!oldAccessLevel) return res.send({ success: false, error: 'access level not found, re-check the passed id', code: 404 })

        let accessLevel = {
            role: validated.role || oldAccessLevel.role,
            description: validated.description || oldAccessLevel.description,
            accessLevelId: validated.accessLevelId
        }

        oldAccessLevel.set(accessLevel)
        const updatedAccessLevel = await oldAccessLevel.save()
        res.send({ success: true, data: updatedAccessLevel })
    } catch (error) {
        require('../../../lib/error_handling')(res, error)
    }
}