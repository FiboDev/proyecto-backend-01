const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true
  },
  autor: {
    type: String,
    required: [true, 'El autor es obligatorio'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'El ISBN es obligatorio'],
    unique: true,
    trim: true
  },
  genero: {
    type: String,
    required: [true, 'El género es obligatorio'],
    trim: true
  },
  anioPublicacion: {
    type: Number,
    required: [true, 'El año de publicación es obligatorio']
  },
  editorial: {
    type: String,
    required: [true, 'La editorial es obligatoria'],
    trim: true
  },
  disponible: {
    type: Boolean,
    default: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  imagenPortada: {
    type: String
  },
  cantidadDisponible: {
    type: Number,
    default: 1,
    min: [0, 'La cantidad disponible no puede ser negativa']
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  actualizadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware para actualizar la fecha cuando se modifica
libroSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Índices para mejorar el rendimiento de las búsquedas
libroSchema.index({ titulo: 'text', autor: 'text', editorial: 'text', genero: 'text' });
libroSchema.index({ anioPublicacion: 1 });
libroSchema.index({ disponible: 1 });
libroSchema.index({ activo: 1 });

// Virtuals
libroSchema.virtual('disponibilidad').get(function() {
  return this.activo && this.cantidadDisponible > 0;
});

// Métodos estáticos
libroSchema.statics.actualizarDisponibilidad = async function(libroId, cantidad) {
  const libro = await this.findById(libroId);
  if (!libro) {
    throw new Error('Libro no encontrado');
  }
  
  // Nueva cantidad disponible después de la operación
  const nuevaCantidad = libro.cantidadDisponible + cantidad;
  
  // Validar que no sea negativo
  if (nuevaCantidad < 0) {
    throw new Error('No hay suficientes unidades disponibles');
  }
  
  // Actualizar la cantidad y la disponibilidad
  return await this.findByIdAndUpdate(
    libroId,
    { 
      cantidadDisponible: nuevaCantidad,
      disponible: nuevaCantidad > 0
    },
    { new: true }
  );
};

const Libro = mongoose.model('Libro', libroSchema);

module.exports = Libro;
