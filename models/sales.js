import { sequelize, DataTypes } from "./model.js";
import SaleProduct from "./saleProduct.js";

const Sale = sequelize.define('sale', {
    OrderDate: {type: DataTypes.DATE, allowNull: false},
    Total: {type: DataTypes.DECIMAL, allowNull: false},
    CustomerName: {type: DataTypes.STRING, allowNull: true},
    Description: {type: DataTypes.STRING, allowNull: true}
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "sales"
});

Sale.hasMany(SaleProduct, {foreignKey: 'SalesID'});

export default Sale;