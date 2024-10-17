// src/models/Simulation.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Locations = require('./locations'); // Asegúrate de importar el modelo de Locations

// Definición del modelo Simulation
const Simulation = sequelize.define('Simulation', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  locationId: { // Agrega una clave foránea
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Locations, // Referencia al modelo Locations
      key: 'id', // Asumiendo que el modelo Locations tiene un campo 'id'
    },
  },
  parameters: {
    type: DataTypes.JSON, // Definimos 'parametros' como tipo JSON
    allowNull: false, // Este campo puede ser nulo, dependiendo de tu caso de uso
    defaultValue: {},
  },
});

// Establecer la relación
Simulation.belongsTo(Locations, {
  foreignKey: 'locationId', // Clave foránea en Simulation
});

module.exports = Simulation;
