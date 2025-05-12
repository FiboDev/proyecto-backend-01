const express = require('express');
const libroRoutes = require('./libro.route');
const usuarioRoutes = require('./usuario.route');
const reservaRoutes = require('./reserva.route');
const authRoutes = require('./auth.route');
const seedRoutes = require('./seed.route');

const router = express.Router();

// Rutas principales de la API
router.use('/auth', authRoutes);
router.use('/libros', libroRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/reservas', reservaRoutes);
router.use('/seed', seedRoutes);

module.exports = router;
