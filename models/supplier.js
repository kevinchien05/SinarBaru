import { sequelize, DataTypes } from "./model.js";

const Supplier = sequelize.define('supplier', {
    Id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    SupplierName: { type: DataTypes.STRING, allowNull: false },
    PhoneNumber: { type: DataTypes.STRING, allowNull: false },
    Address: { type: DataTypes.STRING, allowNull: false },
    Description: {type: DataTypes.STRING, allowNull: true}
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "supplier"
});


export default Supplier;
