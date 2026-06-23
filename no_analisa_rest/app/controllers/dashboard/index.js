const router = require('express').Router()
const {filter_issuance, filter_receiving, filter_reject} = require('./dashboard')

router.use(require('../../../lib/response_interceptor'))
router.get('/issuance', filter_issuance)
router.get('/receiving', filter_receiving)
router.get('/reject', filter_reject)

module.exports = router