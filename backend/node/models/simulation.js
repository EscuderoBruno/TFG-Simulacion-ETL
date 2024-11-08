const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../database/connection');
const Sensors = require('./sensor');
const User = require('./user'); 

// Definición del modelo Simulation
const Simulation = sequelize.define('Simulation', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sensorId: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Sensors,
      key: 'id',
    },
  },
  parameters: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  // Nuevos campos agregados según el FormGroup de Angular
  minRegistrosPorInstante: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maxRegistrosPorInstante: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  minIntervaloEntreRegistros: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maxIntervaloEntreRegistros: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  numElementosASimular: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  noRepetirCheckbox: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  }
});

// Relaciones
Simulation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Simulation.belongsTo(Sensors, { foreignKey: 'sensorId' });

module.exports = Simulation;
