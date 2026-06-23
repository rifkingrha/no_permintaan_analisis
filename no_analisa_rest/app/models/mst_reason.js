const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const mst_reason = sequelize.define('mst_reason', {
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
    tableName: 'mst_reason',
    timestamps: true,
    paranoid: true,
  });

  return mst_reason;
};