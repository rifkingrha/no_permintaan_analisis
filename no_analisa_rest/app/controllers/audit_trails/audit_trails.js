const db = require('../../models')
const Paginate = require('../../../lib/pagination_helper')
const {idSchema} = require('../../../lib/validation_schema')
const { Op, Sequelize } = db.Sequelize;

const auditTrails = async (req, res) => {
    try {
        validatedId = await idSchema.validateAsync(req.params)
        if (validatedId.id) {
            let auditTrails = await db.audit_trails.findOne({
                where: { id: req.params.id },
            })
            
            if (!auditTrails) return res.send({ success: false, code: 404, error: 'Audit Trail not found' })
            res.send({ success: true, data: auditTrails  })
        } else {
            const { _q, _sort, _order } = req.query;
            const filter = {};

            if (_q) {
                filter.where = {
                    [Op.or]: [
                        { menu: { [Op.like]: `%${_q}%` } }, 
                        { action: { [Op.like]: `%${_q}%` } },
                        { start_value: { [Op.like]: `%${_q}%` } },
                        { final_value: { [Op.like]: `%${_q}%` } },
                        { changes: { [Op.like]: `%${_q}%` } },
                        { user: { [Op.like]: `%${_q}%` } },
                        { client_ip: { [Op.like]: `%${_q}%` } },
                        Sequelize.where(
                            Sequelize.fn('DATE_FORMAT', Sequelize.col('date'), '%d-%m-%Y %H:%i'),
                            { [Op.like]: `%${_q}%` }
                        ),
                    ]
                };
            }

            let order = [['id', 'ASC']];
            
            if (_sort && _order) {
                order = [[_sort, _order]];
            }

            const count = await db.audit_trails.count(filter); 
            
            const paginate = new Paginate(req, count);
            
            let auditTrails = await db.audit_trails.findAll({
                ...filter,
                offset: paginate.startIndex || 0, 
                limit: paginate.limit || null, 
                order: order
            });
            
            res.send({
                data: auditTrails,
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

const insertTrails = async (req, res, data) => {
    try {
        console.log('test audit trails')
        const clientIp = req.ip.split(':').pop();

        let detectedChanges = data.changes;
        
        // 1. Parse values into objects for manipulation
        // We use || '{}' to prevent parsing errors if the strings are empty
        const start = data.start_value ? JSON.parse(data.start_value) : {};
        const final = data.final_value ? JSON.parse(data.final_value) : {};

        // 2. Clean up unwanted keys from both objects
        const keysToDelete = ["createdAt", "updatedAt", "deletedAt"];
        keysToDelete.forEach(key => {
            delete start[key];
            delete final[key];
        });

        // 3. Calculate the "diff" object using the cleaned objects
        if (!detectedChanges) {
            const diffObject = {};

            Object.keys(final).forEach(key => {
                if (JSON.stringify(start[key]) !== JSON.stringify(final[key])) {
                    diffObject[key] = final[key];
                }
            });

            detectedChanges = Object.keys(diffObject).length > 0 
                ? JSON.stringify(diffObject) 
                : null;
        }

        // 4. Create the record using the cleaned, re-stringified versions
        await db.audit_trails.create({
            date: data.date || new Date(),
            menu: data.menu,
            action: data.action,
            start_value: JSON.stringify(start),
            final_value: JSON.stringify(final),
            changes: detectedChanges, 
            user: data.user,
            client_ip: clientIp
        });

    } catch (error) {
        console.error('Audit Trail Error:', error); 
    }
}

module.exports = {auditTrails, insertTrails}