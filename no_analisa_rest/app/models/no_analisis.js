module.exports = (sequelize, DataTypes) => {
    const noAnalisis = sequelize.define('no_analisis', {
        code: {
            type: DataTypes.STRING(25),
            unique: true
        },
        dept_code: {
            type: DataTypes.STRING(5)
        },
        sampel_code: {
            type: DataTypes.STRING(5),
        },
        check_code: {
            type: DataTypes.STRING(5),
        },
        user_id: {
            type: DataTypes.INTEGER(11),
        }
        ,
        status: {
            type: DataTypes.BOOLEAN,
        }
        ,
        reason_code: {
            type: DataTypes.STRING(5),
        }
        ,
        reason_remark: {
            type: DataTypes.STRING(255),
        },
         abort_by: {
            type: DataTypes.INTEGER(11),
        },
        abortAt: {
            type: DataTypes.DATE,
        }
    }, {
        sequelize,
        tableName: 'no_analisis',
        paranoid: true,
        indexes: [
        {
            unique: true,
            fields: ['code', 'deletedAt']
        }
    ]
    })

    noAnalisis.associate = (db) => {
        db.mst_department.hasMany(noAnalisis, { foreignKey: 'dept_code', sourceKey: 'code' });
        db.mst_jenis_check.hasMany(noAnalisis, { foreignKey: 'check_code', sourceKey: 'code' });
        db.mst_jenis_sampel.hasMany(noAnalisis, { foreignKey: 'sampel_code', sourceKey: 'code' });
        db.mst_reason.hasMany(noAnalisis, { foreignKey: 'reason_code', sourceKey: 'code' });
        db.user_account.hasMany(noAnalisis, { foreignKey: 'user_id' });
        
        noAnalisis.belongsTo(db.mst_department, { foreignKey: 'dept_code', targetKey: 'code', as: 'department' });
        noAnalisis.belongsTo(db.mst_jenis_check, { foreignKey: 'check_code', targetKey: 'code', as: 'check' });
        noAnalisis.belongsTo(db.mst_jenis_sampel, { foreignKey: 'sampel_code', targetKey: 'code', as: 'sampel' });
        noAnalisis.belongsTo(db.mst_reason, { foreignKey: 'reason_code', targetKey: 'code', as: 'reason' });
        noAnalisis.belongsTo(db.user_account, { foreignKey: 'user_id', as: 'user' });
    }

    return noAnalisis
}