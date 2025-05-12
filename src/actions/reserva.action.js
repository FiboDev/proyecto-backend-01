const Reserva = require('../models/reserva.model');
const Usuario = require('../models/usuario.model');
const Libro = require('../models/libro.model');

/**
 * Acciones para el manejo de reservas
 */

// Crear una nueva reserva
const crearReserva = async (datosReserva) => {
  try {
    // Obtener información del usuario para guardarla en el historial
    const usuario = await Usuario.findById(datosReserva.usuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    // Obtener información del libro para guardarla en el historial
    const libro = await Libro.findById(datosReserva.libro);
    if (!libro) {
      throw new Error('Libro no encontrado');
    }
    
    // Verificar si el libro está disponible (tiene al menos una unidad)
    if (libro.cantidadDisponible <= 0) {
      throw new Error('El libro no está disponible para reserva');
    }
    
    // Crear la reserva con la información de usuario y libro
    const reserva = new Reserva({
      ...datosReserva,
      infoUsuario: {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email
      },
      infoLibro: {
        titulo: libro.titulo,
        autor: libro.autor,
        isbn: libro.isbn,
        genero: libro.genero
      },
      estado: 'pendiente'
    });
    
    await reserva.save();
    
    // Actualizar la cantidad disponible del libro
    await Libro.findByIdAndUpdate(libro._id, { 
      $inc: { cantidadDisponible: -1 }, // Decrementar en 1 la cantidad disponible
      disponible: libro.cantidadDisponible > 1 // El libro sigue disponible si aún quedan unidades
    });
    
    return reserva;
  } catch (error) {
    throw error;
  }
};

// Obtener reservas por usuario with filters
const obtenerReservasPorUsuario = async (usuarioId, filtros = {}) => {
  try {
    // Construir filtro base
    const filtroBase = { usuario: usuarioId };
    
    // Añadir filtros adicionales
    if (filtros.estado) {
      filtroBase.estado = filtros.estado;
    }
    
    // Filtrar por fecha si se proporciona
    if (filtros.fechaDesde || filtros.fechaHasta) {
      filtroBase.fechaReserva = {};
      
      if (filtros.fechaDesde) {
        filtroBase.fechaReserva.$gte = new Date(filtros.fechaDesde);
      }
      
      if (filtros.fechaHasta) {
        filtroBase.fechaReserva.$lte = new Date(filtros.fechaHasta);
      }
    }
    
    // Obtener reservas con paginación
    const page = parseInt(filtros.page) || 1;
    const limit = parseInt(filtros.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reservas = await Reserva.find(filtroBase)
      .sort({ fechaReserva: -1 })
      .skip(skip)
      .limit(limit)
      .populate('libro', 'titulo autor genero editorial disponible');
      
    const total = await Reserva.countDocuments(filtroBase);
    
    return {
      reservas,
      paginacion: {
        total,
        paginaActual: page,
        totalPaginas: Math.ceil(total / limit),
        limite: limit
      }
    };
  } catch (error) {
    throw error;
  }
};

// Obtener historial de reservas de un usuario
const obtenerHistorialUsuario = async (usuarioId, incluirCanceladas = true) => {
  try {
    // Construir filtro según parámetros
    const filtro = { usuario: usuarioId };
    
    // Si no se incluyen canceladas, excluirlas del resultado
    if (!incluirCanceladas) {
      filtro.estado = { $ne: 'cancelada' };
    }
    
    // Obtener historial ordenado por fecha de reserva (más reciente primero)
    const historial = await Reserva.find(filtro)
      .sort({ fechaReserva: -1 })
      .populate('libro', 'titulo autor genero editorial disponible');
      
    return historial;
  } catch (error) {
    throw error;
  }
};

// Obtener historial de reservas de un libro
const obtenerHistorialLibro = async (libroId, incluirCanceladas = true) => {
  try {
    // Construir filtro según parámetros
    const filtro = { libro: libroId };
    
    // Si no se incluyen canceladas, excluirlas del resultado
    if (!incluirCanceladas) {
      filtro.estado = { $ne: 'cancelada' };
    }
    
    // Obtener historial ordenado por fecha de reserva (más reciente primero)
    const historial = await Reserva.find(filtro)
      .sort({ fechaReserva: -1 })
      .populate('usuario', 'nombre apellido email');
      
    return historial;
  } catch (error) {
    throw error;
  }
};

// Obtener una reserva por ID
const obtenerReservaPorId = async (id) => {
  try {
    const reserva = await Reserva.findById(id)
      .populate('usuario', 'nombre apellido email')
      .populate('libro', 'titulo autor genero');
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }
    return reserva;
  } catch (error) {
    throw error;
  }
};

// Actualizar estado de reserva
const actualizarReserva = async (id, datosReserva) => {
  try {
    const reserva = await Reserva.findByIdAndUpdate(
      id,
      datosReserva,
      { new: true, runValidators: true }
    )
    .populate('usuario', 'nombre apellido email')
    .populate('libro', 'titulo autor genero');
    
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }
    return reserva;
  } catch (error) {
    throw error;
  }
};

// Cancelar reserva
const cancelarReserva = async (id) => {
  try {
    const reserva = await Reserva.findByIdAndUpdate(
      id,
      { estado: 'cancelada' },
      { new: true }
    )
    .populate('usuario', 'nombre apellido email')
    .populate('libro', 'titulo autor genero');
    
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }
    return reserva;
  } catch (error) {
    throw error;
  }
};

// Obtener todas las reservas con filtros
const obtenerReservas = async (filtros = {}) => {
  try {
    // Construir filtro base
    const filtroBase = {};
    
    // Añadir filtros adicionales
    if (filtros.estado) {
      filtroBase.estado = filtros.estado;
    }
    
    // Filtrar por fecha si se proporciona
    if (filtros.fechaDesde || filtros.fechaHasta) {
      filtroBase.fechaReserva = {};
      
      if (filtros.fechaDesde) {
        filtroBase.fechaReserva.$gte = new Date(filtros.fechaDesde);
      }
      
      if (filtros.fechaHasta) {
        filtroBase.fechaReserva.$lte = new Date(filtros.fechaHasta);
      }
    }

    // Filtrar por libro
    if (filtros.libro) {
      filtroBase.libro = filtros.libro;
    }

    // Filtrar por usuario
    if (filtros.usuario) {
      filtroBase.usuario = filtros.usuario;
    }
    
    // Obtener reservas con paginación
    const page = parseInt(filtros.page) || 1;
    const limit = parseInt(filtros.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reservas = await Reserva.find(filtroBase)
      .sort({ fechaReserva: -1 })
      .skip(skip)
      .limit(limit)
      .populate('usuario', 'nombre apellido email')
      .populate('libro', 'titulo autor genero editorial disponible');
      
    const total = await Reserva.countDocuments(filtroBase);
    
    return {
      reservas,
      paginacion: {
        total,
        paginaActual: page,
        totalPaginas: Math.ceil(total / limit),
        limite: limit
      }
    };
  } catch (error) {
    throw error;
  }
};

// Completar una reserva (devolver libro)
const completarReserva = async (id) => {
  try {
    // Obtener la reserva
    const reserva = await Reserva.findById(id);
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }
    
    // Verificar si la reserva ya está completada o cancelada
    if (reserva.estado === 'completada') {
      throw new Error('La reserva ya se encuentra completada');
    }
    
    if (reserva.estado === 'cancelada') {
      throw new Error('No se puede completar una reserva cancelada');
    }
    
    // Actualizar la reserva
    const reservaActualizada = await Reserva.findByIdAndUpdate(
      id,
      { 
        estado: 'completada',
        fechaDevolucionReal: new Date()
      },
      { new: true }
    )
    .populate('usuario', 'nombre apellido email')
    .populate('libro', 'titulo autor genero');
    
    // Obtener información del libro para actualizar su disponibilidad
    const libro = await Libro.findById(reserva.libro);
    
    // Incrementar la cantidad disponible y actualizar disponibilidad
    await Libro.findByIdAndUpdate(reserva.libro, { 
      $inc: { cantidadDisponible: 1 }, // Incrementar en 1 la cantidad disponible
      disponible: true // El libro ahora está disponible porque hay unidades
    });
    
    return reservaActualizada;
  } catch (error) {
    throw error;
  }
};

// Verificar si hay reservas retrasadas y actualizarlas
const verificarReservasRetrasadas = async () => {
  try {
    const hoy = new Date();
    
    // Buscar reservas pendientes o activas cuya fecha de devolución ya pasó
    const reservasRetrasadas = await Reserva.find({
      estado: { $in: ['pendiente', 'activa'] },
      fechaDevolucion: { $lt: hoy }
    });
    
    // Actualizar las reservas a estado "retrasada"
    for (const reserva of reservasRetrasadas) {
      await Reserva.findByIdAndUpdate(reserva._id, { estado: 'retrasada' });
    }
    
    return reservasRetrasadas;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  crearReserva,
  obtenerReservas,
  obtenerReservasPorUsuario,
  obtenerHistorialUsuario,
  obtenerHistorialLibro,
  obtenerReservaPorId,
  actualizarReserva,
  cancelarReserva,
  completarReserva,
  verificarReservasRetrasadas
};
