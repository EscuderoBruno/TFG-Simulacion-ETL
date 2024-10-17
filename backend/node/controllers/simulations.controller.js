const Simulation = require('../models/simulation');
const Locations  = require('../models/locations');

// Método para crear Simulación
const newSimulation = async (req, res) => {
    const { name, locationId, parameters } = req.body; // Asumiendo que recibes 'name' y 'locationId'

    try {
    
        // Verifica si la ubicación existe
        const location = await Locations.findByPk(locationId);
        if (!location) {
          return res.status(404).json({ message: 'Localización no encontrada' });
        }
    
        const simulation = await Simulation.create({ name, locationId, parameters });
        return res.status(201).json(simulation);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Método para eliminar un usuario
const deleteSimulation = async (req, res) => {
    const { id } = req.params;

    try {
        const simulation = await Simulation.findByPk(id);
        if (!simulation) return res.status(404).json({ message: 'Simulación no encontrada' });

        await simulation.destroy();
        res.status(200).json({ message: 'simulación eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar simulación', error });
    }
};

// Método para obtener todos los usuarios
const getAllSimulations = async (req, res) => {
    try {
        const simulations = await Simulation.findAll({
          include: Locations, // Incluir información de la ubicación
        });
        return res.status(200).json(simulations);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Método para obtener un usuario por id
const getSimulationById = async (req, res) => {
    try {
      const { id } = req.params;
      const simulation = await Simulation.findByPk(id, {
        include: Locations, // Incluir información de la ubicación
      });
  
      if (!simulation) {
        return res.status(404).json({ message: 'Simulation not found' });
      }
  
      return res.status(200).json(simulation);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

// Método para actualizar una simulación
const updateSimulation = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, locationId, parameters} = req.body;
  
      // Verifica si la ubicación existe
      const location = await Locations.findByPk(locationId);
      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }
  
      const [updated] = await Simulation.update({ name, locationId, parameters }, {
        where: { id }
      });
  
      if (!updated) {
        return res.status(404).json({ message: 'Simulation not found' });
      }
  
      return res.status(200).json({ message: 'Simulation updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};

module.exports = { newSimulation, deleteSimulation, getAllSimulations, getSimulationById, updateSimulation };