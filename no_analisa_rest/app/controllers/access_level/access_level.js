const db = require('../../models')
const Paginate = require('../../../lib/pagination_helper')
const {idSchema} = require('../../../lib/validation_schema')
const { Op } = db.Sequelize;

const accessLevel = async (req, res) => {
    try {
        validatedId = await idSchema.validateAsync(req.params)
        if (validatedId.id) {
            let accessLevel = await db.access_level.findOne({
                where: { id: req.params.id },
            })
            
            if (!accessLevel) return res.send({ success: false, code: 404, error: 'Access Level not found' })
            res.send({ success: true, data: accessLevel })
        } else {
            const { _q, _sort, _order } = req.query;
            const filter = {};

            if (_q) {
                filter.where = {
                    [Op.or]: [
                        { role: { [Op.like]: `%${_q}%` } }, 
                        { description: { [Op.like]: `%${_q}%` } },
                    ]
                };
            }

            let order = [['id', 'ASC']];
            
            if (_sort && _order) {
                order = [[_sort, _order]];
            }

            const count = await db.access_level.count(filter); 
            
            const paginate = new Paginate(req, count);
            
            let accessLevel = await db.access_level.findAll({
                ...filter,
                offset: paginate.startIndex || 0, 
                limit: paginate.limit || null, 
                order: order
            });
            
            res.send({
                data: accessLevel,
                nextPage: paginate.checkNextPage(),
                previousPage: paginate.checkPreviousPage(),
                success: true,
                count: count
            });
        }
    } catch (error) {
        require('../../../lib/error_handling')(res, error)
    }
}

module.exports = accessLevel