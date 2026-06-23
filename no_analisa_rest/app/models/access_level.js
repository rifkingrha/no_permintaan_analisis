
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const tableName = 'access_level'; 

    const accessLevel = sequelize.define('access_level', {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            allowNull: false, 
            autoIncrement: true,
        },
        role: {
            type: DataTypes.STRING(50), 
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING(150),
            allowNull: true,
        }
    }, {
        paranoid: true, 
    });

    accessLevel.associate = (db) => {
        accessLevel.hasMany(db.user_account, {foreignKey: 'accessLevelId'})
        db.user_account.belongsTo(accessLevel, {foreignKey: 'accessLevelId'})
    }
    return accessLevel;
};