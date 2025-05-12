const reservaAction = require('../actions/reserva.action');
const { success, error } = require('../utils/apiResponse');

/**
 * Controladores para las rutas de reservas
 */

// Crear una nueva reserva
const crearReserva = async (req, res) => {
  try {
    // Asegurar que el usuario solo puede crear reservas para sí mismo
    const datosReserva = {
      ...req.body,
      usuario: req.usuario._id // Establecer el usuario actual como el que hace la reserva
    };
    
    const nuevaReserva = await reservaAction.crearReserva(datosReserva);
    return success({ res, data: nuevaReserva, status: 201 });
  } catch (err) {
    return error({ res, message: err.message });
  }
};

// Obtener todas las reservas
const obtenerReservas = async (req, res) => {
  try {
    // Construir objeto de filtros a partir de los query params
    const filtros = {
      estado: req.query.estado,
      fechaDesde: req.query.fechaDesde,
      fechaHasta: req.query.fechaHasta,
      libro: req.query.libro,
      usuario: req.query.usuario,
      page: req.query.page,
      limit: req.query.limit
    };
    
    const resultado = await reservaAction.obtenerReservas(filtros);
    return success({ res, data: resultado });
  } catch (err) {
    return error({ res, message: err.message });
  }
};

// Obtener reservas por usuario
const obtenerReservasPorUsuario = async (req, res) => {
  try {
    // Verificar que sea el propio usuario o tenga el permiso necesario
    if (req.usuario._id.toString() !== req.params.usuarioId && !req.usuario.permisos.verReservas) {
      return error({ res, message: 'No tiene permisos para ver las reservas de este usuario', status: 403 });
    }
    
    // Construir objeto de filtros a partir de los query params
    const filtros = {
      estado: req.query.estado,
      fechaDesde: req.query.fechaDesde,
      fechaHasta: req.query.fechaHasta,
      page: req.query.page,
      limit: req.query.limit
    };
    
    const resultado = await reservaAction.obtenerReservasPorUsuario(req.params.usuarioId, filtros);
    return success({ res, data: resultado });
  } catch (err) {
    return error({ res, message: err.message });
  }
};

// Obtener una reserva por ID
const obtenerReservaPorId = async (req, res) => {
  try {
    const reserva = await reservaAction.obtenerReservaPorId(req.params.id);
    
    // Verificar que sea el propio usuario o tenga el permiso necesario
    if (req.usuario._id.toString() !== reserva.usuario.toString() && !req.usuario.permisos.verReservas) {
      return error({ res, message: 'No tiene permisos para ver esta reserva', status: 403 });
    }
    
    return success({ res, data: reserva });
  } catch (err) {
    return error({ res, message: err.message, status: 404 });
  }
};

// Actualizar estado de reserva
const actualizarReserva = async (req, res) => {
  try {
    const reserva = await reservaAction.actualizarReserva(req.params.id, req.body);
    return success({ res, data: reserva });
  } catch (err) {
    return error({ res, message: err.message, status: 404 });
  }
};

// Cancelar reserva
const cancelarReserva = async (req, res) => {
  try {
    const reserva = await reservaAction.obtenerReservaPorId(req.params.id);
    
    // Verificar que sea el propio usuario o tenga el permiso necesario
    if (req.usuario._id.toString() !== reserva.usuario.toString() && !req.usuario.permisos.gestionarReservas) {
      return error({ res, message: 'No tiene permisos para cancelar esta reserva', status: 403 });
    }
    
    const reservaCancelada = await reservaAction.cancelarReserva(req.params.id);
    return success({ res, data: reservaCancelada });
  } catch (err) {
    return error({ res, message: err.message, status: 404 });
  }
};

// Obtener historial de reservas de un usuario
const obtenerHistorialUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { incluirCanceladas } = req.query;
    
    // Verificar que sea el propio usuario o tenga el permiso necesario
    if (req.usuario._id.toString() !== usuarioId && !req.usuario.permisos.verReservas) {
      return error({ res, message: 'No tiene permisos para ver el historial de este usuario', status: 403 });
    }
    
    const historial = await reservaAction.obtenerHistorialUsuario(
      usuarioId, 
      incluirCanceladas !== 'false'
    );
    
    return success({ res, data: historial });
  } catch (err) {
    return error({ res, message: err.message });
  }
};

// Obtener historial de reservas de un libro
const obtenerHistorialLibro = async (req, res) => {
  try {
    const { libroId } = req.params;
    const { incluirCanceladas } = req.query;
    
    // Solo usuarios con permiso pueden ver el historial completo de un libro
    if (!req.usuario.permisos.verReservas) {
      return error({ res, message: 'No tiene permisos para ver el historial de este libro', status: 403 });
    }
    
    const historial = await reservaAction.obtenerHistorialLibro(
      libroId, 
      incluirCanceladas !== 'false'
    );
    
    return success({ res, data: historial });
  } catch (err) {
    return error({ res, message: err.message });
  }
};

// Completar una reserva (marcar como devuelto)
const completarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar permisos - solo bibliotecarios pueden completar reservas
    if (!req.usuario.permisos.gestionarReservas) {
      return error({ res, message: 'No tiene permisos para completar esta reserva', status: 403 });
    }
    
    const reservaCompletada = await reservaAction.completarReserva(id);
    return success({ res, data: reservaCompletada });
  } catch (err) {
    return error({ res, message: err.message, status: 404 });
  }
};

// Verificar y actualizar reservas retrasadas
const verificarReservasRetrasadas = async (req, res) => {
  try {
    // Solo administradores pueden ejecutar esta acción
    if (!req.usuario.permisos.admin) {
      return error({ res, message: 'No tiene permisos para ejecutar esta operación', status: 403 });
    }
    
    const reservasRetrasadas = await reservaAction.verificarReservasRetrasadas();
    return success({ 
      res, 
      data: { 
        mensaje: `${reservasRetrasadas.length} reservas actualizadas a estado "retrasada"`,
        reservas: reservasRetrasadas
      } 
    });
  } catch (err) {
    return error({ res, message: err.message });
  }
};

module.exports = {
  crearReserva,
  obtenerReservas,
  obtenerReservasPorUsuario,
  obtenerReservaPorId,
  actualizarReserva,
  cancelarReserva,
  obtenerHistorialUsuario,
  obtenerHistorialLibro,
  completarReserva,
  verificarReservasRetrasadas
};
