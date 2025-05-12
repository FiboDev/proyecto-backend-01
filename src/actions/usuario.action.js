const Usuario = require('../models/usuario.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

/**
 * Acciones para el manejo de usuarios
 */

// Crear un nuevo usuario (Registro)
const crearUsuario = async (datosUsuario) => {
  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email: datosUsuario.email });
    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con ese email');
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(datosUsuario.password, salt);

    let permisos = {
      crearLibro: false,
      editarLibro: false,
      eliminarLibro: false,
      verReservas: false,
      gestionarReservas: false,
    };

    // Crear el usuario con la contraseña encriptada y permisos por defecto
    const usuario = new Usuario({
      ...datosUsuario,
      password: passwordHash,
      permisos: datosUsuario.permisos || permisos
    });
    
    await usuario.save();
    return usuario;
  } catch (error) {
    throw error;
  }
};

// Obtener todos los usuarios (incluyendo opción para mostrar inhabilitados)
const obtenerUsuarios = async (incluirInhabilitados = false) => {
  try {
    // Si se solicita incluir usuarios inhabilitados, devolver todos
    const filtro = incluirInhabilitados ? {} : { estado: true };
    const usuarios = await Usuario.find(filtro).select('-password');
    return usuarios;
  } catch (error) {
    throw error;
  }
};

// Obtener un usuario por ID
const obtenerUsuarioPorId = async (id, incluirInhabilitados = false) => {
  try {
    // CORRECCIÓN: Verificar si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID de usuario inválido');
    }
    
    // Construir filtro según si se incluyen inhabilitados o no
    const filtro = incluirInhabilitados ? { _id: id } : { _id: id, estado: true };
    
    // MEJORA: Proyección para excluir la contraseña
    const usuario = await Usuario.findOne(filtro).select('-password').maxTimeMS(4000);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado o inhabilitado');
    }
    
    return usuario;
  } catch (error) {
    // MEJORA: Manejo específico de errores
    if (error.name === 'CastError') {
      throw new Error('ID de usuario inválido');
    }
    throw error;
  }
};

// Actualizar un usuario
const actualizarUsuario = async (id, datosUsuario, usuarioActual) => {
  try {
    // Verificar si el usuario a actualizar existe y está activo
    const usuarioExistente = await Usuario.findOne({ _id: id, estado: true });
    if (!usuarioExistente) {
      throw new Error('Usuario no encontrado o inhabilitado');
    }
    
    // Verificar permisos para la actualización
    const esUsuarioMismo = usuarioActual._id.toString() === id;
    const tienePermisoGestion = usuarioActual.permisos && usuarioActual.permisos.editarUsuarios;
    
    if (!esUsuarioMismo && !tienePermisoGestion) {
      throw new Error('No tiene permiso para actualizar este usuario');
    }
    
    // Si no es el mismo usuario ni tiene permisos de gestión, no permitir cambiar rol o permisos
    if (!tienePermisoGestion && !esUsuarioMismo) {
      delete datosUsuario.rol;
      delete datosUsuario.permisos;
    }
    
    // Si se intenta actualizar la contraseña, encriptarla
    if (datosUsuario.password) {
      const salt = await bcrypt.genSalt(10);
      datosUsuario.password = await bcrypt.hash(datosUsuario.password, salt);
    }
    
    // Actualizar el usuario
    const usuario = await Usuario.findByIdAndUpdate(
      id,
      datosUsuario,
      { new: true, runValidators: true }
    ).select('-password');
    
    return usuario;
  } catch (error) {
    throw error;
  }
};

// Eliminar un usuario (soft delete)
const eliminarUsuario = async (id, usuarioActual) => {
  try {
    // Verificar si el usuario a eliminar existe y está activo
    const usuarioExistente = await Usuario.findOne({ _id: id, estado: true });
    if (!usuarioExistente) {
      throw new Error('Usuario no encontrado o ya inhabilitado');
    }
    
    // Verificar permisos para la eliminación
    const esUsuarioMismo = usuarioActual._id.toString() === id;
    const tienePermisoGestion = usuarioActual.permisos && usuarioActual.permisos.eliminarUsuarios;
    
    if (!esUsuarioMismo && !tienePermisoGestion) {
      throw new Error('No tiene permiso para inhabilitar este usuario');
    }
    
    // Realizar el soft delete
    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true }
    ).select('-password');
    
    return { mensaje: 'Usuario inhabilitado correctamente', usuario };
  } catch (error) {
    throw error;
  }
};

// Buscar usuario por email (para login)
const buscarUsuarioPorEmail = async (email) => {
  try {
    const usuario = await Usuario.findOne({ email, estado: true });
    if (!usuario) {
      throw new Error('Credenciales incorrectas');
    }
    return usuario;
  } catch (error) {
    throw error;
  }
};

// Cambiar contraseña
const cambiarPassword = async (id, { passwordActual, nuevaPassword }, usuarioActual) => {
  try {
    // Verificar si el usuario existe y está activo
    const usuario = await Usuario.findOne({ _id: id, estado: true });
    if (!usuario) {
      throw new Error('Usuario no encontrado o inhabilitado');
    }
    
    // Verificar permisos para el cambio de contraseña
    const esUsuarioMismo = usuarioActual._id.toString() === id;
    const tienePermisoGestion = usuarioActual.permisos && usuarioActual.permisos.editarUsuarios;
    
    if (!esUsuarioMismo && !tienePermisoGestion) {
      throw new Error('No tiene permiso para cambiar la contraseña de este usuario');
    }
    
    // Si es el mismo usuario, verificar la contraseña actual
    if (esUsuarioMismo && !tienePermisoGestion) {
      const passwordValido = await bcrypt.compare(passwordActual, usuario.password);
      if (!passwordValido) {
        throw new Error('La contraseña actual es incorrecta');
      }
    }
    
    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(nuevaPassword, salt);
    
    // Actualizar contraseña
    await Usuario.findByIdAndUpdate(id, { password: passwordHash });
    
    return { mensaje: 'Contraseña actualizada correctamente' };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  buscarUsuarioPorEmail,
  cambiarPassword
};
