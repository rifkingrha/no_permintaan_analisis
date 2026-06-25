const db = require('../../models')
const Paginate = require('../../../lib/pagination_helper')
const { idSchema } = require('../../../lib/validation_schema')
const error_handling = require('../../../lib/error_handling')
const { Op, Sequelize } = db.Sequelize
const ejs = require('ejs')
const generateReport = require('./generateReport')
const ExcelJS = require('exceljs')
const moment = require('moment')

const noAnalisisHistory = async (req, res) => {
  try {
    const validatedId = await idSchema.validateAsync(req.params)

    if (validatedId.id) {
      const data = await db.filter_issuance.findByPk(req.params.id)
      if (!data) {
        return res.send({
          success: false,
          code: 404,
          error: 'Filter not found'
        })
      }
      return res.send({ success: true, data })
    }

    const { QueryTypes, Op } = require('sequelize')

    const {
      _q,
      dept_code,
      sampel_code,
      check_code,
      date_from,
      date_to
    } = req.query

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const dept = req.query.dept
    const offset = (page - 1) * limit

    let whereClause = `WHERE 1=1 AND combined.deletedAt IS NULL`
    let replacements = {}

    /* =========================
      🔎 GLOBAL SEARCH (_q)
    ========================= */
    if (_q) {
      whereClause += `
        AND (
          combined.code LIKE :q OR
          combined.dept_code LIKE :q OR
          combined.department_name LIKE :q OR
          combined.sampel_code LIKE :q OR
          combined.sampel_name LIKE :q OR
          combined.check_code LIKE :q OR
          combined.check_name LIKE :q OR
          combined.user_id LIKE :q OR
          combined.username LIKE :q OR
          DATE_FORMAT(combined.createdAt, '%Y-%m-%d') LIKE :q
        )
      `
      replacements.q = `%${_q}%`
    }

    /* =========================
      🎯 FILTER BY Departmen
    ========================= */
    const deptCode = normalizeToArray(dept_code)

    if (deptCode.length) {
      whereClause += ` AND combined.dept_code IN (:deptCode)`
      replacements.deptCode = deptCode
    }

    /* =========================
      📦 FILTER BY Sampel
    ========================= */
   const sampelCode = normalizeToArray(sampel_code)

    if (sampelCode.length) {
      whereClause += ` AND combined.sampel_code IN (:sampelCode)`
      replacements.sampelCode = sampelCode
    }

    /* =========================
      📦 FILTER BY Check
    ========================= */

    const checkCode = normalizeToArray(check_code)

      if (checkCode.length) {
        whereClause += ` AND combined.check_code IN (:checkCode)`
        replacements.checkCode = checkCode
    }

    /* =========================
      📅 DATE RANGE
    ========================= */
    if (date_from && date_to) {
      whereClause += `
        AND DATE(combined.createdAt) 
        BETWEEN :date_from AND :date_to
      `
      replacements.date_from = date_from
      replacements.date_to = date_to
    }

    /* =========================
      🚀 EXECUTE QUERY
    ========================= */

   const baseQuery = ` 
    FROM (SELECT
        no_analisis.id,
        no_analisis.code,
        no_analisis.dept_code,
        department.name AS department_name,  
        no_analisis.sampel_code,
        sampel.name AS sampel_name,
        no_analisis.check_code,
        jcheck.name AS check_name,
        no_analisis.user_id,
        juser.username AS username,
        CASE WHEN no_analisis.status = 1 THEN 'Active'
        ELSE 'Abort'
        END as status,
        no_analisis.createdAt,
        no_analisis.deletedAt
        FROM no_analisis AS no_analisis 
        LEFT JOIN mst_department AS department ON no_analisis.dept_code = department.code 
            AND (department.deletedAt IS NULL) 
        LEFT JOIN mst_jenis_check AS jcheck ON no_analisis.check_code = jcheck.code 
            AND (jcheck.deletedAt IS NULL) 
        LEFT JOIN mst_jenis_sampel AS sampel ON no_analisis.sampel_code = sampel.code 
            AND (sampel.deletedAt IS NULL) 
        LEFT JOIN user_accounts AS juser ON no_analisis.user_id = juser.id 
            AND (juser.deletedAt IS NULL) ) combined
    ${whereClause}`

    const data = await db.sequelize.query(`
    SELECT *
    ${baseQuery}
    ORDER BY combined.createdAt DESC
    LIMIT :limit OFFSET :offset
    `, {
      replacements: {
        ...replacements,
        limit,
        offset
      },
      type: QueryTypes.SELECT
    })

    /* ================= GET TOTAL COUNT ================= */
    const totalResult = await db.sequelize.query(`
    SELECT COUNT(*) as total
    ${baseQuery}
    `, {
      replacements,
      type: QueryTypes.SELECT
    })

    const count = totalResult[0].total
    const paginate = new Paginate(req, count)

    console.log('count:', count)

    return res.send({
      success: true,
      data,
      count: count,
      nextPage: paginate.checkNextPage(),
      previousPage: paginate.checkPreviousPage(),
      pagination: {
        per_page: limit,
        current_page: page,
        total_page: Math.ceil(count / limit)  
      }
    })
  }
  catch (error) {
    console.error('LIST NO ANALISIS ERROR:', error);
    return res.status(500).send({
      success: false,
      error: error.message
    });
  }
}

function normalizeToArray(val) {
  if (!val) return []

  if (Array.isArray(val)) return val

  if (typeof val === 'string') {
    return val.split(',').map(v => v.trim()) // ✅ FIX
  }

  return [String(val).trim()]
}


const fetchDept = async (req, res) => {
    try {
        const { Op, col } = db.Sequelize

          const data = await db.no_analisis.findAll({
            attributes: [
              [col('department.code'), 'code'],
              [col('department.name'), 'name']
            ],
            include: [
              {
                model: db.mst_department,
                as: 'department',
                attributes: []
              }
            ],
            where: {
              '$department.code$': {
                [Op.not]: null
              }
            },
            order: [
                [{ model: db.mst_department, as: 'department' }, 'id', 'ASC']
            ],
            group: ['department.code', 'department.name']
          })

        res.send({
            success: true,
            data : data
        })
    } catch (error) {
        console.error('MASTER DEPARTMEN ERROR:', error);
        return res.status(500).send({
            success: false,
            error: error.message
        });
    }
}

const fetchSampel = async (req, res) => {
    try {
        const { Op, col } = db.Sequelize

          const data = await db.no_analisis.findAll({
            attributes: [
              [col('sampel.code'), 'code'],
              [col('sampel.name'), 'name']
            ],
            include: [
              {
                model: db.mst_jenis_sampel,
                as: 'sampel',
                attributes: []
              }
            ],
            where: {
              '$sampel.code$': {
                [Op.not]: null
              }
            },
           order: [
                [{ model: db.mst_jenis_sampel, as: 'sampel' }, 'id', 'ASC']
            ],
            group: ['sampel.code', 'sampel.name']
          })

        res.send({
            success: true,
            data : data
        })
    } catch (error) {
        console.error('MASTER SAMPEL ERROR:', error);
        return res.status(500).send({
            success: false,
            error: error.message
        });
    }
}


const fetchCheck = async (req, res) => {
    try {
        const { Op, col } = db.Sequelize

          const data = await db.no_analisis.findAll({
            attributes: [
              [col('check.code'), 'code'],
              [col('check.name'), 'name']
            ],
            include: [
              {
                model: db.mst_jenis_check,
                as: 'check',
                attributes: []
              }
            ],
            where: {
              '$check.code$': {
                [Op.not]: null
              }
            },
            order: [
                [{ model: db.mst_jenis_check, as: 'check' }, 'id', 'ASC']
            ],
            group: ['check.code', 'check.name']
          })

        res.send({
            success: true,
            data : data
        })
    } catch (error) {
        console.error('MASTER CHECK ERROR:', error);
        return res.status(500).send({
            success: false,
            error: error.message
        });
    }
}

const historyExcel = async (req, res) => {
  try {
    const { QueryTypes, Op } = require('sequelize')

    const {
      _q,
      dept_code,
      sampel_code,
      check_code,
      date_from,
      date_to
    } = req.query

    let whereClause = `WHERE 1=1 AND combined.deletedAt IS NULL`
    let replacements = {}


    if (_q) {
      whereClause += `
        AND (
          combined.code LIKE :q OR
          combined.dept_code LIKE :q OR
          combined.department_name LIKE :q OR
          combined.sampel_code LIKE :q OR
          combined.sampel_name LIKE :q OR
          combined.check_code LIKE :q OR
          combined.check_name LIKE :q OR
          combined.user_id LIKE :q OR
          combined.username LIKE :q OR
          DATE_FORMAT(combined.createdAt, '%Y-%m-%d') LIKE :q
        )
      `
      replacements.q = `%${_q}%`
    }

    /* =========================
      🎯 FILTER BY Departmen
    ========================= */
    const deptCode = normalizeToArray(dept_code)

    if (deptCode.length) {
      whereClause += ` AND combined.dept_code IN (:deptCode)`
      replacements.deptCode = deptCode
    }

    /* =========================
      📦 FILTER BY Sampel
    ========================= */
   const sampelCode = normalizeToArray(sampel_code)

    if (sampelCode.length) {
      whereClause += ` AND combined.sampel_code IN (:sampelCode)`
      replacements.sampelCode = sampelCode
    }

    /* =========================
      📦 FILTER BY Check
    ========================= */

    const checkCode = normalizeToArray(check_code)

      if (checkCode.length) {
        whereClause += ` AND combined.check_code IN (:checkCode)`
        replacements.checkCode = checkCode
    }

    /* =========================
      📅 DATE RANGE
    ========================= */
    if (date_from && date_to) {
      whereClause += `
        AND DATE(combined.createdAt) 
        BETWEEN :date_from AND :date_to
      `
      replacements.date_from = date_from
      replacements.date_to = date_to
    }

    /* =========================
      🚀 EXECUTE QUERY
    ========================= */

   const baseQuery = ` 
    FROM (SELECT
        no_analisis.id,
        no_analisis.code,
        no_analisis.dept_code,
        department.name AS department_name,  
        no_analisis.sampel_code,
        sampel.name AS sampel_name,
        no_analisis.check_code,
        jcheck.name AS check_name,
        no_analisis.user_id,
        juser.username AS username,
        CASE WHEN no_analisis.status = 1 THEN 'Active'
        ELSE 'Abort'
        END as status,
        no_analisis.createdAt,
        no_analisis.deletedAt
        FROM no_analisis AS no_analisis 
        LEFT JOIN mst_department AS department ON no_analisis.dept_code = department.code 
            AND (department.deletedAt IS NULL) 
        LEFT JOIN mst_jenis_check AS jcheck ON no_analisis.check_code = jcheck.code 
            AND (jcheck.deletedAt IS NULL) 
        LEFT JOIN mst_jenis_sampel AS sampel ON no_analisis.sampel_code = sampel.code 
            AND (sampel.deletedAt IS NULL) 
        LEFT JOIN user_accounts AS juser ON no_analisis.user_id = juser.id 
            AND (juser.deletedAt IS NULL) ) combined
    ${whereClause}`

    const data = await db.sequelize.query(`
    SELECT *
    ${baseQuery}
    ORDER BY combined.createdAt DESC
    LIMIT :limit OFFSET :offset
    `, {
      replacements: {
        ...replacements
      },
      type: QueryTypes.SELECT
    })

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('List Pembuatan No Analisis')

    // HEADER
    sheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'No. Permintaan Analisis', key: 'code', width: 15 },
      { header: 'Jenis Pemeriksaan', key: 'check_name', width: 15 },
      { header: 'Departmen', key: 'department_name', width: 15 },
      { header: 'Jenis Sampel', key: 'sampel_name', width: 15 },
      { header: 'Tanggal', key: 'tanggal', width: 15 }
    ]

    let count = 1;

    // DATA
    data.forEach(row => {
      if(row.batch_no != '') {
       sheet.addRow({
         no: count++,
         code: row.combined.code,
         check_name: row.combined.check_name,
         department_name: row.combined.department_name,
         sampel_name: row.combined.sampel_name,
         tanggal: row.combined.createdAt ? new Date(row.combined.createdAt) : ''
       })
     }
    })

    // Styling header
    sheet.getRow(1).font = { bold: true }
    sheet.getColumn('tanggal').numFmt = 'dd/mm/yyyy'

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=filter-history-report-${moment(new Date()).format('DD-MM-YYYY-h.mm.ss')}.xlsx`
    )

    
    await workbook.xlsx.write(res)
    res.end()

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal export Excel' })
  }
}

const historyPdf = async (req, res) => {
  try {
    const { printed_by } = req.body
    
    const { QueryTypes, Op } = require('sequelize')

    const {
      _q,
      dept_code,
      sampel_code,
      check_code,
      date_from,
      date_to
    } = req.query

    let whereClause = `WHERE 1=1 AND combined.deletedAt IS NULL`
    let replacements = {}


    if (_q) {
      whereClause += `
        AND (
          combined.code LIKE :q OR
          combined.dept_code LIKE :q OR
          combined.department_name LIKE :q OR
          combined.sampel_code LIKE :q OR
          combined.sampel_name LIKE :q OR
          combined.check_code LIKE :q OR
          combined.check_name LIKE :q OR
          combined.user_id LIKE :q OR
          combined.username LIKE :q OR
          DATE_FORMAT(combined.createdAt, '%Y-%m-%d') LIKE :q
        )
      `
      replacements.q = `%${_q}%`
    }

    /* =========================
      🎯 FILTER BY Departmen
    ========================= */
    const deptCode = normalizeToArray(dept_code)

    if (deptCode.length) {
      whereClause += ` AND combined.dept_code IN (:deptCode)`
      replacements.deptCode = deptCode
    }

    /* =========================
      📦 FILTER BY Sampel
    ========================= */
   const sampelCode = normalizeToArray(sampel_code)

    if (sampelCode.length) {
      whereClause += ` AND combined.sampel_code IN (:sampelCode)`
      replacements.sampelCode = sampelCode
    }

    /* =========================
      📦 FILTER BY Check
    ========================= */

    const checkCode = normalizeToArray(check_code)

      if (checkCode.length) {
        whereClause += ` AND combined.check_code IN (:checkCode)`
        replacements.checkCode = checkCode
    }

    /* =========================
      📅 DATE RANGE
    ========================= */
    if (date_from && date_to) {
      whereClause += `
        AND DATE(combined.createdAt) 
        BETWEEN :date_from AND :date_to
      `
      replacements.date_from = date_from
      replacements.date_to = date_to
    }

    /* =========================
      🚀 EXECUTE QUERY
    ========================= */

   const baseQuery = ` 
    FROM (SELECT
        no_analisis.id,
        no_analisis.code,
        no_analisis.dept_code,
        department.name AS department_name,  
        no_analisis.sampel_code,
        sampel.name AS sampel_name,
        no_analisis.check_code,
        jcheck.name AS check_name,
        no_analisis.user_id,
        juser.username AS username,
        CASE WHEN no_analisis.status = 1 THEN 'Active'
        ELSE 'Abort'
        END as status,
        no_analisis.createdAt,
        no_analisis.deletedAt
        FROM no_analisis AS no_analisis 
        LEFT JOIN mst_department AS department ON no_analisis.dept_code = department.code 
            AND (department.deletedAt IS NULL) 
        LEFT JOIN mst_jenis_check AS jcheck ON no_analisis.check_code = jcheck.code 
            AND (jcheck.deletedAt IS NULL) 
        LEFT JOIN mst_jenis_sampel AS sampel ON no_analisis.sampel_code = sampel.code 
            AND (sampel.deletedAt IS NULL) 
        LEFT JOIN user_accounts AS juser ON no_analisis.user_id = juser.id 
            AND (juser.deletedAt IS NULL) ) combined
    ${whereClause}`

    const rows = await db.sequelize.query(`
    SELECT *
    ${baseQuery}
    ORDER BY combined.createdAt DESC
    `, {
      replacements: {
        ...replacements
      },
      type: QueryTypes.SELECT
    })

    // ===============================
    // HEADER DATA (AMBIL BARIS PERTAMA)
    // ===============================
    const header = rows.length ? rows[0] : {}
    // ===============================
    // FORMAT DATA UNTUK TABEL
    // ===============================
    const data = rows.map((row, index) => ({
      no: index + 1,
      code:row.code,
      tgl: row.createdAt
        ? moment(row.createdAt).format('DD/MM/YYYY HH:mm')
        : '-',
      dept_code: row.dept_code || '-',
      dept_name: row.department_name ?? '-',
      sampel_code: row.sampel_code,
      sampel_name: row.sampel_name ?? '-',
      check_code: row.check_code ?? '-',
      check_name: row.check_name ?? '-',
      user_id: row.user_id ?? '-',
      user_name: row.username ?? '-',
      status: row.status ?? '-',
    }))
    
    // ===============================
    // RENDER HTML
    // ===============================

    const formatDate = d => {
      if (!d) return ''
      const date = new Date(d)
      const dd = String(date.getDate()).padStart(2, '0')
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const yyyy = date.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    }

    const formatDateTime = d => {
      const date = new Date(d)
      const dd = String(date.getDate()).padStart(2, '0')
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const yyyy = date.getFullYear()
      const hh = String(date.getHours()).padStart(2, '0')
      const mi = String(date.getMinutes()).padStart(2, '0')
      return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
    }

    const fs = require('fs')
    const path = require('path')

    const logoPath = path.join(__dirname, '../../../views/images/sanbe.jpg')
    // const regisPath = path.join(__dirname, '../../../views/images/registered.png')
    const logoBase64 = fs.readFileSync(logoPath, 'base64')
    // const regisBase64 = fs.readFileSync(regisPath, 'base64')

    const html = await ejs.renderFile(
      path.join(__dirname, '../../../views/report/no_analisis.ejs'),
      {
        header,
        data: data,
        formatDate,
        formatDateTime,
        logoUrl: `data:image/png;base64,${logoBase64}`,
        // regisUrl: `data:image/png;base64,${regisBase64}`,
        printedBy: printed_by
      }
    )

    const pdfBuffer = await generateReport(html)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="no_permintaan_analisis.pdf"'
    })

    res.send(pdfBuffer)

  } catch (err) {
    console.error('LIST NO PERMINTAAN ANALISIS ERROR 👉', err)
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

module.exports = {noAnalisisHistory, fetchDept, fetchSampel, fetchCheck, historyExcel, historyPdf}; 