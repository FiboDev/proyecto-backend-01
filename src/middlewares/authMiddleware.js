const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');
const { error } = require('../utils/apiResponse');

/**
 * Middleware para verificar el token JWT
 */
const verificarToken = async (req, res, next) => {
  try {
    // Obtener el token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Acceso denegado. Token no proporcionado'
        }
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario por ID (solo usuarios activos)
    const usuario = await Usuario.findById(decoded.id);
    
    if (!usuario || !usuario.estado) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token inválido o usuario inhabilitado'
        }
      });
    }
    
    // Agregar el usuario a la request
    req.usuario = usuario;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token inválido o expirado'
      }
    });
  }
};

/**
 * Middleware para verificar permisos específicos
 * Solo verifica el permiso específico solicitado
 */
const verificarPermiso = (permiso) => {
  return (req, res, next) => {
    const usuario = req.usuario;
    
    // Verificar si el usuario existe y está activo
    if (!usuario || !usuario.estado) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuario no autorizado'
        }
      });
    }
    
    // Verificar únicamente si tiene el permiso específico solicitado
    if (usuario.permisos && usuario.permisos[permiso]) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: {
        message: 'No tiene los permisos necesarios para realizar esta acción'
      }
    });
  };
};

module.exports = {
  verificarToken,
  verificarPermiso
};
