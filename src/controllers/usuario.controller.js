const usuarioAction = require('../actions/usuario.action');
const { success, error } = require('../utils/apiResponse');
const mongoose = require('mongoose');

/**
 * Controladores para las rutas de usuarios
 */

// Crear un nuevo usuario
const crearUsuario = async (req, res) => {
  try {
    const nuevoUsuario = await usuarioAction.crearUsuario(req.body);
    // Excluimos la contraseña en la respuesta
    const usuarioResponse = nuevoUsuario.toObject();
    delete usuarioResponse.password;
    
    return success({ res, data: usuarioResponse, status: 201 });
  } catch (err) {
    return error({ res, message: err.message, status: err.message.includes('Ya existe') ? 400 : 500 });
  }
};

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    // Verificar si se solicita incluir usuarios inhabilitados
    const incluirInhabilitados = req.query.activo === 'true';
    
    // Solo usuarios con permiso de gestión pueden ver usuarios inhabilitados
    if (incluirInhabilitados && !req.usuario.permisos.verUsuarios) {
      return error({ res, message: 'No tiene permisos para ver usuarios inhabilitados', status: 403 });
    }
    
    const usuarios = await usuarioAction.obtenerUsuarios(incluirInhabilitados);
    
    return success({ res, data: {
      count: usuarios.length,
      items: usuarios
    }});
  } catch (err) {
    return error({ res, message: err.message });
  }
};

// Obtener un usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
  try {
    // Verificar si el ID es válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return error({ res, message: 'ID de usuario inválido', status: 400 });
    }
    
    // Verificar si se solicita incluir usuarios inhabilitados
    const incluirInhabilitados = req.query.activo === 'true';
    
    // Solo usuarios con permiso de gestión pueden ver usuarios inhabilitados
    if (incluirInhabilitados && !(req.usuario?.permisos?.verUsuarios)) {
      return error({ res, message: 'No tiene permisos para ver usuarios inhabilitados', status: 403 });
    }

    const esUsuarioPropio = req.usuario._id.toString() === req.params.id;
    
    const tienePermisoGestion = req.usuario?.permisos?.verUsuarios === true;
    
    if (!esUsuarioPropio && !tienePermisoGestion) {
      return error({ res, message: 'No tiene permisos para acceder a este usuario', status: 403 });
    }
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('La consulta ha tardado demasiado')), 5000);
    });
    
    const resultado = await Promise.race([
      usuarioAction.obtenerUsuarioPorId(req.params.id, incluirInhabilitados),
      timeoutPromise
    ]);
    
    return success({ res, data: resultado });
  } catch (err) {
    console.error(`Error en obtenerUsuarioPorId: ${err.message}`);
    return error({ 
      res, 
      message: err.message.includes('tardado') ? 
        'La consulta ha tardado demasiado tiempo' : err.message, 
      status: err.message.includes('tardado') ? 408 : 404 
    });
  }
};

// Actualizar un usuario
const actualizarUsuario = async (req, res) => {
  try {
    // La autenticación del token ya nos da el usuario
    const usuarioActual = req.usuario;
    
    // Verificamos si es su propia cuenta o si tiene permisos para gestionar usuarios
    const esUsuarioMismo = usuarioActual._id.toString() === req.params.id;
    const tienePermisoGestion = usuarioActual.permisos && usuarioActual.permisos.editarUsuarios;
    
    // Solo quienes puedan gestionar usuarios o el mismo usuario pueden modificar
    if (!esUsuarioMismo && !tienePermisoGestion) {
      return error({ 
        res, 
        message: 'No tiene permisos para modificar este usuario', 
        status: 403 
      });
    }
    
    // Si no es el mismo usuario ni tiene permisos de gestión, no puede cambiar rol o permisos
    if (!tienePermisoGestion) {
      delete req.body.rol;
      delete req.body.permisos;
    }
    
    const usuarioActualizado = await usuarioAction.actualizarUsuario(req.params.id, req.body, usuarioActual);
    
    return success({ 
      res, 
      data: usuarioActualizado, 
      message: 'Usuario actualizado correctamente' 
    });
  } catch (err) {
    return error({ 
      res, 
      message: err.message, 
      status: err.message.includes('permiso') ? 403 : 404 
    });
  }
};

// Eliminar un usuario
const eliminarUsuario = async (req, res) => {
  try {
    // La autenticación del token ya nos da el usuario
    const usuarioActual = req.usuario;
    
    // Verificamos si es su propia cuenta o si tiene permisos para gestionar usuarios
    const esUsuarioMismo = usuarioActual._id.toString() === req.params.id;
    const tienePermisoGestion = usuarioActual.permisos.eliminarUsuarios;
    
    // Solo quienes puedan gestionar usuarios o el mismo usuario pueden eliminar/inhabilitar
    if (!esUsuarioMismo && !tienePermisoGestion) {
      return error({ 
        res, 
        message: 'No tiene permisos para inhabilitar este usuario', 
        status: 403 
      });
    }
    
    const resultado = await usuarioAction.eliminarUsuario(req.params.id, usuarioActual);
    
    return success({ 
      res, 
      message: resultado.mensaje,
      data: resultado.usuario
    });
  } catch (err) {
    return error({ 
      res, 
      message: err.message, 
      status: err.message.includes('permiso') ? 403 : 404 
    });
  }
};

// Cambiar contraseña
const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, nuevaPassword, confirmarPassword } = req.body;
    
    // Validar que la nueva contraseña y la confirmación coincidan
    if (nuevaPassword !== confirmarPassword) {
      return error({ 
        res, 
        message: 'La nueva contraseña y la confirmación no coinciden', 
        status: 400 
      });
    }
    
    // Validar longitud de la nueva contraseña
    if (nuevaPassword.length < 6) {
      return error({ 
        res, 
        message: 'La nueva contraseña debe tener al menos 6 caracteres', 
        status: 400 
      });
    }
    
    const resultado = await usuarioAction.cambiarPassword(
      req.params.id, 
      { passwordActual, nuevaPassword }, 
      req.usuario
    );
    
    return success({ 
      res, 
      message: resultado.mensaje 
    });
  } catch (err) {
    return error({ 
      res, 
      message: err.message, 
      status: err.message.includes('permiso') ? 403 : 
              err.message.includes('incorrecta') ? 400 : 404 
    });
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  cambiarPassword
};
