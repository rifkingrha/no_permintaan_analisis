const db = require('../../models')
const {idSchema} = require('../../../lib/validation_schema')

const accessLevel = async (req, res) => {
    try {
        validatedId = await idSchema.validateAsync(req.params)
            let result = await db.access_level.destroy({
                where: { id: validatedId.id }
            })
            if (result == 0) return res.send({error:'access level not found or has already been deleted', success: false, code:404})
                res.send({deleted : result, message:`access level with id ${validatedId.id} has been deleted`, success: true})
    } catch (error) {
        require('../../../lib/error_handling')(res, error)
    }
}

module.exports = accessLevel