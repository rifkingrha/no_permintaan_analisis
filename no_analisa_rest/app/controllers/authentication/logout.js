//const { verifyRefreshToken } = require('../../../lib/jwt_helper')
const { logoutSchema } = require('../../../lib/validation_schema')
const db = require('../../models')
//const redisClient = require('../../../config/redis_storage')
const { insertTrails } = require('../audit_trails/audit_trails.js')

module.exports = async (req, res) => {
    try {
        // const validated = await logoutSchema.validateAsync(req.body)
        //const {refreshToken} = req.body
        //const userId = await verifyRefreshToken(refreshToken)
        //const logout = await redisClient.del(userId)
        console.log({userId})
        const userAccount = await db.user_account.findOne({ 
        where: { id : userId },
        include: [
                { model: db.access_level }
            ]
        });
        console.log(userAccount)

        if(logout !== 1) return res.send({success:false, code: 400, error:'The user has already logged out.'})
        insertTrails(req, res,{
            date: new Date(),
            menu: 'Logout',
            action: 'User logged out',
            start_value: null,
            final_value: null,
            changes: null,
            user: userAccount.username
        })
        res.send({success:true, message:'The user successfully logged out'})
    } catch (error) {
        require('../../../lib/error_handling')(res, error)
    }
}