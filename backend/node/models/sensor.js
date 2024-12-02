// src/models/Sensor.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./User');  // Importamos el modelo User

// Definición del modelo Sensor
const Sensor = sequelize.define('Sensor', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coordinates: {
    type: DataTypes.JSON, // Usamos JSON para almacenar la información como un array u objeto
    allowNull: false,
    defaultValue: {
      lat: 0,
      long: 0,
      height: 0,
      alias: '',
      dev_eui: '',
      join_eui: '',
      dev_addr: ''
    },
  },
  // Clave foránea que referencia al usuario
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: User,
        key: 'id',
    },
  }
});

// Relacionamos Localización con Usuario
Sensor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Sensor;
