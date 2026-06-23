const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const mst_jenis_sampel = sequelize.define('mst_jenis_sampel', {
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
    tableName: 'mst_jenis_sampel',
    timestamps: true,
    paranoid: true,
  });

  return mst_jenis_sampel;
};