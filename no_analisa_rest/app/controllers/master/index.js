const router = require('express').Router();
const controller = require('./master');
// const {verifyAccessToken} = require('../../../lib/jwt_helper');

router.use(require('../../../lib/response_interceptor'));

// =====================
// DYNAMIC MASTER ROUTES
// =====================
router.get('/generate-code/:master', controller.generateCode);

router.get('/:master', controller.list);
router.get('/:master/:id', controller.detail);
router.post('/:master', controller.create);
router.put('/:master/:id', controller.update);
router.delete('/:master/:id', controller.delete);

module.exports = router;