const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../database/connection');
const Sensor = require('./sensor');
const User = require('./User'); 
const Connection = require('./sensor');

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
      model: Sensor,
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
  connectionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Connection,
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
Simulation.belongsTo(Sensor, { foreignKey: 'sensorId' });
Simulation.belongsTo(Connection, { foreignKey: 'connectionId' });

module.exports = Simulation;
