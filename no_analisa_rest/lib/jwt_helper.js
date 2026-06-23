const jwt = require('jsonwebtoken')
const redisClient = require('../config/redis_storage')

const signAccessToken = (userId, permissions) => {
    return new Promise((resolve, reject) => {
        const payload = {
            permissions
        }
        const secret = process.env.ACCESS_TOKEN_SECRET
        const option = {
            expiresIn: '24h',
            issuer: 'letsgow.com',
            subject: userId
        }
        jwt.sign(payload, secret, option, (error, token) => {
            if (error) return reject(error)
            resolve(token)
        })
    })
}

const verifyAccessToken = (req, res, next) => {
    if (!req.headers['authorization']) return next(res.send({ success: false, code: 401, error: 'Unauthorized' }))
    const authHeader = req.headers['authorization']
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1]

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
        if (error) {
            const errMessage = error.name === 'JsonWebTokenError' ? 'Unauthorized' : error.message
            next(res.send({ success: false, code: 401, error: errMessage }))
        }
        req.payload = payload
        next()
    })
}

const signRefreshToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {}
        const secret = process.env.REFRESH_TOKEN_SECRET
        const option = {
            expiresIn: '1y',
            issuer: 'letsgow.com',
            subject: userId,
        }
        jwt.sign(payload, secret, option, async (error, token) => {
            if (error) return reject(error)
            try {
                await redisClient.set(userId, token, {
                    'EX': 365 * 24 * 60 * 60
                })
                resolve(token)
            } catch (error) {
                console.error(error.message)
                reject(error.message)
            }
        })
    })
}

const verifyRefreshToken = (refreshToken, res) => {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, payload) => {
            if (error) {
                const errMessage = error.name === 'JsonWebTokenError' ? 'Unauthorized' : error.message
                reject(errMessage)
                // reject(res.send({success:false, code:401, error:errMessage}))
            }
            const userId = payload.sub
            try {
                const resultToken = await redisClient.get(userId)
                if (refreshToken === resultToken) return resolve(userId)
                reject({name: 'refreshToken', message:'Unauthorized, refresh token is not valid'})
            } catch (error) {
                console.error(error.message)
                reject(error.message)
            }
        })
    })
}

const ensurePermission = (...permissions) => {
    return (req, res, next) => {
        const userPermissions = req.payload.permissions
        const found = userPermissions.some(r => permissions.includes(r))
        if (!found) next(res.send({ success: false, code: 403, error: `you don't have access to this end point` }))
        next()
    }
}

const signVerifToken = (email, eventId)=>{
    return new Promise((resolve, reject) => {
        const payload = {
            eventId
        }
        const secret = process.env.VERIFICATION_TOKEN_SECRET
        const option = {
            expiresIn: '30m',
            issuer: 'letsgow.com',
            subject: email
        }
        jwt.sign(payload, secret, option, (error, token) => {
            if (error) return reject(error)
            resolve(token)
        })
    })
}

const verifyVerifToken = (req, res, next) => {
    const token = req.body.token
    jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET, (error, payload) => {
        if (error) {
            next(res.send({ success: false, code: 401, error: error }))
        }
        req.payload = payload
        next()
    }) 
}

module.exports = { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken, ensurePermission, signVerifToken, verifyVerifToken }