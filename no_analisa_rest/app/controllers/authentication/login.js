const db = require('../../models')
const { loginSchema } = require('../../../lib/validation_schema')
const bcrypt = require('bcrypt')
const { signAccessToken, signRefreshToken } = require('../../../lib/jwt_helper')

module.exports = async (req, res) => {
    try {
        const validated = await loginSchema.validateAsync(req.body)
        const userAccountResult = validated.email ? await db.userAccount.findOne({
            attributes: ['id', 'email', 'password', 'emailValidated', 'createdAt', 'updatedAt'],
            where: { email: validated.email },
            include: [{
                through: {
                    attributes: []
                },
                model: db.permission,
                attributes: ['id', 'permission']
            },
            {
                model: db.user
            }]
        }) : await db.userAccount.findOne({
            where: {
                phone_num: validated.phone_num
            }
        })
        if (!userAccountResult) return res.send({ error: 'user account is not found / not registered yet', success: false, code: 401, canBePassed: true })
        let userAccount = userAccountResult.get(
            { plain: true }
        )
        let permissions = []
        for (let i = 0; i < userAccount['permissions'].length; i++) {
            permissions.push(userAccount['permissions'][i].permission)
        }
        const isMatch = await bcrypt.compare(validated.password, userAccountResult.password)
        const accessToken = await signAccessToken(userAccountResult['id'].toString(), permissions)
        const refreshToken = await signRefreshToken(userAccountResult['id'].toString())
        userAccount.permissions = permissions
        userAccount.accessToken = accessToken
        userAccount.refreshToken = refreshToken
        delete userAccount.password
        if (isMatch) {
            res.send({ data: userAccount, success: true })
        } else {
            res.send({ error: 'invalid username/password', success: false, code: 401, canBePassed: true })
        }

    } catch (error) {
        require('../../../lib/error_handling')(res, error)
    }
}