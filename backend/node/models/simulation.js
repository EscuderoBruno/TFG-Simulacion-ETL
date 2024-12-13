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
    onDelete: 'SET NULL', // Si el sensor se elimina, el campo se establece en null
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
    onDelete: 'SET NULL', // Si la conexión se elimina, el campo se establece en null
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
Simulation.belongsTo(Sensor, { foreignKey: 'sensorId', onDelete: 'SET NULL' });
Simulation.belongsTo(Connection, { foreignKey: 'connectionId', onDelete: 'SET NULL' });

module.exports = Simulation;
