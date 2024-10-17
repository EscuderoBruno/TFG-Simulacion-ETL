const express = require('express');
const { getAllSimulations, newSimulation, getSimulationById, deleteSimulation, updateSimulation } = require('../controllers/simulations.controller');
const router = express.Router();

// Ruta para nueva localización
router.post('/create', newSimulation);
// Ruta para eliminar localización
router.delete('/delete/:id', deleteSimulation);
// Ruta para obtener todas las localizaciones
router.get('/', getAllSimulations);
// Ruta para obtener una localización por id
router.get('/:id', getSimulationById);

module.exports = router;