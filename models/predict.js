import { sequelize, DataTypes } from "./model.js";
import Product from "./product.js";

const Predict = sequelize.define('predict', {
    Date: { type: DataTypes.DATE, allowNull: false },
    Qnt: { type: DataTypes.INTEGER, allowNull: false },
    TimeIndex: { type: DataTypes.INTEGER, allowNull: false },
    ProductCode: { type: DataTypes.STRING, allowNull: true }
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "predict"
});
Predict.belongsTo(Product, {foreignKey: 'ProductCode'});


export default Predict;