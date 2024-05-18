import { sequelize, DataTypes } from "./model.js";

const User = sequelize.define('user', {
    Username: {type: DataTypes.STRING, allowNull: false},
    Password: {type: DataTypes.STRING, allowNull: false},
    Status: {type: DataTypes.TINYINT, allowNull: false},
}, {
    updatedAt: false,
    createdAt: false,
    tableName: "user"
});


export default User;