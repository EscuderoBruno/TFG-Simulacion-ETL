const Simulation = require('../models/simulation');
const Locations = require('../models/locations');

// Método para crear Simulación
const newSimulation = async (req, res) => {
    const { name, locationId, parameters, minRegistrosPorInstante, maxRegistrosPorInstante, minIntervaloEntreRegistros, maxIntervaloEntreRegistros, numElementosASimular, noRepetirCheckbox } = req.body;
    const userId = req.user.id;

    try {
        // Verifica si la ubicación existe
        const location = await Locations.findByPk(locationId);
        if (!location) {
            return res.status(404).json({ message: 'Localización no encontrada' });
        }

        // Crear simulación con todas las propiedades del modelo
        const simulation = await Simulation.create({
            name,
            locationId,
            parameters,
            userId,
            minRegistrosPorInstante,
            maxRegistrosPorInstante,
            minIntervaloEntreRegistros,
            maxIntervaloEntreRegistros,
            numElementosASimular,
            noRepetirCheckbox
        });
        
        return res.status(201).json(simulation);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Método para eliminar una simulación
const deleteSimulation = async (req, res) => {
    const { id } = req.params;

    try {
        const simulation = await Simulation.findByPk(id);
        if (!simulation) return res.status(404).json({ message: 'Simulación no encontrada' });

        await simulation.destroy();
        res.status(200).json({ message: 'Simulación eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar simulación', error });
    }
};

// Método para obtener todas las simulaciones
const getAllSimulations = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRol = req.user?.rol;

        let simulations;

        if (userRol === 1) {
            simulations = await Simulation.findAll();
        } else {
            simulations = await Simulation.findAll({
                where: { userId }
            });
        }

        return res.status(200).json(simulations);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Método para obtener una simulación por id
const getSimulationById = async (req, res) => {
    try {
        const { id } = req.params;
        const simulation = await Simulation.findByPk(id, {
            include: Locations
        });

        if (!simulation) {
            return res.status(404).json({ message: 'Simulación no encontrada' });
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
        const { name, locationId, parameters, minRegistrosPorInstante, maxRegistrosPorInstante, minIntervaloEntreRegistros, maxIntervaloEntreRegistros, numElementosASimular, noRepetirCheckbox } = req.body;

        // Verifica si la ubicación existe
        const location = await Locations.findByPk(locationId);
        if (!location) {
            return res.status(404).json({ message: 'Localización no encontrada' });
        }

        const [updated] = await Simulation.update({
            name,
            locationId,
            parameters,
            minRegistrosPorInstante,
            maxRegistrosPorInstante,
            minIntervaloEntreRegistros,
            maxIntervaloEntreRegistros,
            numElementosASimular,
            noRepetirCheckbox
        }, {
            where: { id }
        });

        if (!updated) {
            return res.status(404).json({ message: 'Simulación no encontrada' });
        }

        return res.status(200).json({ message: 'Simulación actualizada con éxito' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { newSimulation, deleteSimulation, getAllSimulations, getSimulationById, updateSimulation };
