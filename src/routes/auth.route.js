const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validarUsuario, validarLogin } = require('../middlewares/validacionMiddleware');
const { verificarToken } = require('../middlewares/authMiddleware');

/**
 * Rutas para autenticación
 */

// Registro de usuario (acceso público)
router.post('/registro', validarUsuario, authController.registrar);

// Registro de usuario con roles específicos (acceso restringido)
router.post('/registro/admin', [verificarToken, validarUsuario], authController.registrar);

// Inicio de sesión (acceso público)
router.post('/login', validarLogin, authController.login);

module.exports = router;
