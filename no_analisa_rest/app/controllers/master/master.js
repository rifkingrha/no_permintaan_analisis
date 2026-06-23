const db = require('../../models');
const { Op } = require('sequelize');
const Paginate = require('../../../lib/pagination_helper');
const {insertTrails} = require('../audit_trails/audit_trails.js');
const mst_department = require('../../models/mst_department.js');
const mst_jenis_check = require('../../models/mst_jenis_check.js');
const mst_jenis_sampel = require('../../models/mst_jenis_sampel.js');
const mst_reason = require('../../models/mst_reason.js');

const getModel = (req) => {
  const map = {
    mst_department: {
      model: db.mst_department
    },
    mst_jenis_check: {
      model: db.mst_jenis_check
    },
    mst_jenis_sampel: {
      model: db.mst_jenis_sampel
    },
    mst_reason: {
      model: db.mst_reason
    },
  };

  const config = map[req.params.master];

  if (!config) {
    throw new Error(`Master "${req.params.master}" not found`);
  }

  return config; // { model, prefix }
};


module.exports = {
  // ===== LIST =====
  async list(req, res) {
    try {
      const { model: Model } = getModel(req);
      const { _q, _sort, _order } = req.query;
      const filter = {};

      if (_q) {
        filter.where = {
          [Op.or]: [
            { code: { [Op.like]: `%${_q}%` } },
            { name: { [Op.like]: `%${_q}%` } },
            { description: { [Op.like]: `%${_q}%` } }
          ],
        };
      }

      let order = [["id", "ASC"]];
      if (_sort && _order) {
        order = [[_sort, _order.toUpperCase()]];
      }

      const count = await Model.count({ ...filter });
      const paginate = new Paginate(req, count);

      const rows = await Model.findAll({
        ...filter,
        offset: paginate.startIndex || 0,
        limit: paginate.limit || null,
        order: order,
      });

      res.send({
        data: rows,
        count: count,
        nextPage: paginate.checkNextPage(),
        previousPage: paginate.checkPreviousPage(),
        success: true,
      });

    } catch (err) {
      console.error("Master Data List Error:", err);
      res.error(err.message);
    }
  },

  // ===== DETAIL =====
  async detail(req, res) {
    try {
      const { model: Model } = getModel(req);
      const data = await Model.findByPk(req.params.id);
      if (!data) return res.notFound('Data not found');
      res.success(data);
    } catch (err) {
      res.error(err);
    }
  },

  // ===== CREATE ===== 
  async create(req, res) {
    try {
      const id_user = req.body.user_id;
      const userAccount = await db.user_account.findByPk(id_user)
      const { model: Model } = getModel(req)
      let masterType;
      switch (req.params.master) {
        case 'mst_department':
          masterType = 'Department'
          break;
        case 'mst_jenis_check':
          masterType = 'Check'
          break;
        case 'mst_jenis_sampel':
          masterType = 'Sampel'
          break;
        case 'mst_reason':
          masterType = 'Reason'
          break;
        default:
          masterType = 'Master'
          break;
      }
      const data = await Model.create({
        code: req.body.code,
        name: req.body.name,
        description: req.body.description,
      });
      res.success(data, 'Data created');

      console.log("data master:", data)
      insertTrails(req, res, {
        date: new Date(),
        menu: `Master Data ${ masterType }`,
        action: `User added new ${ masterType }`,
        start_value: JSON.stringify(data),
        user: userAccount.username
      });
    } catch (err) {
      res.error(err);
    }
  },

  // ===== UPDATE =====
  async update(req, res) {
    try {
      const id_user = req.body.user_id;
      const userAccount = await db.user_account.findByPk(id_user)
      const { model: Model } = getModel(req);
      const data = await Model.findByPk(req.params.id);
      const startValue = data.toJSON()
      if (!data) return res.notFound('Data not found');

      let masterType;
      switch (req.params.master) {
        case 'mst_department':
          masterType = 'Department'
          break;
        case 'mst_jenis_check':
          masterType = 'Check'
          break;
        case 'mst_jenis_sampel':
          masterType = 'Sampel'
          break;
        case 'mst_reason':
          masterType = 'Reason'
          break;
        default:
          masterType = 'Master'
          break;
      }

      console.log('BODY:', req.body)
      await data.update({
        code: req.body.code,
        name: req.body.name,
        description: req.body.description,
      });
      
      res.success(data, 'Data updated');
      
      insertTrails(req, res, {
        date: new Date(),
        menu: `Master Data ${ masterType }`,
        action: `User updated a ${ masterType }`,
        start_value: JSON.stringify(startValue),
        final_value: JSON.stringify(data.toJSON()),
        user: userAccount.username
      });
    } catch (err) {
      res.error(err);
    }
  },

  // ===== DELETE =====
  async delete(req, res) {
    try {
      const { model: Model } = getModel(req);
      const data = await Model.findByPk(req.params.id);
      if (!data) return res.notFound('Data not found');

      await data.destroy();
      res.success(null, 'Data deleted');
    } catch (err) {
      res.error(err);
    }
  },

  async generateCode(req, res) {
    try {
      const { model: Model, prefix } = getModel(req);

      const lastData = await Model.findOne({
        where: {
          code: { [Op.like]: `${prefix}%` }
        },
        order: [['code', 'DESC']]
      });

      let nextNumber = 1;

      if (lastData?.code) {
        const num = parseInt(lastData.code.replace(prefix, ''), 10);
        nextNumber = num + 1;
      }

      const code = `${prefix}${String(nextNumber).padStart(3, '0')}`;

      res.send({
        success: true,
        code
      });

    } catch (err) {
      console.error('🔥 Generate Code Error:', err);
      res.status(500).send({
        success: false,
        error: err.message
      });
    }
  },
};