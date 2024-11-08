
const express = require('express');
const { newSensor, deleteSensor, getAllSensors, getSensorById } = require('../controllers/sensors.controller');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');

// Ruta para nuevo sensor
router.post('/create', authenticate, newSensor);
// Ruta para eliminar sensor
router.delete('/delete/:id', authenticate, deleteSensor);
// Ruta para obtener todas los sensores
router.get('/', authenticate, getAllSensors);
// Ruta para obtener una sensor por id
router.get('/:id', authenticate, getSensorById);

module.exports = router;