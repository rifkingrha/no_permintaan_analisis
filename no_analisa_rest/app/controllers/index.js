const master = require('./master');
const accessLevel = require('./access_level')
const noAnalisis = require('./no_analisis')
const listNoAnalisis = require('./list_no_analisis')
const userAccount = require('./user_account')
const authentication = require('./authentication')
const dashboard = require('./dashboard')
const auditTrails = require('./audit_trails')

module.exports = app => {
    app.get('/', (req, res)=>{res.send('this is index page')})
    app.use('/api/v1/master', master);
    app.use('/api/v1/master/generate-code', master);
    app.use('/api/v1/dashboard', dashboard);
    app.use('/api/v1/no_analisis', noAnalisis);
    app.use('/api/v1/list', listNoAnalisis);
    app.use('/api/v1/access-levels', accessLevel);
    app.use('/api/v1/user-accounts', userAccount);
    app.use('/api/v1/auth', authentication);
    app.use('/api/v1/audit_trails', auditTrails);
    app.use((req, res)=>{res.send({success:false, code:404, error:`The end point you're looking for does not exist.`})})
} 