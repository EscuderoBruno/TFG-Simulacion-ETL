const Sensor = require('../models/sensor');

// Método para crear sensor
const newSensor = async (req, res) => {
    const { name, coordinates } = req.body;
    const userId = req.user.id;  // Obtener el ID del usuario desde el token o el sesión

    try {
        // Crear el nuevo usuario
        const sensor = await Sensor.create({ name, coordinates, userId });

        res.status(201).json({ message: 'Sensor registrado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar sensor', error });
    }
};

// Método para eliminar una sensor
const deleteSensor = async (req, res) => {
    const { id } = req.params;

    try {
        const sensor = await Sensor.findByPk(id);
        if (!sensor) return res.status(404).json({ message: 'Sensor no encontrado' });

        await sensor.destroy();
        res.status(200).json({ message: 'Sensor eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar sensor', error });
    }
};

// Método para actualizar un sensor
const updateSensor = async (req, res) => {
    const { id } = req.params;
    const { name, coordinates } = req.body;

    try {
        const sensor = await Sensor.findByPk(id);
        if (!sensor) return res.status(404).json({ message: 'Sensor no encontrado' });

        // Actualizar los campos
        sensor.name = name ?? sensor.name;
        sensor.coordinates = coordinates ?? sensor.coordinates;

        await sensor.save();

        res.status(200).json({ message: 'Sensor actualizado con éxito', data: sensor });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar sensor', error });
    }
};

// Método para obtener todos los sensores
const getAllSensors = async (req, res) => {

    try {
        const userId = req.user?.id;
        const userRol = req.user?.rol;

        let sensors;

        if (userRol === 1) {
            sensors = await Sensor.findAll();
        } else {
            sensors = await Sensor.findAll({ where: { userId } });
        }

        res.status(200).json(sensors);
    } catch (error) {
        console.error('Error al obtener los sensores:', error);
        res.status(500).json({ message: 'Error al obtener los sensores', error });
    }
};

// Método para obtener una sensor por id
const getSensorById = async (req, res) => {
    const { id } = req.params;
    try {
        // Obtener todos los sensores
        const sensor = await Sensor.findByPk(id);
        res.status(200).json(sensor);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el sensor', error });
    }
};

module.exports = { newSensor, deleteSensor, getAllSensors, getSensorById, updateSensor };