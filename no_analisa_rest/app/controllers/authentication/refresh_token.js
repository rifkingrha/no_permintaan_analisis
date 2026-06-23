const { verifyRefreshToken, signAccessToken, signRefreshToken } = require('../../../lib/jwt_helper')
const db = require('../../models')

module.exports = async (req, res) => {
    try {
        const { refreshToken } = req.body
        if(!refreshToken) return res.send({success:false, code:400, error:'bad request'})
            
        const userId = await verifyRefreshToken(refreshToken,res)
        const userAccount = await db.userAccount.findOne({
            attributes: ['id'],
            where: {
                id: userId
            },
            include: {
                through: {
                    attributes: []
                },
                model: db.permission,
                attributes: ['id', 'permission']
            },
        })
        let permissions = []
        for (let i = 0; i < userAccount['permissions'].length; i++) {
            permissions.push(userAccount['permissions'][i].permission)
        }
        const accessToken = await signAccessToken(userId, permissions)
        const refToken = await signRefreshToken(userId)
        res.send({data : {accessToken, refreshToken:refToken}, success:true})
    } catch (error) {
        require('../../../lib/error_handling')(res, error)
    }
}