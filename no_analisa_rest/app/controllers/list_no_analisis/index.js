const router = require('express').Router()
const {noAnalisisHistory, fetchDept, fetchSampel, fetchCheck, historyExcel, historyPdf} = require('./list_no_analisis')
router.use(require('../../../lib/response_interceptor'))

router.get('/no_analisis', noAnalisisHistory)
router.get('/no_analisis_dept', fetchDept)
router.get('/no_analisis_sampel', fetchSampel)
router.get('/no_analisis_check', fetchCheck)
router.get('/no_analisis_excel', historyExcel)
router.post('/no_analisis_pdf', historyPdf)
module.exports = router