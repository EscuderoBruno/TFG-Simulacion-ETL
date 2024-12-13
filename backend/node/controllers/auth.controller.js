const bcrypt = require('bcrypt');
const User = require('../models/User');
const Sensor = require('../models/sensor');
const Connection = require('../models/connection');
const jwt = require('jsonwebtoken');

// Método para crear usuario (registro)
const register = async (req, res) => {
    const { username, password, rol, estado } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) return res.status(400).json({ message: 'El usuario ya existe' });

        // Hashear la contraseña antes de crear el usuario
        const hashedPassword = await bcrypt.hash(password, 10);

        // Log para verificar el hash generado
        console.log('Contraseña ingresada (texto plano):', password);
        console.log('Contraseña hasheada:', hashedPassword);

        // Crear el nuevo usuario
        const user = await User.create({ username, password: hashedPassword, rol, estado });

        // Generar un token JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'Usuario registrado con éxito', token });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error });
    }
};

// Método para iniciar sesión (login)
const login = async (req, res) => {
    const { username, password } = req.body;  // La contraseña aquí debe estar en texto plano

    try {
        // Verificar si el usuario existe
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });
        if (user.estado == 0) return res.status(400).json({ message: 'Usuario inactivo. Contacte con el administrador.'});

        // Verificar si la contraseña en texto plano coincide con el hash almacenado
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

        // Generar un token JWT incluyendo el rol y el estado
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                rol: user.rol,      // Incluyendo el rol en el token
                estado: user.estado, // Incluyendo el estado en el token
            },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        // Responder con el token y otros datos del usuario
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                rol: user.rol,  // Asegúrate de que este campo exista en el modelo
            },
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error); // Para depurar errores
        res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
};

// Método para eliminar un usuario
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        await Sensor.destroy({ where: { userId: id } });
        await Connection.destroy({ where: { userId: id } });

        await user.destroy();
        res.status(200).json({ message: 'Usuario eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error });
    }
};

// Método para actualizar un usuario
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, rol, estado } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Actualizar los datos del usuario
        if (username) user.username = username;
        if (password) user.password = await bcrypt.hash(password, 10); // Rehash new password
        if (rol) user.rol = rol;
        if (estado) user.estado = estado;

        await user.save();
        res.status(200).json({ message: 'Usuario actualizado con éxito', user });
    } catch (error) {
        console.error(error);  // Para ver el error en la consola
        res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
};

// Método para obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        // Obtener todos los usuarios
        const users = await User.findAll({
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error });
    }
};

// Método para obtener un usuario por id
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        // Obtener todos los usuarios
        const user = await User.findByPk(id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario', error });
    }
};

// Método para obtener los datos del usuario autenticado
const getAuthenticatedUser = async (req, res) => {
    try {
        // La información del usuario ya está disponible en req.user gracias al middleware de autenticación
        const user = req.user;

        // Devolver la información del usuario (puedes incluir más datos si es necesario)
        res.status(200).json({
            id: user.id,
            username: user.username,
            rol: user.rol,
            estado: user.estado,
        });
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        res.status(500).json({ message: 'Error al obtener los datos del usuario', error });
    }
};

module.exports = { register, login, deleteUser, updateUser, getAllUsers, getUserById, getAuthenticatedUser};
