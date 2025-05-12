const libroAction = require('../actions/libro.action');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller para manejar las peticiones relacionadas con libros
 */
const libroController = {
  /**
   * Crear un nuevo libro
   */
  crearLibro: async (req, res) => {
    try {
      const nuevoLibro = await libroAction.crearLibro(req.body, req.usuario);
      const response = ApiResponse.success(nuevoLibro, 'Libro creado correctamente', 201);
      res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ApiResponse.error(error.message, 400);
      res.status(response.statusCode).json(response);
    }
  },

  /**
   * Obtener todos los libros con filtros
   */
  obtenerLibros: async (req, res) => {
    try {
      // Extraer parámetros de consulta para filtrado y paginación
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
      } = req.query;
      
      // Opciones de filtrado
      const opciones = {
        titulo,
        autor,
        genero,
        editorial,
        anioDesde,
        anioHasta,
        activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
        disponible: disponible === 'true' ? true : disponible === 'false' ? false : undefined,
        cantidadDisponible: cantidadDisponible ? parseInt(cantidadDisponible) : undefined,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      };
      
      const resultado = await libroAction.obtenerLibros(opciones);
      
      const response = ApiResponse.success({
        count: resultado.paginacion.total,
        items: resultado.libros,
        paginacion: resultado.paginacion
      }, 'Libros obtenidos correctamente');
      
      res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ApiResponse.error(error.message);
      res.status(response.statusCode).json(response);
    }
  },

  /**
   * Obtener un libro por ID
   */
  obtenerLibroPorId: async (req, res) => {
    try {
      const libro = await libroAction.obtenerLibroPorId(req.params.id);
      const response = ApiResponse.success(libro, 'Libro encontrado correctamente');
      res.status(response.statusCode).json(response);
    } catch (error) {
      if (error.message === 'Libro no encontrado') {
        const response = ApiResponse.notFound('Libro no encontrado');
        return res.status(response.statusCode).json(response);
      }
      const response = ApiResponse.error(error.message);
      res.status(response.statusCode).json(response);
    }
  },

  /**
   * Actualizar un libro
   */
  actualizarLibro: async (req, res) => {
    try {
      const libroActualizado = await libroAction.actualizarLibro(req.params.id, req.body, req.usuario);
      const response = ApiResponse.success(libroActualizado, 'Libro actualizado correctamente');
      res.status(response.statusCode).json(response);
    } catch (error) {
      if (error.message === 'Libro no encontrado') {
        const response = ApiResponse.notFound('Libro no encontrado');
        return res.status(response.statusCode).json(response);
      }
      const response = ApiResponse.error(error.message, 400);
      res.status(response.statusCode).json(response);
    }
  },

  /**
   * Eliminar un libro (soft delete)
   */
  eliminarLibro: async (req, res) => {
    try {
      const resultado = await libroAction.eliminarLibro(req.params.id, req.usuario);
      const response = ApiResponse.success(resultado, 'Libro eliminado correctamente');
      res.status(response.statusCode).json(response);
    } catch (error) {
      if (error.message === 'Libro no encontrado') {
        const response = ApiResponse.notFound('Libro no encontrado');
        return res.status(response.statusCode).json(response);
      }
      const response = ApiResponse.error(error.message);
      res.status(response.statusCode).json(response);
    }
  },
  
  /**
   * Buscar libros por texto
   */
  buscarLibros: async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        const response = ApiResponse.error('Se requiere un término de búsqueda', 400);
        return res.status(response.statusCode).json(response);
      }
      
      const libros = await libroAction.buscarLibros(q);
      
      const response = ApiResponse.success({
        count: libros.length,
        items: libros
      }, 'Búsqueda realizada correctamente');
      
      res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ApiResponse.error(error.message);
      res.status(response.statusCode).json(response);
    }
  },
  
  /**
   * Actualizar el inventario de un libro
   */
  actualizarInventario: async (req, res) => {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;
      
      if (!cantidad) {
        const response = ApiResponse.error('La cantidad es requerida', 400);
        return res.status(response.statusCode).json(response);
      }
      
      const libroActualizado = await libroAction.actualizarInventario(id, cantidad, req.usuario);
      
      const mensaje = parseInt(cantidad) > 0 
        ? `Se añadieron ${cantidad} unidades al inventario` 
        : `Se retiraron ${Math.abs(cantidad)} unidades del inventario`;
      
      const response = ApiResponse.success(libroActualizado, mensaje);
      res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ApiResponse.error(error.message, 400);
      res.status(response.statusCode).json(response);
    }
  },
};

module.exports = libroController;
