import { sequelize, DataTypes } from "./model.js";
import Product from "./product.js";


const ReturProduct = sequelize.define('returproduct', {
    Qnt: { type: DataTypes.INTEGER, allowNull: false },
    Price: { type: DataTypes.DECIMAL, allowNull: false },
    Total: { type: DataTypes.DECIMAL, allowNull: false },
    ReturID: { type: DataTypes.INTEGER, allowNull: false },
    ProductCode: { type: DataTypes.STRING, allowNull: false },
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "returproducts"
});


ReturProduct.belongsTo(Product, { foreignKey: 'ProductCode' });


export default ReturProduct;