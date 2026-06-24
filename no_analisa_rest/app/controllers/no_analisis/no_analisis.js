const db = require('../../models')
const Paginate = require('../../../lib/pagination_helper')
const { idSchema } = require('../../../lib/validation_schema')
const error_handling = require('../../../lib/error_handling')
const { Op, Sequelize } = db.Sequelize
const { insertTrails } = require('../audit_trails/audit_trails')

const noAnalisis = async (req, res) => {
  try {
    let validatedId = null

    if (req.params.id && !isNaN(req.params.id)) {
        validatedId = await idSchema.validateAsync(req.params)

    const data = await db.no_analisis.findByPk(validatedId.id)

      if (!data) {
        return res.send({
          success: false,
          code: 404,
          error: 'No Analisis not found'
        })
      }
      return res.send({ success: true, data })
    }

    const { _q, _sort, _order, role, dept } = req.query
    
    const include = [
      {
        model: db.mst_department,
        as: 'department',
        attributes: ['id', 'code', 'name']
      },
      {
        model: db.mst_jenis_check,
        as: 'check',
        attributes: ['id','code', 'name']
      },
      {
        model: db.mst_jenis_sampel,
        as: 'sampel',
        attributes: ['id','code', 'name']
      },
      {
        model: db.user_account,
        as: 'user',
        attributes: ['id','username']
      },
      {
        model: db.mst_reason,
        as: 'reason',
        attributes: ['id','code', 'name']
      }
    ];

    const where = [];
    // default status
    where.push({
      status: req.query.status || '1'
    });

    if (_q) {
      where.push({
        [Op.or]: [
          { code: { [Op.like]: `%${_q}%` } },
          { '$department.code$': { [Op.like]: `%${_q}%` } },
          { '$department.name$': { [Op.like]: `%${_q}%` } },
          { '$check.code$': { [Op.like]: `%${_q}%` } },
          { '$check.name$': { [Op.like]: `%${_q}%` } },
          { '$sampel.code$': { [Op.like]: `%${_q}%` } },
          { '$sampel.name$': { [Op.like]: `%${_q}%` } },
          { '$user.username$': { [Op.like]: `%${_q}%` } },

          Sequelize.where(
            Sequelize.fn(
              'DATE_FORMAT',
              Sequelize.col('no_analisis.createdAt'),
              '%Y-%m-%d'
            ),
            {
              [Op.like]: `%${_q}%`
            }
          )
        ]
      });
    }

    // selain admin filter dept
    if (role !== 'admin') {
      if (dept) {
        where.push({
          dept_code: dept
        });
      }
    }

    const analisis = {
      where: where.length
        ? { [Op.and]: where }
        : {}
    };

    // sorting
    let order = [['createdAt', 'DESC']];

    if (_sort && _order) {
      order = [[_sort, _order]];
    }

    const count = await db.no_analisis.count({ ...analisis, include })
    const paginate = new Paginate(req, count)

    const data = await db.no_analisis.findAll({
      include,
      ...analisis,
      offset: paginate.startIndex || 0,
      limit: paginate.limit || null,
      order,
      subQuery: false 
    })

    res.send({
      success: true,
      data,
      count,
      nextPage: paginate.checkNextPage(),
      previousPage: paginate.checkPreviousPage()
    })
  }
  catch (error) {
    console.error('NO ANALISIS ERROR:', error);
    return res.status(500).send({
      success: false,
      error: error.message
    });
  }
}

const fetchCheck = async (req, res) => {
  try {
    const data = await db.mst_jenis_check.findAll({
      attributes: ['code', 'name'],
      order: [['name', 'ASC']]
    })

    res.send({
      success: true,
      data
    })
  } catch (error) {
    console.error('CHECK ERROR:', error)
    res.status(500).send({
      success: false,
      error: error.message
    })
  }
}

const fetchSample = async (req, res) => {
  try {
    const data = await db.mst_jenis_sample.findAll({
      attributes: ['code', 'name'],
      order: [['name', 'ASC']]
    })

    res.send({
      success: true,
      data
    })
  } catch (error) {
    console.error('CHECK ERROR:', error)
    res.status(500).send({
      success: false,
      error: error.message
    })
  }
}


const fetchDept = async (req, res) => {
  try {
    const data = await db.mst_department.findAll({
      attributes: ['code', 'name'],
      order: [['name', 'ASC']]
    })

    res.send({
      success: true,
      data
    })
  } catch (error) {
    console.error('CHECK ERROR:', error)
    res.status(500).send({
      success: false,
      error: error.message
    })
  }
}

const toRomanMonth = (month) => {
  const romans = [
    '', 'I', 'II', 'III', 'IV', 'V', 'VI',
    'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
  ];
  return romans[month] || '';
};

const createNoAnalisis = async (req, res) => {
  const t = await db.sequelize.transaction()

  try {
    const { dept_code, sampel_code, check_code, user_id } = req.body

    console.log('BODY:', req.body)

    const userAccount = await db.user_account.findByPk(user_id)
    const now = new Date()
    const mm = String(toRomanMonth(now.getMonth() + 1));
    const yy = String(now.getFullYear()).slice(-2)

    // 🔥 ambil nomor terakhir
    const last = await db.no_analisis.findOne({
      where: {
        dept_code,
        sampel_code,
        check_code,
        createdAt: {
          [db.Sequelize.Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      },
      order: [['code', 'DESC']],
      transaction: t
    })

    let running = 1
    let status = 1

    if (last) {
      const lastNumber = parseInt(last.code.split('/').pop())
      running = lastNumber + 1
    }

    const runningStr = String(running).padStart(3, '0')

    const code = `${dept_code}/${sampel_code}/${check_code}/${mm}/${yy}/${runningStr}`

    const data = await db.no_analisis.create({
      code,
      dept_code,
      sampel_code,
      check_code,
      user_id,
      status
    }, { transaction: t })

    await t.commit()

    res.send({
      success: true,
      data
    })

    insertTrails(req, res, {
      menu : "Pembuatan Nomor Permintaan Analisis",
      action : `User added new request no analisis`,
      start_value : JSON.stringify(data),
      user : userAccount.username
    })

  } catch (error) {
    await t.rollback()
    console.error(error)
    res.status(500).send({
      success: false,
      error: error.message
    })
  }
}

const executeAbort = async (req, res) => {
  try {

    const id = req.params.id;

    const {
      reason_code,
      remark,
      abort_by
    } = req.body;

    // =========================
    // VALIDASI
    // =========================
    if (!reason_code) {
      return res.status(400).send({
        success: false,
        message: 'Reason is required'
      });
    }

    // jika reason lainnya
    if (
      reason_code === 'LN' &&
      !remark
    ) {
      return res.status(400).send({
        success: false,
        message: 'Remark is required'
      });
    }

    // =========================
    // FIND DATA
    // =========================
    const data = await db.no_analisis.findByPk(id);
    const startValue = data.toJSON()

    if (!data) {
      return res.status(404).send({
        success: false,
        message: 'No Analisis not found'
      });
    }

    // =========================
    // UPDATE STATUS
    // =========================
    await data.update({
      status: '0',
      reason_code: reason_code,
      reason_remark: remark || null,
      abort_by: abort_by,
      abort_date: new Date()
    });

    // =========================
    // AUDIT TRAIL
    // =========================
    await insertTrails(req, res, {
      date: new Date(),
      menu: 'No Analisis',
      action: 'Abort No Analisis',
      start_value: JSON.stringify(startValue),
      final_value: JSON.stringify(data.toJSON()),
    });

    return res.send({
      success: true,
      message: 'Abort success',
      data
    });

  } catch (err) {

    console.error('ABORT ERROR:', err);

    return res.status(500).send({
      success: false,
      message: err.message
    });

  }
};

module.exports = {noAnalisis, createNoAnalisis, fetchCheck, fetchSample, fetchDept, executeAbort}; 