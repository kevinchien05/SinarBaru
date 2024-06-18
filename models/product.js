import { sequelize, DataTypes } from "./model.js";

const Product = sequelize.define('product', {
    ProductCode: {type: DataTypes.STRING, allowNull: false, primaryKey:true},
    ProductName: {type: DataTypes.STRING, allowNull: false},
    Qnt: { type: DataTypes.INTEGER, allowNull: true },
    Unit: { type: DataTypes.STRING, allowNull: false},
    BuyPrice: { type: DataTypes.DECIMAL, allowNull: true },
    SellPrice: {type: DataTypes.DECIMAL, allowNull: false},
    Image: {type: DataTypes.STRING, allowNull: false},
    Url: {type: DataTypes.STRING, allowNull: false},
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "products"
});
Product.removeAttribute('id');


export default Product;