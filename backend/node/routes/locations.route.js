
const express = require('express');
const { newLocation, deleteLocation, getAllLocations, getLocationById } = require('../controllers/locations.controller');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');

// Ruta para nueva localización
router.post('/create', authenticate, newLocation);
// Ruta para eliminar localización
router.delete('/delete/:id', authenticate, deleteLocation);
// Ruta para obtener todas las localizaciones
router.get('/', authenticate, getAllLocations);
// Ruta para obtener una localización por id
router.get('/:id', authenticate, getLocationById);

module.exports = router;