
const express = require('express');
const { newLocation, deleteLocation, getAllLocations, getLocationById } = require('../controllers/locations.controller');
const router = express.Router();

// Ruta para nueva localización
router.post('/create', newLocation);
// Ruta para eliminar localización
router.delete('/delete/:id', deleteLocation);
// Ruta para obtener todas las localizaciones
router.get('/', getAllLocations);
// Ruta para obtener una localización por id
router.get('/:id', getLocationById);

module.exports = router;