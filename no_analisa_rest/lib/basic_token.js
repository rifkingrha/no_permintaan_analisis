const crypto = require('crypto')
const db = require('../app/models/')

const generateBasicAccount = async() => {
    const randomUUID = crypto.randomUUID()
    const randomChar = crypto.randomBytes(16).toString('hex')
    const basicAuthAccount = await db.basicAuthAccount.create({
        uuid : randomUUID,
        secret : randomChar
    })
    return basicAuthAccount
}

const verifyBasicToken = async (req, res, next) =>{
    if (!req.headers['authorization']) return next(res.send({success:false, code:401, error:'Unauthorized, provide your basic token to send the request'}))
    const authHeader = req.headers['authorization']
    const token = authHeader.split(' ')[1]
    const decodedToken = Buffer.from(token,'base64').toString().split(':')
    const uuid = decodedToken[0]
    const secret = decodedToken[1]
    const basicAuthAccount = await db.basicAuthAccount.findOne({where:{uuid, secret}})
    if(!basicAuthAccount) return next(res.send({success:false, code:401, error:'Invalid Token'}))
    next()
}

module.exports = {generateBasicAccount, verifyBasicToken}