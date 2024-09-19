
require('dotenv').config();
const express = require('express');
const sequelize = require('./database/connection');  // Conexión a MySQL
const User = require('./models/user');
const authRoutes = require('./routes/auth.route');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Sincronizar la base de datos
sequelize.sync({ force: false })  // `force: false` para evitar recrear tablas cada vez
  .then(() => console.log('Base de datos sincronizada'))
  .catch(err => console.error('Error al sincronizar la base de datos:', err));

// Rutas de autenticación
app.use('/auth', authRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
