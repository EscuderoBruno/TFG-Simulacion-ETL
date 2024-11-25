const express = require('express');
const { getAllSimulations, newSimulation, getSimulationById, deleteSimulation, updateSimulation } = require('../controllers/simulations.controller');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');

// Ruta para nueva localización
router.post('/create', authenticate, newSimulation);
// Ruta para eliminar localización
router.delete('/delete/:id', authenticate, deleteSimulation);
// Ruta para obtener todas las localizaciones
router.get('/', authenticate, getAllSimulations);
// Ruta para obtener una localización por id
router.get('/:id', authenticate, getSimulationById);
// Ruta para editar una localización por id
router.put('/update/:id', authenticate, updateSimulation);

module.exports = router;