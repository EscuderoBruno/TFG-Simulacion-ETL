// src/models/User.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,  // 0 para user, 1 para admin
  },       
  estado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,  // 0 para inactivo, 1 para activo
  },
});

// Método para verificar la contraseña
User.prototype.comparePassword = async function(password) {
    //console.log('Contraseña ingresada:', password);
    //console.log('Contraseña hasheada:', this.password);
    return await bcrypt.compare(password, this.password);
};  

module.exports = User;

