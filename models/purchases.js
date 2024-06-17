import { sequelize, DataTypes } from "./model.js";
import Supplier from "./supplier.js";
import PurchaseProduct from "./purchaseProduct.js";


const Purchase = sequelize.define('purchase', {
    OrderDate: {type: DataTypes.DATE, allowNull: false},
    Total: {type: DataTypes.DECIMAL, allowNull: false},
    Status: {type: DataTypes.TINYINT, allowNull: false},
    SupplierID: {type: DataTypes.INTEGER, allowNull: false}
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "purchases"
});

Purchase.hasMany(PurchaseProduct, {foreignKey: 'PurchasesID'})
Purchase.belongsTo(Supplier, {foreignKey: 'SupplierID'});


export default Purchase;