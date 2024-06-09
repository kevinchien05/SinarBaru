import { sequelize, DataTypes } from "./model.js";
import Product from "./product.js";

const SaleProduct = sequelize.define('saleproduct', {
    Qnt: { type: DataTypes.INTEGER, allowNull: false },
    Price: { type: DataTypes.DECIMAL, allowNull: false },
    Total: { type: DataTypes.DECIMAL, allowNull: false },
    SalesID: { type: DataTypes.INTEGER, allowNull: false },
    ProductCode: { type: DataTypes.STRING, allowNull: false }
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "saleproducts"
});


SaleProduct.belongsTo(Product, { foreignKey: 'ProductCode' });


export default SaleProduct;