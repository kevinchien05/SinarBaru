import { sequelize, DataTypes } from "./model.js";

const Supplier = sequelize.define('supplier', {
    SupplierName: {type: DataTypes.STRING, allowNull: false},
    PhoneNumber: {type: DataTypes.STRING, allowNull: false},
    Address: {type: DataTypes.STRING, allowNull: false},
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "supplier"
});


export default Supplier;