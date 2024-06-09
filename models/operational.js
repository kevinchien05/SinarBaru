import { sequelize, DataTypes } from "./model.js";
import User from "./user.js";
import Fund from "./fund.js";

const Operational = sequelize.define('operational', {
    Date: {type: DataTypes.DATE, allowNull: false},
    Description: {type: DataTypes.STRING, allowNull: false},
    Total: {type: DataTypes.DECIMAL, allowNull: false},
    Status: {type: DataTypes.TINYINT, allowNull: false},
    UserID: {type: DataTypes.INTEGER, allowNull: false}
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "operational"
});

Operational.belongsTo(User, {foreignKey: 'UserID'});
Operational.hasMany(Fund, {foreignKey: 'OperationalID'});


export default Operational;