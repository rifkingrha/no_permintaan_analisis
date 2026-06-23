module.exports = (sequelize, DataTypes) => {
    const userAccount = sequelize.define('user_account', {
        username: {
            type: DataTypes.STRING(25),
            unique: true
        },
        password: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
        },
        accessLevelId: {
            type: DataTypes.INTEGER,
        },
        dept_code: {
            type: DataTypes.STRING(5),
        },
    }, {
        paranoid: true,
        indexes: [
        {
            unique: true,
            fields: ['username', 'deletedAt']
        }
    ]
    })
    // .sync({ alter: true }).then(() => {
    //     console.log('userAccount Model synced')
    // })
    // userAccount.associate = (db) => {
    //     userAccount.hasOne(db.user, {foreignKey: 'userAccountId', onDelete: 'CASCADE'})
    //     db.user.belongsTo(userAccount, {foreignKey: 'userAccountId', onDelete: 'CASCADE'})
    //     // userAccount.belongsToMany(db.permission, {through:'userAccountPermission'})
    //     // db.permission.belongsToMany(userAccount, {through:'userAccountPermission'})
    // }

    userAccount.associate = (db) => {
        db.mst_department.hasMany(userAccount, { foreignKey: 'dept_code', sourceKey: 'code' });
        userAccount.belongsTo(db.mst_department, { foreignKey: 'dept_code', targetKey: 'code', as: 'department' });
        db.access_level.hasMany(userAccount, { foreignKey: 'accessLevelId', sourceKey: 'id' });
        userAccount.belongsTo(db.access_level, { foreignKey: 'accessLevelId', targetKey: 'id', as: 'access' });
    }

    return userAccount
}