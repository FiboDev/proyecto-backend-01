const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { validarUsuario, validarCambioPassword } = require('../middlewares/validacionMiddleware');
const { verificarToken, verificarPermiso } = require('../middlewares/authMiddleware');

/**
 * Rutas para la gestión de usuarios
 */

// Crear un nuevo usuario (requiere permiso específico)
router.post('/', [verificarToken, verificarPermiso('crearUsuarios'), validarUsuario], usuarioController.crearUsuario);

// Obtener todos los usuarios (requiere permiso específico)
router.get('/', [verificarToken, verificarPermiso('verUsuarios')], usuarioController.obtenerUsuarios);

// Obtener un usuario por ID (usuario propio o quien tenga permiso)
router.get('/:id', verificarToken, usuarioController.obtenerUsuarioPorId);

// Actualizar un usuario (usuario propio o quien tenga permiso)
router.put('/:id', [verificarToken, validarUsuario], usuarioController.actualizarUsuario);

// Cambiar contraseña (usuario propio o quien tenga permiso)
router.patch('/:id/cambiar-password', [verificarToken, validarCambioPassword], usuarioController.cambiarPassword);

// Eliminar un usuario (requiere permiso específico o es el propio usuario)
router.delete('/:id', [verificarToken], usuarioController.eliminarUsuario);

module.exports = router;
