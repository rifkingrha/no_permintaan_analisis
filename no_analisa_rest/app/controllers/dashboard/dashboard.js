const db = require("../../models");
const { Op } = require("sequelize");
const Paginate = require("../../../lib/pagination_helper");

module.exports = {
  // filter_issuance
  async filter_issuance(req, res) {
    try {
      const { Op } = require("sequelize");
      const issuance = {};
      issuance.where = {
        is_active: {
          [Op.in]: ["1"],
        }
      }

      if (req.query.issuance_type) {
        issuance.where.issuance_type = req.query.issuance_type
      }

      const data = await db.filter_issuance.count({
        ...issuance,
      });

      // if (!data) return res.notFound("Filter Active On Going not found");
      res.success(data);
    } catch (err) {
      res.error(err.message);
    }
  },

  async filter_receiving(req, res) {
    try {
      const data = await db.filter_receiving.count({
        where: {
          is_active: {
            [Op.in]: ["1"],
          },
        },
      });

      // if (!data) return res.notFound("Filter Receive not found");
      res.success(data);
    } catch (err) {
      res.error(err.message);
    }
  },

  async filter_reject(req, res) {
    try {
      const reject = {};

      if (req.query.status_reject) {
        reject.where = {
          status_reject: req.query.status_reject,
        };
      }

      if (req.query.reject_type) {
        reject.where = {
          reject_type: req.query.reject_type
        }
      }
      
      const data = await db.filter_reject.count({
        ...reject,
      });
      // if (!data) return res.notFound("Filter Receive not found");
      res.success(data);
    } catch (err) {
      res.error(err.message);
    }
  },
};
