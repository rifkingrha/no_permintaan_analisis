const router = require('express').Router()

const {
  noAnalisis,
  createNoAnalisis,
  fetchCheck,
  fetchSample,
  fetchDept,
  executeAbort
} = require('./no_analisis')

router.use(require('../../../lib/response_interceptor'))

router.get('/get_check', fetchCheck)
router.get('/get_sampel', fetchSample)
router.get('/get_department', fetchDept)

// IMPORTANT
router.post('/:id/abort', executeAbort)

router.get('/', noAnalisis)
router.post('/', createNoAnalisis)

// ALWAYS LAST
router.get('/:id', noAnalisis)

module.exports = router