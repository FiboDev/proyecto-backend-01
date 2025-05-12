const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reserva.controller');
const { validarCampos } = require('../middlewares/validacionMiddleware');
const { verificarToken, verificarPermiso } = require('../middlewares/authMiddleware');

/**
 * Rutas para la gestión de reservas
 * Todas las rutas requieren autenticación
 */

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

// Crear una nueva reserva (cualquier usuario autenticado)
router.post('/', validarCampos, reservaController.crearReserva);

// Obtener todas las reservas (requiere permiso específico)
router.get('/', verificarPermiso('verReservas'), reservaController.obtenerReservas);

// Obtener reservas por usuario (usuario propio o quien tenga permiso)
router.get('/usuario/:usuarioId', reservaController.obtenerReservasPorUsuario);

// Obtener historial de reservas de un usuario (usuario propio o quien tenga permiso)
router.get('/historial/usuario/:usuarioId', reservaController.obtenerHistorialUsuario);

// Obtener historial de reservas de un libro (requiere permiso específico)
router.get('/historial/libro/:libroId', verificarPermiso('verReservas'), reservaController.obtenerHistorialLibro);

// Verificar reservas retrasadas (solo admin)
router.post('/verificar-retrasadas', verificarPermiso('admin'), reservaController.verificarReservasRetrasadas);

// Obtener una reserva por ID (usuario propio o quien tenga permiso)
router.get('/:id', reservaController.obtenerReservaPorId);

// Actualizar estado de reserva (requiere permiso específico)
router.put('/:id', [verificarPermiso('gestionarReservas'), validarCampos], reservaController.actualizarReserva);

// Completar reserva (marcar como devuelta - requiere permiso específico)
router.patch('/:id/completar', verificarPermiso('gestionarReservas'), reservaController.completarReserva);

// Cancelar reserva (cualquier usuario autenticado puede cancelar su propia reserva)
router.patch('/:id/cancelar', reservaController.cancelarReserva);

module.exports = router;
