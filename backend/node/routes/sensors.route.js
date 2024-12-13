
const express = require('express');
const { newSensor, deleteSensor, getAllSensors, getSensorById, updateSensor } = require('../controllers/sensors.controller');
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
// Ruta para editar un sensor por id
router.put('/update/:id', authenticate, updateSensor);

module.exports = router;