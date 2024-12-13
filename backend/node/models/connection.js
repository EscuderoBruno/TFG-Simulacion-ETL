const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./User'); // Importamos el modelo User

// Definición del modelo Conexion
const Connection = sequelize.define('Connection', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,  // 0 para mqtt, 1 para api
    },
    options: {
        type: DataTypes.JSON, // Almacena las opciones específicas dependiendo del tipo
        allowNull: false,
        defaultValue: {}, // Almacena las configuraciones específicas (host, token, etc.)
    },
    // Clave foránea que referencia al usuario
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
});

// Relacionamos Conexion con Usuario
Connection.belongsTo(User, 
    { foreignKey: 'userId', as: 'user' });

module.exports = Connection;

