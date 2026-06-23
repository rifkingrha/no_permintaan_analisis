const router = require('express').Router()
const {body} = require('express-validator')
//const { verifyAccessToken, ensurePermission } = require('../../../lib/jwt_helper.js');

router.use(require('../../../lib/response_interceptor'))
router.get('/', require('./access_level.js'))
router.get('/:id', require('./access_level.js'))
router.post('/', require('./create_access_level.js'))
router.put('/:id', require('./update_access_level.js'))
router.delete('/:id', require('./delete_access_level.js'))
module.exports = router