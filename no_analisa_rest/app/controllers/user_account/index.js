const router = require('express').Router()
const {body} = require('express-validator')
const {list, detail, create, update, remove, checkUsername} = require('./user_account.js')

router.use(require('../../../lib/response_interceptor'))
router.get('/', list)
router.get('/:id', detail)
router.post('/check-username/:username', checkUsername)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)
module.exports = router