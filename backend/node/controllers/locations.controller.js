const Locations = require('../models/locations');

// Método para crear localizacion
const newLocation = async (req, res) => {
    const { name, coordinates } = req.body;
    const userId = req.user.id;  // Obtener el ID del usuario desde el token o la sesión

    try {
        // Verificar si el localizacion ya existe
        const existingLocation = await Locations.findOne({ where: { name } });
        if (existingLocation) return res.status(400).json({ message: 'La localización ya existe' });

        // Crear el nuevo usuario
        const location = await Locations.create({ name, coordinates, userId });

        res.status(201).json({ message: 'Localizacion registrado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar localización', error });
    }
};

// Método para eliminar una localizacion
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

// Método para obtener todos las localizaciones
const getAllLocations = async (req, res) => {

    try {
        const userId = req.user?.id;
        const userRol = req.user?.rol;

        let locations;

        if (userRol === 1) {
            locations = await Locations.findAll();
        } else {
            locations = await Locations.findAll({ where: { userId } });
        }

        res.status(200).json(locations);
    } catch (error) {
        console.error('Error al obtener las localizaciones:', error);
        res.status(500).json({ message: 'Error al obtener las localizaciones', error });
    }
};

// Método para obtener una localizacion por id
const getLocationById = async (req, res) => {
    const { id } = req.params;
    try {
        // Obtener todos las localizaciones
        const location = await Locations.findByPk(id);
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la localización', error });
    }
};

module.exports = { newLocation, deleteLocation, getAllLocations, getLocationById };