import { sequelize, DataTypes } from "./model.js";

const Product = sequelize.define('product', {
    ProductCode: {type: DataTypes.STRING, allowNull: false, primaryKey:true},
    ProductName: {type: DataTypes.STRING, allowNull: false},
    Qnt: { type: DataTypes.INTEGER, allowNull: true },
    BuyPrice: { type: DataTypes.DECIMAL, allowNull: true },
    SellPrice: {type: DataTypes.DECIMAL, allowNull: false},
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "product"
});
Product.removeAttribute('id');


export default Product;