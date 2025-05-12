const authAction = require('../actions/auth.action');
const usuarioAction = require('../actions/usuario.action');
const { success, error } = require('../utils/apiResponse');

/**
 * Controlador para el registro de usuarios
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const registrar = async (req, res) => {
  try {
    // Para el registro público, solo permitir rol de usuario
    if (!req.usuario) {
      // Si no hay usuario autenticado, restringir el rol a 'usuario'
      req.body.rol = 'usuario';
      delete req.body.permisos; // No permitir asignar permisos directamente
    } else if (!req.usuario.permisos.gestionarUsuarios) {
      // Verificar únicamente si tiene el permiso específico, independiente del rol
      return res.status(403).json({
        success: false,
        error: {
          message: 'No tiene permisos para registrar nuevos usuarios con roles específicos'
        }
      });
    }
    
    const resultado = await authAction.registrar(req.body);
    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: resultado
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: {
        message: err.message
      }
    });
  }
};

/**
 * Controlador para el inicio de sesión
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Debe proporcionar email y contraseña'
        }
      });
    }
    
    // Verificar primero si el usuario existe y está activo
    try {
      await usuarioAction.buscarUsuarioPorEmail(email);
    } catch (err) {
      // Ocultar detalles específicos para mejorar la seguridad
      return res.status(401).json({
        success: false,
        error: {
          message: 'Credenciales incorrectas'
        }
      });
    }
    
    const resultado = await authAction.login(email, password);
    return res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: resultado
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        message: err.message
      }
    });
  }
};

module.exports = {
  registrar,
  login
};
