
const express = require('express');
const { newConnection, deleteConnection, getAllConnections, getConnectionById, updateConnection } = require('../controllers/connections.controller');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');

// Ruta para crear una nueva conexión
router.post('/create', authenticate, newConnection);
// Ruta para eliminar una conexión
router.delete('/delete/:id', authenticate, deleteConnection);
// Ruta para obtener todas las conexiones
router.get('/', authenticate, getAllConnections);
// Ruta para obtener una conexión por ID
router.get('/:id', authenticate, getConnectionById);
// Ruta para editar una conexión por id
router.put('/update/:id', authenticate, updateConnection);

module.exports = router;
