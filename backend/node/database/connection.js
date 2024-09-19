
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,      // Nombre de la base de datos
  process.env.DB_USER,      // Usuario
  process.env.DB_PASSWORD,  // Contraseña
  {
    host: '127.0.0.1',
    dialect: 'mariadb', // Cambia a 'mariadb'
    port: 3306, // Asegúrate de que sea el puerto correcto
  }
);

module.exports = sequelize;

