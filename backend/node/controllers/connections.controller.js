const Connection = require('../models/Connection'); // Modelo de Connection

// Método para crear una nueva conexión
const newConnection = async (req, res) => {
    const { name, type, options } = req.body;
    const userId = req.user.id; // Obtener el ID del usuario desde el token o sesión

    try {
        // Crear la nueva conexión
        const connection = await Connection.create({ name, type, options, userId });

        res.status(201).json({ message: 'Conexión registrada con éxito', data: connection });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la conexión', error });
    }
};

// Método para eliminar una conexión
const deleteConnection = async (req, res) => {
    const { id } = req.params;

    try {
        // Buscar la conexión por ID
        const connection = await Connection.findByPk(id);
        if (!connection) return res.status(404).json({ message: 'Conexión no encontrada' });

        // Eliminar la conexión
        await connection.destroy();
        res.status(200).json({ message: 'Conexión eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la conexión', error });
    }
};

// Método para actualizar una conexión
const updateConnection = async (req, res) => {
    const { id } = req.params;
    const { name, type, options } = req.body;

    try {
        // Buscar la conexión por ID
        const connection = await Connection.findByPk(id);
        if (!connection) return res.status(404).json({ message: 'Conexión no encontrada' });

        // Actualizar los datos de la conexión
        connection.name = name ?? connection.name;
        connection.type = type ?? connection.type;
        connection.options = options ?? connection.options;

        await connection.save();

        res.status(200).json({ message: 'Conexión actualizada con éxito', data: connection });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la conexión', error });
    }
};

// Método para obtener todas las conexiones
const getAllConnections = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.rol;

        let connections;

        if (userRole === 1) {
            // Si el usuario tiene rol de administrador, obtener todas las conexiones
            connections = await Connection.findAll();
        } else {
            // Si es un usuario normal, obtener solo las conexiones asociadas a su ID
            connections = await Connection.findAll({ where: { userId } });
        }

        res.status(200).json(connections);
    } catch (error) {
        console.error('Error al obtener las conexiones:', error);
        res.status(500).json({ message: 'Error al obtener las conexiones', error });
    }
};

// Método para obtener una conexión por ID
const getConnectionById = async (req, res) => {
    const { id } = req.params;

    try {
        // Buscar la conexión por su ID
        const connection = await Connection.findByPk(id);
        if (!connection) return res.status(404).json({ message: 'Conexión no encontrada' });

        res.status(200).json(connection);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la conexión', error });
    }
};

module.exports = { newConnection, deleteConnection, getAllConnections, getConnectionById, updateConnection };

