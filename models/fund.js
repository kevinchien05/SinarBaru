import { sequelize, DataTypes } from "./model.js";

const Fund = sequelize.define('fund', {
    Date: { type: DataTypes.DATE, allowNull: false },
    Total: { type: DataTypes.DECIMAL, allowNull: false },
    Status: { type: DataTypes.TINYINT, allowNull: false },
    OperationalID: { type: DataTypes.INTEGER, allowNull: true }
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "Fund"
});



export default Fund;