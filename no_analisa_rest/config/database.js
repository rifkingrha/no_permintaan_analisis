const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('db_no_analisis', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  timezone: '+07:00'
});

module.exports = sequelize;