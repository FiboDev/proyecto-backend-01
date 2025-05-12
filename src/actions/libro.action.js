const Libro = require('../models/libro.model');

/**
 * Acción para crear un nuevo libro
 * @param {Object} libroData - Datos del libro a crear
 * @param {Object} usuario - Usuario que crea el libro
 * @returns {Promise<Object>} El libro creado
 */
const crearLibro = async (libroData, usuario) => {
  try {
    // Añadir información del usuario que crea el libro
    const nuevoLibro = new Libro({
      ...libroData,
      creadoPor: usuario._id,
      actualizadoPor: usuario._id
    });
    
    await nuevoLibro.save();
    return nuevoLibro;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Ya existe un libro con ese ISBN');
    }
    throw new Error(`Error al crear el libro: ${error.message}`);
  }
};

/**
 * Acción para obtener todos los libros con filtros
 * @param {Object} opciones - Opciones de filtrado, paginación, etc.
 * @returns {Promise<Object>} Lista paginada y filtrada de libros
 */
const obtenerLibros = async (opciones = {}) => {
  try {
    const {
      titulo,
      autor,
      genero,
      editorial,
      anioDesde,
      anioHasta,
      activo,
      disponible,
      cantidadDisponible, // Añadimos este parámetro
      page = 1,
      limit = 10,
      sortBy = 'titulo',
      sortOrder = 'asc'
    } = opciones;

    // Construir filtro
    const filtro = { activo: true };
    
    // Aplicar filtros si están presentes
    if (titulo) filtro.titulo = { $regex: titulo, $options: 'i' };
    if (autor) filtro.autor = { $regex: autor, $options: 'i' };
    if (genero) filtro.genero = { $regex: genero, $options: 'i' };
    if (editorial) filtro.editorial = { $regex: editorial, $options: 'i' };
    
    // Filtrar por rango de años
    if (anioDesde || anioHasta) {
      filtro.anioPublicacion = {};
      if (anioDesde) filtro.anioPublicacion.$gte = parseInt(anioDesde);
      if (anioHasta) filtro.anioPublicacion.$lte = parseInt(anioHasta);
    }
    
    // Filtrar por disponibilidad
    if (disponible !== undefined) {
      filtro.disponible = disponible;
    }
    
    // Filtrar por cantidad disponible (nuevo)
    if (cantidadDisponible !== undefined) {
      filtro.cantidadDisponible = cantidadDisponible;
    }

    if (activo !== undefined) {
      filtro.activo = activo;
    }
    
    // Calcular salto para paginación
    const skip = (page - 1) * limit;
    
    // Determinar orden
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Obtener total de documentos para paginación
    const total = await Libro.countDocuments(filtro);
    
    // Obtener libros con paginación y ordenamiento
    const libros = await Libro.find(filtro)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Preparar información de paginación
    const paginacion = {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
    
    return {
      libros,
      paginacion
    };
  } catch (error) {
    throw new Error(`Error al obtener libros: ${error.message}`);
  }
};

/**
 * Acción para obtener un libro por ID
 * @param {String} id - ID del libro
 * @returns {Promise<Object>} El libro encontrado
 */
const obtenerLibroPorId = async (id) => {
  try {
    const libro = await Libro.findOne({ _id: id, activo: true })
      .populate('creadoPor', 'nombre apellido')
      .populate('actualizadoPor', 'nombre apellido');
    
    if (!libro) {
      throw new Error('Libro no encontrado');
    }
    
    return libro;
  } catch (error) {
    throw new Error(`Error al obtener el libro: ${error.message}`);
  }
};

/**
 * Acción para actualizar un libro
 * @param {String} id - ID del libro
 * @param {Object} datosActualizados - Datos a actualizar
 * @param {Object} usuario - Usuario que actualiza el libro
 * @returns {Promise<Object>} El libro actualizado
 */
const actualizarLibro = async (id, datosActualizados, usuario) => {
  try {
    // Añadir información del usuario que actualiza el libro
    datosActualizados.actualizadoPor = usuario._id;
    
    const libroActualizado = await Libro.findOneAndUpdate(
      { _id: id, activo: true },
      datosActualizados,
      { new: true, runValidators: true }
    ).populate('creadoPor', 'nombre apellido')
     .populate('actualizadoPor', 'nombre apellido');
    
    if (!libroActualizado) {
      throw new Error('Libro no encontrado');
    }
    
    return libroActualizado;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Ya existe un libro con ese ISBN');
    }
    throw new Error(`Error al actualizar el libro: ${error.message}`);
  }
};

/**
 * Acción para eliminar un libro (soft delete)
 * @param {String} id - ID del libro
 * @param {Object} usuario - Usuario que elimina el libro
 * @returns {Promise<Object>} Confirmación de eliminación
 */
const eliminarLibro = async (id, usuario) => {
  try {
    // Soft delete: actualizar campo activo a false
    const libroEliminado = await Libro.findOneAndUpdate(
      { _id: id, activo: true },
      { 
        activo: false, 
        disponible: false,
        actualizadoPor: usuario._id
      },
      { new: true }
    );
    
    if (!libroEliminado) {
      throw new Error('Libro no encontrado');
    }
    
    return { mensaje: 'Libro eliminado correctamente', libro: libroEliminado };
  } catch (error) {
    throw new Error(`Error al eliminar el libro: ${error.message}`);
  }
};

/**
 * Acción para buscar libros por texto
 * @param {String} texto - Texto a buscar
 * @returns {Promise<Array>} Libros que coinciden con la búsqueda
 */
const buscarLibros = async (texto) => {
  try {
    return await Libro.find(
      { 
        $text: { $search: texto },
        activo: true
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);
  } catch (error) {
    throw new Error(`Error en la búsqueda de libros: ${error.message}`);
  }
};

/**
 * Acción para actualizar el inventario de un libro
 * @param {String} id - ID del libro
 * @param {Number} cantidad - Cantidad a añadir (positivo) o quitar (negativo)
 * @param {Object} usuario - Usuario que realiza la actualización
 * @returns {Promise<Object>} El libro actualizado
 */
const actualizarInventario = async (id, cantidad, usuario) => {
  try {
    // Validar que la cantidad sea un número
    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum)) {
      throw new Error('La cantidad debe ser un número');
    }
    
    // Utilizar el método estático creado para actualizar disponibilidad
    const libroActualizado = await Libro.actualizarDisponibilidad(id, cantidadNum);
    
    // Actualizar el usuario que hizo el cambio
    await Libro.findByIdAndUpdate(id, { actualizadoPor: usuario._id });
    
    return libroActualizado;
  } catch (error) {
    throw new Error(`Error al actualizar inventario: ${error.message}`);
  }
};

module.exports = {
  crearLibro,
  obtenerLibros,
  obtenerLibroPorId,
  actualizarLibro,
  eliminarLibro,
  buscarLibros,
  actualizarInventario
};
