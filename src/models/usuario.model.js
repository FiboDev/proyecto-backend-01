const mongoose = require('mongoose');

/**
 * Modelo de Usuario para la biblioteca digital
 */
const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  rol: {
    type: String,
    enum: ['usuario', 'bibliotecario', 'admin'],
    default: 'usuario'
  },
  permisos: {
    admin: { type: Boolean, default: false },
    crearLibro: { type: Boolean, default: false },
    editarLibro: { type: Boolean, default: false },
    eliminarLibro: { type: Boolean, default: false },
    gestionarLibros: { type: Boolean, default: false }, // Para gestionar inventario
    verReservas: { type: Boolean, default: false },
    gestionarReservas: { type: Boolean, default: false },
    verUsuarios: { type: Boolean, default: false },
    crearUsuarios: { type: Boolean, default: false },
    editarUsuarios: { type: Boolean, default: false },
    eliminarUsuarios: { type: Boolean, default: false }
  },
  estado: {
    type: Boolean,
    default: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Usuario', usuarioSchema);
