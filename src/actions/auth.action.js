const Usuario = require('../models/usuario.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Genera un JWT token
 * @param {Object} usuario - Datos del usuario
 * @returns {String} Token JWT
 */
const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario._id,
      email: usuario.email,
      rol: usuario.rol,
      permisos: usuario.permisos
    },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
};

/**
 * Acción para registrar un nuevo usuario
 * @param {Object} datos - Datos del usuario
 * @returns {Object} Usuario creado y token
 */
const registrar = async (datos) => {
  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email: datos.email });
    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con ese email');
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(datos.password, salt);

    
    let permisos = {
      crearLibro: false,
      editarLibro: false,
      eliminarLibro: false,
      verReservas: false,
      gestionarReservas: false,
      gestionarUsuarios: false
    };

    const usuario = new Usuario({
      ...datos,
      password: passwordHash,
      permisos: datos.permisos || permisos
    });
    
    await usuario.save();

    // Generar token JWT
    const token = generarToken(usuario);

    // Retornar usuario (sin password) y token
    const usuarioResponse = usuario.toObject();
    delete usuarioResponse.password;

    return {
      usuario: usuarioResponse,
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Acción para iniciar sesión
 * @param {String} email - Email del usuario
 * @param {String} password - Contraseña del usuario
 * @returns {Object} Usuario y token
 */
const login = async (email, password) => {
  try {
    // Buscar el usuario por email (solo usuarios activos)
    const usuario = await Usuario.findOne({ email, estado: true });
    if (!usuario) {
      throw new Error('Credenciales incorrectas');
    }

    // Verificar la contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      throw new Error('Credenciales incorrectas');
    }

    // Generar token JWT con información de permisos
    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol,
        permisos: usuario.permisos
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Retornar usuario (sin password) y token
    const usuarioResponse = usuario.toObject();
    delete usuarioResponse.password;

    return {
      usuario: usuarioResponse,
      token
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  registrar,
  login
};
