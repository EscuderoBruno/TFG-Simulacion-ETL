// src/models/Location.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

// Definición del modelo Location
const Locations = sequelize.define('Location', {
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
      alias: ''
    },
  }
});

module.exports = Locations;
