const express = require('express');
const router = express.Router();
const { seed } = require('../utils/seeder');
const { success, error } = require('../utils/apiResponse');
const { verificarToken, verificarPermiso } = require('../middlewares/authMiddleware');

/**
 * Ruta para ejecutar el seeder (solo para administradores)
 */

// Middleware de autenticación
router.use(verificarToken);

// Ejecutar seeder - solo admins
router.post('/', verificarPermiso('admin'), async (req, res) => {
  try {
    // Solo permitir en entorno de desarrollo o testing
    if (process.env.NODE_ENV === 'production') {
      return error({ 
        res, 
        message: 'No se puede ejecutar el seeder en entorno de producción', 
        status: 403 
      });
    }
    
    const resultado = await seed();
    return success({ 
      res, 
      message: 'Datos de prueba generados correctamente', 
      data: resultado 
    });
  } catch (err) {
    return error({ 
      res, 
      message: 'Error al generar datos de prueba', 
      error: err.message 
    });
  }
});

module.exports = router;
