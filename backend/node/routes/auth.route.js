
const express = require('express');
const { register, login, updateUser, deleteUser } = require('../controllers/auth.controller');
const router = express.Router();

// Ruta para el registro de usuarios
router.post('/register', register);
// Ruta para el inicio de sesión
router.post('/login', login);
// Ruta para editar usuarios
router.put('/update/:id', updateUser);
// Ruta para eliminar usuarios
router.delete('/delete/:id', deleteUser);

module.exports = router;

