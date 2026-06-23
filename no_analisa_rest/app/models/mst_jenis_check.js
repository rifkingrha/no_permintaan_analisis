const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const mst_jenis_check = sequelize.define('mst_jenis_check', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(150),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'mst_jenis_check',
    timestamps: true,
    paranoid: true,
  });
  
  return mst_jenis_check;
};