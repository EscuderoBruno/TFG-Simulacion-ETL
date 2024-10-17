const Locations = require('../models/locations');

// Método para crear localizacion
const newLocation = async (req, res) => {
    const { name, coordinates } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingLocation = await Locations.findOne({ where: { name } });
        if (existingLocation) return res.status(400).json({ message: 'La localización ya existe' });

        // Crear el nuevo usuario
        const location = await Locations.create({ name, coordinates });

        res.status(201).json({ message: 'Localizacion registrado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar localización', error });
    }
};

// Método para eliminar un usuario
const deleteLocation = async (req, res) => {
    const { id } = req.params;

    try {
        const location = await Locations.findByPk(id);
        if (!location) return res.status(404).json({ message: 'Localización no encontrada' });

        await location.destroy();
        res.status(200).json({ message: 'Localización eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar localización', error });
    }
};

// Método para obtener todos los usuarios
const getAllLocations = async (req, res) => {
    try {
        // Obtener todos los usuarios
        const locations = await Locations.findAll({
        });

        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las localizaciones', error });
    }
};

// Método para obtener un usuario por id
const getLocationById = async (req, res) => {
    const { id } = req.params;
    try {
        // Obtener todos los usuarios
        const location = await Locations.findByPk(id);
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la localización', error });
    }
};

module.exports = { newLocation, deleteLocation, getAllLocations, getLocationById };