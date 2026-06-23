
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const tableName = 'audit_trails'; 

    const auditTrails = sequelize.define('audit_trails', {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            allowNull: false, 
            autoIncrement: true,
        },
        date: {
            type: DataTypes.DATE, 
            allowNull: true,
        },
        menu: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        action: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        start_value: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        final_value: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        changes: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        user : {
            type: DataTypes.STRING(50),
            
        },
        client_ip : {
            type: DataTypes.STRING(30)
        }
    }, {
        paranoid: true, 
    });

    // accessLevel.associate = (db) => {
    //     accessLevel.hasMany(db.user_account, {foreignKey: 'accessLevelId'})
    //     db.user_account.belongsTo(auditTrails, {foreignKey: 'auditTrailId'})
    // }
    return auditTrails;
};