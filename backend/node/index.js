
require('dotenv').config();
const express = require('express');
const sequelize = require('./database/connection');  // Conexión a MySQL
const User = require('./models/user');
const authRoutes = require('./routes/auth.route');
const locationsRoutes = require('./routes/locations.route');
const simulationsRoutes = require('./routes/simulations.route');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Habilitar CORS para todas las rutas
app.use(cors({
  origin: 'http://localhost:4200',  // Especifica tu frontend (Angular) como origen permitido
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],  // Cabezeras permitidas
}));

// Sincronizar la base de datos
sequelize.sync({ force: false })  // `force: false` para evitar recrear tablas cada vez
  .then(() => console.log('Base de datos sincronizada'))
  .catch(err => console.error('Error al sincronizar la base de datos:', err));

// Rutas de autenticación
app.use('/auth', authRoutes);
// Rutas de localización
app.use('/locations', locationsRoutes);
// Rutas de simulación
app.use('/simulations', simulationsRoutes);


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
