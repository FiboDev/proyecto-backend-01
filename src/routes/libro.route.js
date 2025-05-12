const express = require('express');
const libroController = require('../controllers/libro.controller');
const { validarLibro } = require('../middlewares/validacionMiddleware');
const { verificarToken, verificarPermiso } = require('../middlewares/authMiddleware');

/**
 * Rutas para la gestión de libros
 * Incluye funcionalidades para gestionar el inventario (múltiples unidades de cada libro)
 */
const router = express.Router();

// Ruta de búsqueda (acceso público)
router.get('/buscar', libroController.buscarLibros);

// Rutas que requieren autenticación
router.use(verificarToken);

// Rutas para obtener libros (acceso para todos los usuarios autenticados)
router.get('/', libroController.obtenerLibros);
router.get('/:id', libroController.obtenerLibroPorId);

// Rutas para modificar libros (requieren permisos específicos)
router.post('/', [verificarPermiso('crearLibro'), validarLibro], libroController.crearLibro);
router.put('/:id', [verificarPermiso('editarLibro'), validarLibro], libroController.actualizarLibro);
router.delete('/:id', verificarPermiso('eliminarLibro'), libroController.eliminarLibro);

// Ruta para actualizar el inventario (añadir o quitar unidades)
router.patch('/:id/inventario', verificarPermiso('gestionarLibros'), libroController.actualizarInventario);

module.exports = router;
