const router = require('express').Router()
// const {verifyBasicToken} = require('../../../lib/basic_token.js')
const {verifyVerifToken, verifyAccessToken} = require('../../../lib/jwt_helper.js')

router.use(require('../../../lib/response_interceptor'))
router.post('/login', require('./authentication.js').login)
router.delete('/logout', require('./logout.js'))
// router.post('/login', verifyBasicToken, require('./login.js'))
// router.post('/refresh_token', verifyBasicToken, require('./refresh_token.js'))
// router.get('/sign_basic_account', require('./signBasicAuth.js'))

module.exports = router
    