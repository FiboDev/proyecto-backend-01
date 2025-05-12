const mongoose = require('mongoose');

/**
 * Modelo de Reserva para la biblioteca digital
 */
const reservaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario es obligatorio']
  },
  // Guardamos información del usuario al momento de la reserva para mantener historial
  infoUsuario: {
    nombre: String,
    apellido: String,
    email: String
  },
  libro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Libro',
    required: [true, 'El libro es obligatorio']
  },
  // Guardamos información del libro al momento de la reserva para mantener historial
  infoLibro: {
    titulo: String,
    autor: String,
    isbn: String,
    genero: String
  },
  fechaReserva: {
    type: Date,
    default: Date.now
  },
  fechaDevolucion: {
    type: Date,
    required: [true, 'La fecha de devolución es obligatoria']
  },
  fechaDevolucionReal: {
    type: Date
  },
  estado: {
    type: String,
    enum: ['pendiente', 'activa', 'completada', 'cancelada', 'retrasada'],
    default: 'pendiente'
  },
  observaciones: {
    type: String,
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para mejorar la búsqueda
reservaSchema.index({ usuario: 1 });
reservaSchema.index({ libro: 1 });
reservaSchema.index({ estado: 1 });
reservaSchema.index({ fechaReserva: 1 });
reservaSchema.index({ fechaDevolucion: 1 });

module.exports = mongoose.model('Reserva', reservaSchema);
