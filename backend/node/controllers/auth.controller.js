
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Método para crear usuario (registro)
const register = async (req, res) => {
    const { username, password, rol } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) return res.status(400).json({ message: 'El usuario ya existe' });

        // Crear el nuevo usuario
        const user = await User.create({ username, password, rol });

        // Generar un token JWT para el usuario recién creado
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'Usuario registrado con éxito', token });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    // Verificar si la contraseña es correcta
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    // Generar un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Enviar respuesta con el token
    res.json({ token });
};

module.exports = { register, login };

