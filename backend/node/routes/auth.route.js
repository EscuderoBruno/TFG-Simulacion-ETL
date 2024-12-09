
const express = require('express');
const { register, login, updateUser, deleteUser, getAllUsers, getUserById, getAuthenticatedUser } = require('../controllers/auth.controller');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware'); // Importar el middleware de autenticación

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas (requieren autenticación)
router.get('/user/me', authenticate, getAuthenticatedUser);  // Obtener los datos del usuario autenticado
router.delete('/delete/:id', authenticate, deleteUser); // Eliminar usuario
router.put('/update/:id', authenticate, updateUser); // Actualizar usuario
router.get('/users', authenticate, getAllUsers); // Obtener todos los usuarios
router.get('/user/:id', authenticate, getUserById); // Obtener un usuario por ID

module.exports = router;

