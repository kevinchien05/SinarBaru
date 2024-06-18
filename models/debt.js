import { sequelize, DataTypes } from "./model.js";
import Purchase from "./purchases.js";

const Debt = sequelize.define('debt', {
    PayDate: { type: DataTypes.DATE, allowNull: false },
    PurchasesID: { type: DataTypes.INTEGER, allowNull: false }
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "Debt"
});

Debt.belongsTo(Purchase, { foreignKey: 'PurchasesID' });

export default Debt;