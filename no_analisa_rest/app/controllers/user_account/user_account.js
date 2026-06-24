const db = require('../../models');
const Paginate = require('../../../lib/pagination_helper');
const bcrypt = require('bcrypt');
const error_handling = require('../../../lib/error_handling');
const { Op } = db.Sequelize;

module.exports = {
  // LIST with Pagination, Search, and Sort
  async list(req, res) {
    try {
      const { _q, _sort, _order } = req.query;
      const filter = { where: {} };

      // Search logic for User Account fields
      if (_q) {
        filter.where = {
          [Op.or]: [
            { username: { [Op.like]: `%${_q}%` } },
            { email: { [Op.like]: `%${_q}%` } },
          ]
        };
      }

      // Default sort by username if not provided
      let order = [['username', 'ASC']];
      if (_sort && _order) {
        order = [[_sort, _order]];
      }

      const count = await db.user_account.count(filter);
      const paginate = new Paginate(req, count);

      const data = await db.user_account.findAll({
        ...filter,
       include: [
          { model: db.access_level, as: 'access', attributes: ["id","role"] },
          { model: db.mst_department, as: 'department', attributes: ["id","code","name"] }
        ],
        offset: paginate.startIndex || 0,
        limit: paginate.limit || null,
        order,
        // Optional: exclude password from the list for security
        attributes: { exclude: ['password'] }
      });

      console.log("data user", data);

      return res.status(200).send({
        success: true,
        data,
        count,
        nextPage: paginate.checkNextPage(),
        previousPage: paginate.checkPreviousPage()
      });

    } catch (err) {
      console.error('USER ACCOUNT LIST ERROR:', err);
      // Assuming res.error is a custom middleware/helper in your project
      res.error(err.message);
    }
  },

  // DETAIL
  async detail(req, res) {
    try {
      const data = await db.user_account.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
      });
      if (!data) return res.notFound('User Account not found');
      res.success(data);
    } catch (err) {
      res.error(err.message);
    }
  },

  // CREATE with Bcrypt Hashing
  async create(req, res) {
    try {
      const payload = { ...req.body };
      console.log( {payload})
      if (payload.password) {
        const salt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(payload.password, salt);
      }

      const data = await db.user_account.create(payload);
      console.log({data})
      await db.user.create({ userAccountId: data.id });
      
      const result = data.toJSON();
      delete result.password;
      
      res.success(result, 'User Account created');
    } catch (err) {
      error_handling(res, err);
    }
  },

  // UPDATE with conditional Bcrypt Hashing
  async update(req, res) {
    try {
      const data = await db.user_account.findByPk(req.params.id);
      if (!data) return res.notFound('User Account not found');

      const updateData = { ...req.body };

      // Only re-hash if a new password is provided
      if (updateData.password && updateData.password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      } else {
        // Prevent overwriting existing password with empty string
        delete updateData.password;
      }

      await data.update(updateData);
      
      const result = data.toJSON();
      delete result.password;
      
      res.success(result, 'User Account updated');
    } catch (err) {
      res.error(err.message);
    }
  },

  // DELETE
  async remove(req, res) {
    try {
      const data = await db.user_account.findByPk(req.params.id);
      if (!data) return res.notFound('User Account not found');

      // destroy() works with paranoid: true (soft delete)
      await data.destroy();
      res.success(null, 'User Account deleted');
    } catch (err) {
      res.error(err.message);
    }
  },

  async checkUsername(req, res) {
    try {
      const { username } = req.params;
      const userAccount = await db.user_account.findOne({ where: { username } });
      if (userAccount) {
        return res.send({ success: true, exists: true });
      } else {
        return res.send({ success: true, exists: false });
      }
    } catch (err) {
      error_handling(res, err);
    }
  },

  // userById
  async userById(req, res) {
    try {
      const data = await db.user_account.findByPk(req.params.id, {
        include: [
          {
            model: db.access_level,
            as: 'access',
            attributes: ['id', 'role']
          },
          {
            model: db.mst_department,
            as: 'department',
            attributes: ['id', 'code', 'name']
          }
        ],
        attributes: {
          exclude: ['password']
        }
      });

      if (!data) {
        return res.notFound('User Account not found');
      }

      res.success(data);

    } catch (err) {
      res.error(err.message);
    }
  },
};