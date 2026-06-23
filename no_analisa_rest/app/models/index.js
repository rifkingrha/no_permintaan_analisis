const sequelize = require('../../config/database')
const Sequelize = require('sequelize')
const fs = require('fs')
const path = require('path')
const basename = path.basename(module.filename)
const db = {}
// const Ticket = require('./ticket')(sequelize, Sequelize.DataTypes)

fs.readdirSync(__dirname).filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
}).forEach((file) => {
    let model = require(path.join(__dirname, file))(sequelize, Sequelize)
    db[model.name] = model
})

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db)
    }
})

db.sequelize = sequelize
db.Sequelize = Sequelize
module.exports = db

// syncing models with database tables.
// db.sequelize.sync({force:false, alter:true})
// db.mst_item_detail.sync({force:true, alter:true})
// db.mst_filter.sync({force:true, alter:true}) 
// db.filter_receiving.sync({force:false, alter:true}) 
// db.filter_issuance.sync({force:false, alter:true}) 
// db.filter_reject.sync({force:false, alter:true}) 
// db.user_account.sync({force:false, alter:true}) 
// db.filter_reject.sync({force:false, alter:true}) 
// db.notification.sync({force:false, alter:true}) 

// console.log(capa)
// module.exports = capa