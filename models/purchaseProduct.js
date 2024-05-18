import { sequelize, DataTypes } from "./model.js";
import Product from "./product.js";


const PurchaseProduct = sequelize.define('purchaseproduct', {
    Qnt: { type: DataTypes.INTEGER, allowNull: false },
    Price: { type: DataTypes.DECIMAL, allowNull: false },
    Total: { type: DataTypes.DECIMAL, allowNull: false },
    PurchasesID: { type: DataTypes.INTEGER, allowNull: false },
    ProductCode: { type: DataTypes.STRING, allowNull: false }
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "purchaseproducts"
});


PurchaseProduct.belongsTo(Product, { foreignKey: 'ProductCode' });


export default PurchaseProduct;