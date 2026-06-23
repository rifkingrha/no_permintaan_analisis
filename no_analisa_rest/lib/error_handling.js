module.exports = (res, error) => {
    switch (true) {
        case error.isJoi:
            console.error(error)
            res.send({ success: false, error: error.details[0].message, code: 400 })
            break
        case error.name == 'SequelizeValidationError':
            console.error(error)
            res.send({ success: false, error: error.errors[0].message, code: 400 })
            break
        case error.name == 'SequelizeDatabaseError':
            console.error(error)
            res.send({ success: false, error: 'Database error', code: 500 })
            break
        case error.name == 'JsonWebTokenError':
            res.send({ success: false, error: 'Unauthorized', code: 401 })
            break
        case error.name == 'refreshToken':
            res.send({ success: false, error: error.message, code: 401 })
            break
        default:
            console.error(error)
            res.send({ success: false, error: 'Something wrong with the server', code: 500 })
            break
    }
}