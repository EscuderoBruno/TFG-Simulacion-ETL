const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Método para crear usuario (registro)
const register = async (req, res) => {
    const { username, password, rol } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) return res.status(400).json({ message: 'El usuario ya existe' });

        // Hashear la contraseña antes de crear el usuario
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario
        const user = await User.create({ username, password: hashedPassword, rol });

        // Generar un token JWT para el usuario recién creado
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'Usuario registrado con éxito', token });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error });
    }
};

// Método para iniciar sesión (login)
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Verificar si el usuario existe
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

        // Verificar si la contraseña es correcta
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

        // Generar un token JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
};

// Método para eliminar un usuario
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        await user.destroy();
        res.status(200).json({ message: 'Usuario eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error });
    }
};

// Método para actualizar un usuario
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, rol } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Actualizar los datos del usuario
        if (username) user.username = username;
        if (password) user.password = await bcrypt.hash(password, 10); // Rehash new password
        if (rol) user.rol = rol;

        await user.save();
        res.status(200).json({ message: 'Usuario actualizado con éxito', user });
    } catch (error) {
        console.error(error);  // Para ver el error en la consola
        res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
};

module.exports = { register, login, deleteUser, updateUser };
